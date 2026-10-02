# Explicon Tax Link — status da auditoria sem créditos do Lovable

Data: 2026-10-02

## Progresso estimado

**Auditoria e preparação técnica concluídas: 94%**  
**Pendente: 6%**

A porcentagem representa o trabalho de auditoria, correção preparada, testes e prontidão para integração. Não representa deploy concluído em produção.

## Concluído

### Base e integridade
- 1.157/1.157 registros auditados estruturalmente.
- 1.157 IDs únicos.
- 980 registros com NBS.
- 177 registros sem NBS auditados e classificados estruturalmente:
  - 80 como tributação integral/padrão;
  - 96 como tratamentos com redução informada;
  - 1 como regime específico financeiro.
- 0 duplicidades semânticas reais.
- 0 conflitos CST/cClassTrib para o mesmo Item + NBS.
- 0 divergências CST x prefixo cClassTrib.
- 0 NBS fora do formato.
- 0 CST fora do formato.
- 0 cClassTrib fora do formato.
- 0 INDOP fora do formato.
- 8 categorias internas 99.* identificadas e separadas conceitualmente de Item LC 116.
- 5 registros textuais `item_lc = advocacia` isolados e migration defensiva preparada para 17.14.

### Cartões
- 980/980 registros com NBS possuem:
  - descrição NBS;
  - descrição do item/categoria;
  - local IBS;
  - CST;
  - cClassTrib;
  - nome cClassTrib.
- 655 não possuem redução preenchida e são mostrados como “Não informado”, sem inferência.
- registros sem NBS ficam separados como tratamento adicional.
- variantes residencial/não residencial permanecem visíveis.
- IBS 2026 0,10% e CBS 2026 0,90% permanecem fora do cartão.

### Busca e performance
- paginação por grupo completo preparada;
- autocomplete por relevância preparado;
- filtros avançados preparados;
- log de consulta preparado;
- índice trigram confirmado em uso.
- benchmark atual:
  - contabilidade: ~7,3 ms;
  - locação: ~4,4 ms.
- benchmark sintético com 23.140 linhas:
  - contabilidade: ~1,4 ms;
  - locação: ~17,3 ms.

### Segurança
- estado atual auditado;
- RLS helpers novos preparados;
- risco dos helpers antigos documentado;
- lead via RPC validada preparado;
- log via RPC preparado;
- grant SELECT residual de anon em leads removido na migration preparada;
- auditoria pós-migration criada;
- assertions de pré-deploy criadas.

### Testes e CI
- testes fiscais automatizados, incluindo Contabilidade, Fisioterapia, categorias 99.*, variantes sem NBS e classificação dos tratamentos adicionais;
- TypeScript check;
- lint semântico;
- build de produção;
- formatting report consultivo.
- CI verde na versão funcional/SEO mais recente validada.

### SEO
- metadados específicos;
- pt-BR;
- canonical por rota;
- /busca noindex;
- categorias 99.* noindex,follow;
- páginas LC 116 indexáveis;
- sitemap com 200 páginas LC 116;
- robots.txt aponta para sitemap;
- WebSite/SearchAction JSON-LD;
- BreadcrumbList nas páginas individuais.

### Deploy
- runbook de deploy;
- rollback;
- gate de publicação;
- auditoria SQL;
- assertions fiscais;
- checklist responsivo e acessibilidade.

## 6% restante

### 1. Corrigir 5 valores ps_onerosa = "advocacia"
A fonte original não está disponível na Biblioteca atual.
Não corrigir por inferência.
Issue #2.

### 2. Aplicar migrations em ambiente de teste
Ainda não executado para preservar produção.

### 3. Testar RLS com perfis reais
- visitante;
- leitor;
- editor;
- administrador.

### 4. QA end-to-end no projeto sincronizado
Inclui:
- busca;
- paginação;
- autocomplete;
- filtros;
- lead;
- favoritos;
- PDF;
- Excel;
- compartilhar;
- imprimir;
- páginas individuais.

### 5. QA visual real
Breakpoints:
- 320;
- 375;
- 430;
- 768;
- 1024;
- 1440 px.

### 6. Base Legal e Observações
1.157/1.157 ainda estão vazios.
É uma pendência documental/jurídica e exige fonte oficial.
Issue #3.
Não impede o cartão principal, mas impede rastreabilidade legal completa.

## Conclusão

Tudo o que pode ser adiantado com segurança **sem gastar créditos do Lovable e sem alterar produção** foi levado a um estado de integração/teste.

Os 6% restantes dependem principalmente de:
- fonte original/validação externa;
- ambiente sincronizado;
- aplicação controlada de migrations;
- testes reais de perfis e interface.
