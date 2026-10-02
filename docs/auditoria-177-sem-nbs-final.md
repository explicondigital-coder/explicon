# Auditoria dos 177 registros sem NBS

Data: 2026-10-02

## Resumo
- Total sem NBS: 177
- Em Itens LC 116: 162 registros / 104 códigos
- Em categorias internas 99.*: 15 registros / 8 códigos
- Com descrição associada no campo descricao_nbs: 15
- Sem descrição associada: 162
- Com redução informada: 96
- Sem redução informada: 81

## Classificação por dados armazenados
A apresentação foi estruturada sem inferir enquadramento além do que já existe na base.

- Tributação integral / padrão: 80 registros (CST 000 / cClassTrib 000001 / sem redução)
- Tratamentos com redução: 96 registros
- Regime específico financeiro: 1 registro (CST 820 / cClassTrib 820007)

Rótulos no frontend:
- Tratamento padrão — verificar aplicabilidade
- Tratamento específico com redução — verificar aplicabilidade
- Regime específico — verificar aplicabilidade
- Tratamento tributário adicional — verificar aplicabilidade (fallback)

## Itens com maior multiplicidade de regras sem NBS
Casos que devem entrar no QA manual:
- 08.01 — 5 regras; cClassTrib 200025 e 200028
- 08.02 — 5 regras; cClassTrib 000001 e 200028
- 12.12 — 5 regras; cClassTrib 000001 e 200039
- 12.14 — 5 regras; cClassTrib 000001 e 200039
- 12.11 — 4 regras; cClassTrib 000001 e 200042
- 03.05 — 3 regras; cClassTrib 000001 e 200039
- 05.04 — 3 regras; cClassTrib 000001 e 200038
- 06.04 — 3 regras; cClassTrib 000001 e 200041
- 07.16 — 3 regras; cClassTrib 000001 e 200037
- 12.02 — 3 regras; cClassTrib 000001 e 200039
- 38.01 — 3 regras; cClassTrib 000001 e 200052
- 39.01 — 3 regras; cClassTrib 000001
- 99.04.01 — 3 regras; cClassTrib 000001

## Regras concorrentes relevantes
Também merecem QA:
- 01.01, 01.02, 01.04, 01.06 — 200043 / 200044
- 05.01 — 200038 / 200052
- 07.02 — 200038 / 200045
- 07.03 — 200045 / 200052
- 07.05 — 200038 / 200045
- 14.01 e 14.02 — 000001 / 200044
- 29.01 — 000001 / 200052
- 99.03.01 — 200026 / 200048

## Regra de apresentação
Nenhum registro sem NBS deve ser promovido a cartão NBS confirmado.

Quando descricao_nbs estiver preenchida sem código NBS, essa descrição deve permanecer visível como variante/descrição associada para evitar que registros distintos pareçam duplicados.

## Limitação
Esta auditoria classifica os registros pela estrutura já armazenada (CST, cClassTrib, redução e descrição). Ela não substitui validação legal externa das condições materiais de aplicabilidade de cada tratamento.
