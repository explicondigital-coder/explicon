# Explicon Tax Link — prontidão SEO

## Já preparado no branch

- `lang="pt-BR"`
- title global específico do Explicon Tax Link
- meta description específica
- Open Graph title/description
- robots `index,follow,max-image-preview:large`
- páginas individuais por classificação
- títulos individuais por código/descrição
- distinção SEO entre Item LC 116 e Categoria interna Explicon
- página de busca permanece `noindex`
- robots.txt permite rastreamento

## Pendente antes do deploy público

### Domínio canônico
Não definir canonical usando URL de preview Lovable.

Quando o domínio definitivo do Tax Link estiver confirmado:
- adicionar canonical absoluto na home;
- canonical em cada página `/item/{slug}`;
- `og:url` absoluto;
- URL absoluta da imagem social.

### Sitemap
Gerar sitemap somente com o domínio definitivo.

Deve incluir:
- home;
- páginas indexáveis de Item LC 116;
- páginas indexáveis das categorias internas que forem consideradas úteis para busca orgânica.

Não incluir:
- `/busca?q=...`;
- URLs com paginação/filtros;
- páginas administrativas;
- preview Lovable.

### Structured data
Após domínio definido, avaliar:
- WebSite + SearchAction na home;
- BreadcrumbList nas páginas individuais;
- WebApplication/SoftwareApplication somente se a descrição corresponder ao produto final.

### Conteúdo
Evitar títulos que afirmem enquadramento tributário automático.
Preferir termos como:
- correlação;
- classificação;
- tratamento possível;
- verificar aplicabilidade.

### Monitoramento pós-publicação
- Google Search Console
- sitemap enviado
- cobertura de indexação
- consultas que levam a páginas /item/
- 404
- Core Web Vitals
