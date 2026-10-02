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
  porPagina: z.number().int().min(1).max(200).default(50),
});

export const buscarCorrelacoes = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => buscaSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const offset = (data.pagina - 1) * data.porPagina;
    const args: Record<string, string | number> = {
      _q: data.q,
      _ordenar: data.ordenar,
      _limit: data.porPagina,
      _offset: offset,
    };
    if (data.item_lc) args["_item_lc"] = data.item_lc;
    if (data.nbs) args["_nbs"] = data.nbs;
    if (data.indop) args["_indop"] = data.indop;
    if (data.cclasstrib) args["_cclasstrib"] = data.cclasstrib;
    if (data.base_legal) args["_base_legal"] = data.base_legal;
    const { data: rows, error } = await supabase.rpc(
      "buscar_correlacoes",
      args as unknown as Record<string, never>,
    );
    if (error) throw new Error(error.message);
    const lista = (rows ?? []) as Array<Correlacao & { total_count: number }>;
    const total = lista.length > 0 ? Number(lista[0]!.total_count) : 0;
    return {
      total,
      pagina: data.pagina,
      porPagina: data.porPagina,
      registros: lista.map(({ total_count: _t, ...r }) => r as Correlacao),
    };
  });

export const sugerirCorrelacoes = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ q: z.string().max(120) }).parse(input))
  .handler(async ({ data }) => {
    if (data.q.trim().length < 2) return { sugestoes: [] };
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
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
    z.object({ termo: z.string().max(200), resultados: z.number().int().min(0).max(1000000) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!data.termo.trim()) return { ok: true };
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    await supabase.rpc("registrar_consulta", { _termo: data.termo, _resultados: data.resultados });
    return { ok: true };
  });

export const obterEstatisticas = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  // Logs de consulta não são legíveis publicamente: agregamos no servidor e
  // expomos apenas números/termos agregados.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ count: totalRegistros }, { count: totalConsultas }] = await Promise.all([
    supabase.from("correlacoes").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("consultas_log").select("id", { count: "exact", head: true }),
  ]);

  const { data: consultas } = await supabaseAdmin
    .from("consultas_log")
    .select("termo")
    .order("created_at", { ascending: false })
    .limit(1000);

  const contagem = new Map<string, number>();
  for (const c of consultas ?? []) {
    const termo = c.termo.trim().toLowerCase();
    contagem.set(termo, (contagem.get(termo) ?? 0) + 1);
  }
  const maisPesquisados = [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([termo, total]) => ({ termo, total }));

  const { data: linhas } = await supabase
    .from("correlacoes")
    .select("item_lc,descricao_lc,nbs")
    .limit(20000);

  const porItem = new Map<string, { descricao: string | null; total: number }>();
  const porNbs = new Map<string, number>();
  for (const l of linhas ?? []) {
    if (l.item_lc) {
      const atual = porItem.get(l.item_lc);
      porItem.set(l.item_lc, {
        descricao: atual?.descricao ?? l.descricao_lc,
        total: (atual?.total ?? 0) + 1,
      });
    }
    if (l.nbs) porNbs.set(l.nbs, (porNbs.get(l.nbs) ?? 0) + 1);
  }

  return {
    totalRegistros: totalRegistros ?? 0,
    totalConsultas: totalConsultas ?? 0,
    totalItensLc: porItem.size,
    totalNbs: porNbs.size,
    maisPesquisados,
    itensLcTop: [...porItem.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([itemLc, v]) => ({ itemLc, descricao: v.descricao, total: v.total })),
    nbsTop: [...porNbs.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nbs, total]) => ({ nbs, total })),
  };
});