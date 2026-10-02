# Tax Link — novo layout de resultados

## Objetivo

Substituir a tabela horizontal de resultados por cartões individuais por correlação **NBS ↔ Item LC 116**.

### Campos do cartão

**Topo**
- NBS
- Item LC 116

**Informações Básicas**
- Descrição NBS
- Descrição do Item
- Local de Incidência IBS
- CST

**Informações Tributárias**
- cClassTrib
- Nome cClassTrib
- Redução de Alíquota

## Regra para registros sem NBS

Registros sem NBS não devem ser tratados como correlação NBS confirmada. Eles aparecem em bloco separado:

**Tratamentos tributários adicionais — verificar aplicabilidade**

Isso evita apresentar benefícios condicionais como se fossem válidos automaticamente para todo o serviço.

## Decisões confirmadas

- Aplicar o padrão a todos os serviços.
- Múltiplos NBS geram múltiplos cartões.
- Campo vazio deve aparecer como **Não informado**.
- Preservar favoritos e “Ver detalhes”.
- Preservar página individual por Item LC.
- Não alterar banco nem dados fiscais nesta etapa.
- Não inventar Base Legal ou Observações.
- **Não exibir por enquanto IBS 2026 0,10% e CBS 2026 0,90%.**

## Exemplo esperado

Busca: Contabilidade

- NBS 1.1302.21.00
- Item LC 116 17.19
- Descrição NBS: Serviços de contabilidade
- CST 200
- cClassTrib 200052
- Redução de Alíquota: 30%

Os dados reais devem sempre vir da base do Tax Link.
