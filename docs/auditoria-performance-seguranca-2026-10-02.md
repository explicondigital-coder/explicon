# Explicon Tax Link — auditoria de performance e segurança

Data: 2026-10-02

## Performance de busca — base atual

### Termo: contabilidade
- resultados: 3
- plano: Bitmap Index Scan + Bitmap Heap Scan
- índice utilizado: `correlacoes_search_text_trgm_idx`
- execução medida: aproximadamente **7,3 ms**

### Termo: locacao
- resultados encontrados na base: 81
- limite consultado: 50
- índice utilizado: `correlacoes_search_text_trgm_idx`
- execução medida: aproximadamente **4,4 ms**

## Benchmark sintético acima de 20 mil registros

Foi criada tabela **temporária e descartável** a partir da base existente, repetindo os 1.157 registros 20 vezes:

- volume: **23.140 linhas**
- índice trigram criado na tabela temporária
- nenhuma alteração persistente na produção

### contabilidade
- execução: aproximadamente **1,4 ms**
- índice trigram utilizado

### locacao
- aproximadamente 1.620 correspondências no conjunto sintético
- execução: aproximadamente **17,3 ms**
- índice trigram utilizado

### Conclusão de performance

A estratégia de pesquisa baseada em `search_text` + GIN trigram suporta o alvo de mais de 20 mil linhas com ampla margem no teste de banco.

Limitação: estes números medem PostgreSQL, não incluem latência de rede, renderização React, RPC e tempo do navegador. O teste end-to-end continuará no gate de deploy.

## Segurança — estado atual observado

### Correlações
- `anon` pode SELECT em `correlacoes`;
- RLS público permite leitura;
- comportamento esperado para a ferramenta pública.

### Consultas
- `anon` não possui SELECT efetivo em `consultas_log`;
- INSERT direto ainda está permitido atualmente;
- RPC `registrar_consulta` também é pública.

Migration preparada remove INSERT direto e mantém somente RPC validada.

### Leads
- ACL atual contém grant SELECT para `anon`;
- RLS não possui policy SELECT para anon;
- teste efetivo como role `anon` retornou **0 leads visíveis**;
- apesar da proteção efetiva por RLS, o grant de tabela é desnecessário.

Migration preparada agora inclui:
- REVOKE SELECT FROM anon;
- REVOKE INSERT direto;
- envio somente via RPC validada/deduplicada.

### Helpers de autorização

Estado atual:
- `authenticated` não possui EXECUTE em `can_edit(uuid)`;
- `authenticated` não possui EXECUTE em `has_role(uuid, app_role)`;
- policies atuais ainda referenciam essas funções.

Isso cria risco de falha das operações protegidas de editor/admin.

Migration preparada substitui esse padrão por:
- `current_user_can_edit()`;
- `current_user_is_admin()`;
- uso exclusivo de `auth.uid()`;
- EXECUTE concedido apenas a `authenticated` e `service_role`;
- policies recriadas para usar os novos helpers.

## Status

As falhas identificadas estão **corrigidas em migrations preparadas no GitHub**, mas ainda não aplicadas na produção.

A validação final exige:
1. ambiente de teste;
2. aplicar migrations na ordem do runbook;
3. testar anon, leitor, editor e admin;
4. executar `security_post_migration.sql`;
5. somente então liberar para produção.
