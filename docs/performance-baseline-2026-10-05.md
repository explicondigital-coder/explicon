# Explicon Tax Link — baseline de performance

Data: 2026-10-05

## Banco atual

Base auditada: 1.157 registros em `public.correlacoes`.

Índices existentes confirmados:

- btree em `item_lc`
- btree em `nbs`
- btree em `indop`
- btree em `cclasstrib`
- btree em `cst`
- btree em `base_legal`
- GIN trigram em `search_text`
- GIN em `search_vector`

## Medições read-only

Consulta de referência:

`buscar_correlacoes('contabilidade', ..., limit 10, offset 0)`

Tempo observado no PostgreSQL:

- aproximadamente 8 ms
- 3 registros retornados

Autocomplete de referência:

`sugerir_correlacoes('contabilidade', 8)`

Tempo observado no PostgreSQL:

- aproximadamente 12 ms
- 3 registros retornados

## Interpretação

Com 1.157 registros, o banco não é o principal gargalo percebido pelo usuário.

A maior parte da latência tende a estar em:

1. round trips aplicação → servidor → Supabase;
2. chamadas para RPCs ainda não existentes antes de fallback;
3. carregamento antecipado de dados de filtros;
4. hidratação e JavaScript acima da dobra;
5. renderização de grupos grandes de cartões.

## Otimizações já preparadas no GitHub

- remover tentativa de RPC v2 inexistente no autocomplete enquanto migrations não forem aplicadas;
- usar RPC legada diretamente durante transição;
- filtros avançados carregam apenas após abertura;
- cache prolongado das opções dos filtros;
- Base Legal removida do payload dos filtros enquanto não houver dados;
- LeadForm da home em lazy-load;
- remoção de animação pesada na hero da home;
- renderização progressiva para grupos grandes;
- RPC `obter_opcoes_filtro_v2()` preparada para retornar apenas valores distintos.

## Meta após sincronização

Antes/depois deve ser medido no preview real do Lovable.

Recomendações de medição:

- TTFB home;
- tempo até input pesquisável;
- tempo autocomplete após 2+ caracteres;
- tempo de navegação para `/busca`;
- tempo de primeira renderização de resultados;
- quantidade de requests por pesquisa;
- tamanho total de payload da página de busca;
- quantidade de cartões montados inicialmente.

## Gate de performance sugerido

Para a base atual, considerar aceitável como meta inicial:

- SQL individual: < 50 ms;
- autocomplete end-to-end: < 300 ms em conexão normal;
- busca end-to-end: < 700 ms em conexão normal;
- nenhum request de filtros enquanto painel estiver fechado;
- nenhum request deliberadamente fadado a erro;
- grupos grandes: renderização inicial limitada, com expansão sob demanda.

Essas metas são operacionais e devem ser confirmadas no preview e no domínio final antes do deploy.
