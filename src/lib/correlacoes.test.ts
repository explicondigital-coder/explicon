import { describe, expect, test } from "bun:test";
import {
  agruparPorItemLc,
  classificarCodigoItem,
  rotuloCodigoItem,
  separarCorrelacoesPorNbs,
  type Correlacao,
} from "./correlacoes";

function criar(parcial: Partial<Correlacao> & Pick<Correlacao, "id">): Correlacao {
  return {
    id: parcial.id,
    item_lc: parcial.item_lc ?? "17.19",
    descricao_lc:
      parcial.descricao_lc ?? "Contabilidade, Inclusive Serviços Técnicos E Auxiliares.",
    nbs: parcial.nbs ?? null,
    descricao_nbs: parcial.descricao_nbs ?? null,
    indop: parcial.indop ?? "100301",
    cclasstrib: parcial.cclasstrib ?? "200052",
    nome_cclasstrib:
      parcial.nome_cclasstrib ?? "Prestação de serviços de profissões intelectuais",
    cst: parcial.cst ?? "200",
    descricao_cst: parcial.descricao_cst ?? "Alíquota reduzida em 30%",
    reducao_aliquota: parcial.reducao_aliquota ?? "Redução de Alíquota: 30%",
    base_legal: parcial.base_legal ?? null,
    observacoes: parcial.observacoes ?? null,
    palavras_chave: parcial.palavras_chave ?? null,
    ps_onerosa: parcial.ps_onerosa ?? null,
    adq_exterior: parcial.adq_exterior ?? null,
    local_incidencia_ibs: parcial.local_incidencia_ibs ?? "Domicílio principal do adquirente",
  };
}

describe("Tax Link — organização fiscal dos resultados", () => {
  test("mantém múltiplos NBS do mesmo Item LC como correlações separadas", () => {
    const registros = [
      criar({ id: "1", nbs: "1.1302.21.00", descricao_nbs: "Serviços de contabilidade" }),
      criar({ id: "2", nbs: "1.1302.22.00", descricao_nbs: "Serviços de escrituração mercantil" }),
      criar({ id: "3", nbs: "1.1302.23.00", descricao_nbs: "Serviços de folha de pagamento" }),
    ];

    const grupos = agruparPorItemLc(registros);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.registros).toHaveLength(3);

    const separados = separarCorrelacoesPorNbs(grupos[0]!.registros);
    expect(separados.correlacoesPrincipais).toHaveLength(3);
    expect(separados.tratamentosAdicionais).toHaveLength(0);
  });

  test("registro sem NBS nunca entra como correlação NBS confirmada", () => {
    const registros = [
      criar({ id: "principal", nbs: "1.1302.21.00" }),
      criar({
        id: "condicional",
        nbs: null,
        cclasstrib: "200043",
        nome_cclasstrib: "Fornecimento à administração pública em hipótese específica",
      }),
    ];

    const separados = separarCorrelacoesPorNbs(registros);
    expect(separados.correlacoesPrincipais.map((r) => r.id)).toEqual(["principal"]);
    expect(separados.tratamentosAdicionais.map((r) => r.id)).toEqual(["condicional"]);
  });

  test("NBS vazio ou composto apenas por espaços é tratamento adicional", () => {
    const registros = [
      criar({ id: "vazio", nbs: "" }),
      criar({ id: "espacos", nbs: "   " }),
    ];

    const separados = separarCorrelacoesPorNbs(registros);
    expect(separados.correlacoesPrincipais).toHaveLength(0);
    expect(separados.tratamentosAdicionais).toHaveLength(2);
  });

  test("classifica Item LC 116 e categorias internas 99.* sem misturar os conceitos", () => {
    expect(classificarCodigoItem("17.19")).toBe("lc116");
    expect(rotuloCodigoItem("17.19")).toBe("Item LC 116");

    expect(classificarCodigoItem("99.03.02")).toBe("interno");
    expect(rotuloCodigoItem("99.03.02")).toBe("Categoria interna Explicon");

    expect(classificarCodigoItem("advocacia")).toBe("nao_padronizado");
    expect(classificarCodigoItem(null)).toBe("ausente");
  });
});
