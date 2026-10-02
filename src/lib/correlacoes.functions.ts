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

type BuscaAgrupadaPayload = {
  total_registros?: number;
  total_itens?: number;
  registros?: Correlacao[];
};

export const buscarCorrelacoes = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => buscaSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const offsetItens = (data.pagina - 1) * data.porPagina;

    const args: Record<string, string | number> = {
      _q: data.q,
      _ordenar: data.ordenar,
      _limit_itens: data.porPagina,
      _offset_itens: offsetItens,
    };
    if (data.item_lc) args["_item_lc"] = data.item_lc;
    if (data.nbs) args["_nbs"] = data.nbs;
    if (data.indop) args["_indop"] = data.indop;
    if (data.cclasstrib) args["_cclasstrib"] = data.cclasstrib;
    if (data.base_legal) args["_base_legal"] = data.base_legal;

    const { data: rpcData, error } = await supabase.rpc(
      "buscar_correlacoes_paginada_v2",
      args as unknown as Record<string, never>,
    );
    if (error) throw new Error(error.message);

    const payload = (rpcData ?? {}) as BuscaAgrupadaPayload;
    const totalRegistros = Number(payload.total_registros ?? 0);
    const totalItens = Number(payload.total_itens ?? 0);
    const registros = Array.isArray(payload.registros) ? payload.registros : [];

    // Registra apenas a primeira página de cada pesquisa para evitar duplicidade
    // quando o usuário navega pelas páginas do mesmo termo.
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
      total: totalItens,
      totalItens,
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
    const { data: rowsV2, error: errorV2 } = await supabase.rpc("sugerir_correlacoes_v2", {
      _q: data.q,
      _limit: 8,
    });

    if (!errorV2) {
      return { sugestoes: rowsV2 ?? [] };
    }

    // Fallback temporário para permitir implantação gradual caso a migration v2
    // ainda não tenha sido aplicada.
    const { data: rowsLegado, error: errorLegado } = await supabase.rpc("sugerir_correlacoes", {
      _q: data.q,
      _limit: 8,
    });
    if (errorLegado) throw new Error(errorLegado.message);
    return { sugestoes: rowsLegado ?? [] };
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

export const obterOpcoesFiltro = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("correlacoes")
    .select("item_lc,nbs,indop,cclasstrib,base_legal")
    .limit(20000);
  if (error) throw new Error(error.message);
  const unicos = (chave: "item_lc" | "nbs" | "indop" | "cclasstrib" | "base_legal") =>
    [...new Set((data ?? []).map((r) => r[chave]).filter((v): v is string => Boolean(v)))]
      .sort()
      .slice(0, 500);
  return {
    itensLc: unicos("item_lc"),
    nbs: unicos("nbs"),
    indop: unicos("indop"),
    cclasstrib: unicos("cclasstrib"),
    baseLegal: unicos("base_legal"),
  };
});

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
