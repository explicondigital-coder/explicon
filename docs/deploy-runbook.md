# Explicon Tax Link — runbook de deploy e rollback

## Princípios

1. Nunca aplicar migrations preparadas diretamente em produção sem teste prévio.
2. Nunca publicar frontend que dependa de uma RPC ainda inexistente.
3. Nunca apagar registros da base apenas por semelhança estrutural.
4. Base Legal e Observações permanecem vazias até haver fonte validada.
5. IBS 2026 0,10% e CBS 2026 0,90% continuam fora dos cartões.

## Ordem recomendada

### Fase 1 — Sincronização
- Conectar o projeto Explicon Tax Link ao repositório GitHub correto.
- Comparar SHA do Lovable com o branch de integração.
- Resolver diferenças sem sobrescrever alterações do Lovable automaticamente.
- Restaurar os arquivos reais de integração Supabase que no workbench estão como stubs.

### Fase 2 — Ambiente de teste
Aplicar nesta ordem:

1. `20261002_rls_auth_helpers.sql`
2. `20261002_secure_query_logging.sql`
3. `20261002_secure_lead_submission.sql`
4. `20261002_busca_paginada_por_item.sql`
5. `20261002_autocomplete_relevancia.sql`
6. `20261002_fix_item_lc_advocacia_17_14.sql` somente após validação específica
7. `20261002_integridade_codigos.sql` somente depois da correção da Advocacia

Depois executar:
- `supabase/audits/tax_link_quality.sql`
- `supabase/audits/security_post_migration.sql`
- `supabase/audits/predeploy_assertions.sql`

Antes de continuar, revisar o GitHub Issue #2 sobre os cinco registros `ps_onerosa = advocacia`. A migration de integridade normaliza apenas `s` → `S` e deliberadamente não corrige esses cinco valores sem fonte.

### Fase 3 — Testes funcionais
Validar pelo menos:

- Contabilidade → 3 cartões NBS em 17.19
- Fisioterapia → 2 cartões NBS + 1 tratamento adicional
- Advocacia → 5 NBS e código 17.14 após migration
- Item 16.02 → todos os vínculos no mesmo grupo/página
- Item 07.02 → todos os vínculos no mesmo grupo/página
- Categoria 99.03.02 → rotulada como Categoria interna Explicon
- Categoria 99.04.01 → cartões NBS + tratamentos adicionais
- Busca sem resultado → log gerado
- Página 2 da mesma pesquisa → não gerar novo log da pesquisa
- Lead duplicado em menos de 15 min → retornar registro existente

### Fase 4 — Perfis e RLS
Testar:
- visitante anônimo
- usuário autenticado comum
- editor
- administrador

Confirmar:
- leitura pública de correlações funciona;
- visitante não lê leads/logs/papéis;
- editor consegue editar o permitido;
- admin consegue excluir quando aplicável.

### Fase 5 — Frontend
Executar:
- `bun test`
- `bunx tsc --noEmit`
- `bun run build`
- `bun run lint`

Validar em mobile, tablet e desktop.

### Fase 6 — Publicação
- Fazer backup lógico das tabelas afetadas.
- Registrar versão/commit publicado.
- Aplicar migrations aprovadas.
- Publicar frontend.
- Executar smoke tests imediatamente após deploy.
- Monitorar erros, logs e consultas sem resultado.

## Rollback

### Frontend
- Reverter para o commit anterior publicado.
- Não reaplicar migrations automaticamente durante rollback de frontend.

### Busca/autocomplete
Se a RPC nova apresentar problema:
- frontend possui fallback de autocomplete legado;
- para busca agrupada, reverter frontend para a RPC anterior antes de remover a função v2.

### Leads/logs
Se a RPC segura falhar:
- corrigir a função; não reabrir INSERT anônimo como solução permanente.
- caso seja necessário rollback emergencial, documentar a janela e restaurar a restrição imediatamente após correção.

### Advocacia 17.14
A migration altera somente cinco registros auditados e aborta se a pré-condição não for atendida.
Antes de aplicar, exportar os cinco registros atuais.
Para rollback, restaurar exatamente os valores anteriores a partir do backup da migration.

## Critério de aprovação

Deploy só é aprovado se:
- CI verde;
- auditoria fiscal sem novos conflitos;
- testes de segurança aprovados;
- todos os casos funcionais acima passarem;
- nenhuma informação fiscal tiver sido inferida no frontend.
