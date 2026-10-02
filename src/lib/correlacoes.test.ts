import { describe, expect, test } from "bun:test";
import {
  agruparPorItemLc,
  classificarCodigoItem,
  classificarTratamentoAdicional,
  rotuloCodigoItem,
  rotuloTratamentoAdicional,
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
  test("contabilidade mantém os 3 NBS como cartões separados", () => {
    const registros = [
      criar({ id: "1", nbs: "1.1302.21.00", descricao_nbs: "Serviços de contabilidade" }),
      criar({ id: "2", nbs: "1.1302.22.00", descricao_nbs: "Serviços de escrituração mercantil" }),
      criar({ id: "3", nbs: "1.1302.23.00", descricao_nbs: "Serviços de folha de pagamento" }),
    ];

    const grupos = agruparPorItemLc(registros);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.itemLc).toBe("17.19");
    expect(grupos[0]?.registros).toHaveLength(3);

    const separados = separarCorrelacoesPorNbs(grupos[0]!.registros);
    expect(separados.correlacoesPrincipais.map((r) => r.nbs)).toEqual([
      "1.1302.21.00",
      "1.1302.22.00",
      "1.1302.23.00",
    ]);
    expect(separados.tratamentosAdicionais).toHaveLength(0);
  });

  test("fisioterapia separa 2 NBS confirmados de 1 tratamento adicional", () => {
    const registros = [
      criar({
        id: "fisio",
        item_lc: "04.08",
        nbs: "1.2301.92.00",
        descricao_nbs: "Serviços de fisioterapia",
        cclasstrib: "200029",
        cst: "200",
        reducao_aliquota: "Redução de Alíquota: 60%",
        local_incidencia_ibs: "local da prestação",
      }),
      criar({
        id: "saude-outros",
        item_lc: "04.08",
        nbs: "1.2301.99.00",
        descricao_nbs: "Outros serviços de saúde humana não classificados em subposições anteriores",
        cclasstrib: "200029",
        cst: "200",
        reducao_aliquota: "Redução de Alíquota: 60%",
        local_incidencia_ibs: "local da prestação",
      }),
      criar({
        id: "regra-adicional",
        item_lc: "04.08",
        nbs: null,
        descricao_nbs: null,
        indop: "030102",
        cclasstrib: "200029",
        cst: "200",
        reducao_aliquota: "Redução de Alíquota: 60%",
        local_incidencia_ibs: "local da prestação",
      }),
    ];

    const separados = separarCorrelacoesPorNbs(registros);
    expect(separados.correlacoesPrincipais).toHaveLength(2);
    expect(separados.tratamentosAdicionais).toHaveLength(1);
    expect(separados.tratamentosAdicionais[0]?.id).toBe("regra-adicional");
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

  test("variações sem NBS com descrições distintas não são tratadas como duplicatas de apresentação", () => {
    const registros = [
      criar({
        id: "residencial",
        item_lc: "99.03.02",
        nbs: null,
        descricao_lc: "Cessão Onerosa de Bens Imóveis",
        descricao_nbs: "Cessão Onerosa de Bens Imóveis residenciais",
        cclasstrib: "200027",
        reducao_aliquota: "Redução de Alíquota: 70%",
      }),
      criar({
        id: "nao-residencial",
        item_lc: "99.03.02",
        nbs: null,
        descricao_lc: "Cessão Onerosa de Bens Imóveis",
        descricao_nbs: "Cessão Onerosa de Bens Imóveis não residenciais",
        cclasstrib: "200027",
        reducao_aliquota: "Redução de Alíquota: 70%",
      }),
    ];

    const separados = separarCorrelacoesPorNbs(registros);
    expect(separados.tratamentosAdicionais).toHaveLength(2);
    expect(new Set(separados.tratamentosAdicionais.map((r) => r.descricao_nbs)).size).toBe(2);
  });

  test("classifica tratamentos sem NBS sem inferir além dos campos armazenados", () => {
    const integral = criar({
      id: "integral",
      nbs: null,
      cst: "000",
      cclasstrib: "000001",
      reducao_aliquota: null,
    });
    const reduzido = criar({
      id: "reduzido",
      nbs: null,
      cst: "200",
      cclasstrib: "200029",
      reducao_aliquota: "Redução de Alíquota: 60%",
    });
    const especifico = criar({
      id: "especifico",
      nbs: null,
      cst: "820",
      cclasstrib: "820007",
      reducao_aliquota: null,
    });

    expect(classificarTratamentoAdicional(integral)).toBe("tributacao_integral");
    expect(rotuloTratamentoAdicional(integral)).toContain("Tratamento padrão");

    expect(classificarTratamentoAdicional(reduzido)).toBe("reducao");
    expect(rotuloTratamentoAdicional(reduzido)).toContain("redução");

    expect(classificarTratamentoAdicional(especifico)).toBe("regime_especifico");
    expect(rotuloTratamentoAdicional(especifico)).toContain("Regime específico");
  });
});
