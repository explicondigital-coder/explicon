# Explicon Tax Link — auditoria técnica da base

Data da auditoria: 2026-10-02  
Fonte: banco Supabase conectado ao projeto Lovable Explicon Tax Link  
Modo: somente leitura

## Resumo

- Registros totais: **1.157**
- IDs únicos: **1.157**
- Registros com NBS: **980**
- Registros sem NBS: **177**
- Base Legal preenchida: **0**
- Observações preenchidas: **0**
- Conflitos de CST/cClassTrib em correlações com NBS: **0**
- Divergências entre CST e os três primeiros dígitos do cClassTrib: **0**
- Duplicidades semânticas reais, considerando todos os campos fiscais relevantes: **0**

## Cobertura dos cartões principais

Dos **980 registros que possuem NBS**, todos têm preenchidos:

- Descrição NBS: 980/980
- Descrição do item/categoria: 980/980
- Local de incidência IBS: 980/980
- CST: 980/980
- cClassTrib: 980/980
- Nome cClassTrib: 980/980

Em **655/980** não há redução de alíquota preenchida. O frontend deve mostrar **“Não informado”** e nunca inferir percentual.

## Registros sem NBS

Total: **177**

- Itens LC 116: **162 registros em 104 códigos**
- Categorias internas 99.*: **15 registros em 8 códigos**

Esses registros devem aparecer no bloco:

> Tratamentos tributários adicionais — verificar aplicabilidade

A ausência de NBS não é automaticamente um erro. Há casos em que o registro representa regra/hipótese tributária adicional.

## Códigos internos 99.*

Foram identificadas 8 categorias internas:

- 99.01.01 — Outros serviços sem a incidência de ISSQN e ICMS.
- 99.02.01 — Operação com Bens Imateriais não classificados em itens anteriores
- 99.03.01 — Locação de Bens Imóveis
- 99.03.02 — Cessão Onerosa de Bens Imóveis
- 99.03.03 — Arrendamento de Bens Imóveis
- 99.03.04 — Servidão/Cessão de uso ou espaço de bens imóveis
- 99.03.05 — Permissão de uso ou direito de passagem de bens imóveis
- 99.04.01 — Locação de Bens Móveis

Esses códigos **não devem ser rotulados como Item LC 116**. O frontend passa a exibi-los como **Categoria interna Explicon**.

## Duplicidades aparentes

Uma checagem simplificada encontrou quatro pares com mesmo item, INDOP, CST e cClassTrib em 99.03.02 a 99.03.05.

Após comparar todos os campos, concluiu-se que **não são duplicidades reais**. Cada par diferencia:

- residencial
- não residencial

na descrição associada ao tratamento.

Nenhuma exclusão deve ser feita.

## Casos de regressão validados

### Contabilidade

Busca: `contabilidade`

- Item LC 116: 17.19
- 3 NBS distintos
- 1.1302.21.00 — Serviços de contabilidade
- 1.1302.22.00 — Serviços de escrituração mercantil
- 1.1302.23.00 — Serviços de folha de pagamento
- CST: 200
- cClassTrib: 200052
- redução: 30%
- local IBS: Domicílio principal do adquirente

### Fisioterapia

Item LC 116: 04.08

- 2 NBS confirmados
- 1 registro adicional sem NBS
- CST: 200
- cClassTrib: 200029
- redução: 60%
- local IBS: local da prestação

O registro sem NBS deve ficar separado dos cartões NBS.

### Advocacia

A base atual contém 5 registros com `item_lc = advocacia`. Foi preparada migration defensiva para alterar para 17.14 somente se os mesmos cinco registros continuarem presentes e não existir previamente 17.14.

## Smoke tests de busca atuais

- `contabilidade`: 3 registros, 1 item, 3 NBS
- `fisioterapia`: 3 registros, 1 item, 2 NBS
- `advocacia`: 5 registros, 1 agrupamento, 5 NBS
- `1.1302.21.00`: 1 registro, 1 item, 1 NBS
- `programacao`: 15 registros, 3 itens, 13 NBS
- `locacao`: 81 registros, 15 agrupamentos, 44 NBS

## Pendências deliberadas

- Base Legal ainda não possui dados validados.
- Observações ainda não possuem dados.
- IBS 2026 0,10% e CBS 2026 0,90% permanecem fora do cartão.
- Migrations preparadas não foram aplicadas em produção.
