export interface Correlacao {
  id: string;
  item_lc: string | null;
  descricao_lc: string | null;
  nbs: string | null;
  descricao_nbs: string | null;
  indop: string | null;
  cclasstrib: string | null;
  nome_cclasstrib: string | null;
  cst: string | null;
  descricao_cst: string | null;
  reducao_aliquota: string | null;
  base_legal: string | null;
  observacoes: string | null;
  palavras_chave: string | null;
  ps_onerosa: string | null;
  adq_exterior: string | null;
  local_incidencia_ibs: string | null;
}

export interface GrupoItemLc {
  itemLc: string;
  descricao: string | null;
  registros: Correlacao[];
}

export interface SeparacaoCorrelacoes {
  correlacoesPrincipais: Correlacao[];
  tratamentosAdicionais: Correlacao[];
}

export const ORDENACOES = [
  { value: "item_lc", label: "Item LC" },
  { value: "nbs", label: "NBS" },
  { value: "alfabetica", label: "Ordem alfabética" },
] as const;

export function itemLcParaSlug(itemLc: string): string {
  return itemLc.trim().replace(/\./g, "-").replace(/\s+/g, "-").toLowerCase();
}

export function slugParaItemLc(slug: string): string {
  return slug.trim().replace(/-/g, ".");
}

export function agruparPorItemLc(registros: Correlacao[]): GrupoItemLc[] {
  const grupos = new Map<string, GrupoItemLc>();
  for (const r of registros) {
    const chave = r.item_lc ?? "—";
    const existente = grupos.get(chave);
    if (existente) {
      existente.registros.push(r);
    } else {
      grupos.set(chave, { itemLc: chave, descricao: r.descricao_lc, registros: [r] });
    }
  }
  return [...grupos.values()];
}

export function separarCorrelacoesPorNbs(registros: Correlacao[]): SeparacaoCorrelacoes {
  return registros.reduce<SeparacaoCorrelacoes>(
    (acc, registro) => {
      if (registro.nbs?.trim()) {
        acc.correlacoesPrincipais.push(registro);
      } else {
        acc.tratamentosAdicionais.push(registro);
      }
      return acc;
    },
    { correlacoesPrincipais: [], tratamentosAdicionais: [] },
  );
}

export function correlacaoParaTexto(c: Correlacao): string {
  const linhas: Array<[string, string | null]> = [
    ["Item LC 116", c.item_lc],
    ["Descrição do Item LC", c.descricao_lc],
    ["NBS", c.nbs],
    ["Descrição NBS", c.descricao_nbs],
    ["INDOP", c.indop],
    ["CClassTrib", c.cclasstrib],
    ["Nome CClassTrib", c.nome_cclasstrib],
    ["CST", c.cst],
    ["Descrição CST", c.descricao_cst],
    ["Local de incidência IBS", c.local_incidencia_ibs],
    ["Prestação onerosa", c.ps_onerosa],
    ["Adquirido no exterior", c.adq_exterior],
    ["Base legal", c.base_legal],
    ["Observações", c.observacoes],
  ];
  const texto = linhas
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return c.reducao_aliquota ? `${texto}\n${c.reducao_aliquota}` : texto;
}
