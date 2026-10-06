import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Correlacao } from "./correlacoes";

const buscaSchema = z.object({
  q: z.string().max(200).default(""),
  item_lc: z.string().max(50).nullable().default(null),
  nbs: z.string().max(50).nullable().default(null),
  indop: z.string().max(50).nullable().default(null),
  cclasstrib: z.string().max(50).nullable().default(null),
  base_legal: z.string().max(200).nullable().default(null),
  ordenar: z.enum(["item_lc", "nbs", "alfabetica"]).default("item_lc"),
  pagina: z.number().int().min(1).max(500).default(1),
  porPagina: z.number().int().min(1).max(50).default(10),
});

type CorrelacaoLegada = Correlacao & { total_count?: number | string | null };

/**
 * Performance note:
 * enquanto as migrations v2 ainda não estiverem aplicadas no Supabase,
 * use diretamente as RPCs legadas existentes. Isso evita uma chamada que
 * sabemos que falhará antes de fazer fallback, reduzindo latência e ruído.
 * Quando buscar_correlacoes_paginada_v2 / sugerir_correlacoes_v2 estiverem
 * disponíveis, podemos reativar as versões v2 em uma mudança controlada.
 */
export const buscarCorrelacoes = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => buscaSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const offset = (data.pagina - 1) * data.porPagina;

    const args: Record<string, string | number | null> = {
      _q: data.q,
      _item_lc: data.item_lc,
      _nbs: data.nbs,
      _indop: data.indop,
      _cclasstrib: data.cclasstrib,
      _base_legal: data.base_legal,
      _ordenar: data.ordenar,
      _limit: data.porPagina,
      _offset: offset,
    };

    const { data: rows, error } = await supabase.rpc(
      "buscar_correlacoes",
      args as unknown as Record<string, never>,
    );
    if (error) throw new Error(error.message);

    const registrosLegados = (rows ?? []) as CorrelacaoLegada[];
    const totalRegistros = Number(registrosLegados[0]?.total_count ?? registrosLegados.length);
    const registros = registrosLegados.map(({ total_count: _totalCount, ...registro }) => registro);

    if (data.pagina === 1 && data.q.trim()) {
      const { error: logError } = await supabase.rpc("registrar_consulta", {
        _termo: data.q,
        _resultados: totalRegistros,
      });
      if (logError) {
        console.warn("[Tax Link] Não foi possível registrar a consulta:", logError.message);
      }
    }

    return {
      total: totalRegistros,
      // Temporariamente o legado pagina por registro, não por grupo Item LC.
      // Após a migration v2, totalItens voltará a representar grupos completos.
      totalItens: totalRegistros,
      totalRegistros,
      pagina: data.pagina,
      porPagina: data.porPagina,
      registros,
    };
  });

export const sugerirCorrelacoes = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ q: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    if (data.q.trim().length < 2) return { sugestoes: [] };
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    // Usar diretamente a RPC existente enquanto a v2 não estiver migrada.
    // Evita request falho + fallback a cada digitação.
    const { data: rows, error } = await supabase.rpc("sugerir_correlacoes", {
      _q: data.q,
      _limit: 8,
    });
    if (error) throw new Error(error.message);
    return { sugestoes: rows ?? [] };
  });

export const obterItemLc = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ itemLc: z.string().max(50) }).parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("correlacoes")
      .select(
        "id,item_lc,descricao_lc,nbs,descricao_nbs,indop,cclasstrib,nome_cclasstrib,cst,descricao_cst,reducao_aliquota,base_legal,observacoes,palavras_chave,ps_onerosa,adq_exterior,local_incidencia_ibs",
      )
      .eq("item_lc", data.itemLc)
      .order("nbs", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { registros: (rows ?? []) as Correlacao[] };
  });

export const listarItensLc = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("correlacoes")
    .select("item_lc,descricao_lc")
    .not("item_lc", "is", null)
    .order("item_lc", { ascending: true })
    .limit(20000);
  if (error) throw new Error(error.message);
  const mapa = new Map<string, string | null>();
  for (const row of data ?? []) {
    if (row.item_lc && !mapa.has(row.item_lc)) mapa.set(row.item_lc, row.descricao_lc);
  }
  return { itens: [...mapa].map(([itemLc, descricao]) => ({ itemLc, descricao })) };
});

type FiltroRow = {
  item_lc: string | null;
  nbs: string | null;
  indop: string | null;
  cclasstrib: string | null;
};

type OpcoesFiltro = {
  itensLc: string[];
  nbs: string[];
  indop: string[];
  cclasstrib: string[];
  baseLegal: string[];
};

export const obterOpcoesFiltro = createServerFn({ method: "GET" }).handler(
  async (): Promise<OpcoesFiltro> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    // Base Legal permanece 100% vazia na base auditada. Não transportamos
    // essa coluna até existirem dados legais validados.
    const { data, error } = await supabase
      .from("correlacoes")
      .select("item_lc,nbs,indop,cclasstrib")
      .limit(20000);
    if (error) throw new Error(error.message);

    const linhas = (data ?? []) as FiltroRow[];
    const unicos = (chave: keyof FiltroRow): string[] =>
      [
        ...new Set(
          linhas
            .map((r) => r[chave])
            .filter((v): v is string => typeof v === "string" && v.length > 0),
        ),
      ]
        .sort()
        .slice(0, 500);

    return {
      itensLc: unicos("item_lc"),
      nbs: unicos("nbs"),
      indop: unicos("indop"),
      cclasstrib: unicos("cclasstrib"),
      baseLegal: [],
    };
  },
);

export const registrarConsulta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        termo: z.string().max(200),
        resultados: z.number().int().min(0).max(1000000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!data.termo.trim()) return { ok: true };
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { error } = await supabase.rpc("registrar_consulta", {
      _termo: data.termo,
      _resultados: data.resultados,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
