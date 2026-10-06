# Explicon Tax Link — auditoria dos 177 registros sem NBS

Data: 2026-10-02  
Método: comparação estrutural com os registros da própria tabela `correlacoes`.  
Importante: esta classificação **não atribui conclusão jurídica**. Ela mede apenas a relação entre cada regra sem NBS e as correlações com NBS já existentes.

## Resultado geral

Total sem NBS: **177**

### 1. Mesma cClassTrib no mesmo item, mas outro INDOP
- **99 registros**
- **70 itens/categorias**

Há registro(s) com NBS no mesmo item e mesma cClassTrib, mas o INDOP do registro sem NBS é diferente.

Interpretação de apresentação:
- manter como tratamento adicional;
- não herdar NBS;
- preservar INDOP visível nos detalhes;
- não converter automaticamente em correlação NBS.

### 2. Item possui NBS, mas a regra tributária é distinta
- **56 registros**
- **39 itens/categorias**

O item possui correlações NBS, porém o cClassTrib do registro sem NBS é diferente das correlações principais.

Exemplos estruturais:
- informática com hipóteses 200043 / 200044;
- construção com classificações específicas;
- educação;
- atividades artísticas;
- locação de bens imóveis;
- serviços profissionais específicos.

Interpretação de apresentação:
- manter em **Tratamentos tributários adicionais — verificar aplicabilidade**;
- nunca apresentar como benefício automático do NBS.

### 3. Mesma regra item + cClassTrib + INDOP já existe com NBS
- **13 registros**
- **12 itens/categorias**

Existe pelo menos um registro com NBS no mesmo item, mesma cClassTrib e mesmo INDOP.

Esses registros ainda devem permanecer separados na interface porque o banco não fornece evidência suficiente para atribuir a eles um NBS específico.

### 4. Item/categoria sem qualquer NBS
- **9 registros**
- **5 categorias**

Categorias:

- 99.01.01 — Outros serviços sem a incidência de ISSQN e ICMS — 1 registro
- 99.03.02 — Cessão Onerosa de Bens Imóveis — 2 registros
- 99.03.03 — Arrendamento de Bens Imóveis — 2 registros
- 99.03.04 — Servidão/Cessão de uso ou espaço de bens imóveis — 2 registros
- 99.03.05 — Permissão de uso ou direito de passagem de bens imóveis — 2 registros

Nos pares de 99.03.02 a 99.03.05, as linhas são **distintas**, não duplicadas:
- uma variante residencial;
- uma variante não residencial.

O frontend foi atualizado para exibir essa descrição/variante no cartão de tratamento adicional.

## Regra de apresentação consolidada

Para qualquer registro sem NBS:

1. não criar NBS por inferência;
2. não promover a linha a cartão de correlação NBS;
3. exibir no bloco **Tratamentos tributários adicionais — verificar aplicabilidade**;
4. mostrar descrição/variante associada quando existir;
5. preservar CST, cClassTrib, nome cClassTrib, redução e INDOP nos detalhes;
6. permitir futura complementação legal sem alterar a correlação principal.

## Conclusão

Os **177/177 registros sem NBS estão estruturalmente classificados**.

A pendência futura é jurídica/documental, não estrutural: determinar condições legais detalhadas de aplicabilidade e preencher Base Legal/Observações quando houver fonte validada.
