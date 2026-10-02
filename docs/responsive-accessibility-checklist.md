# Explicon Tax Link — checklist responsivo e acessibilidade

## Breakpoints a validar

- 320 px
- 375 px
- 430 px
- 768 px
- 1024 px
- 1440 px

## Cartões
- NBS e código do item/categoria quebram linha sem overflow.
- Botão Ver detalhes ocupa largura útil no mobile.
- Favoritar mantém alvo de toque adequado.
- Informações Básicas e Tributárias empilham abaixo de `md`.
- Descrições longas usam quebra de palavra.
- Redução de Alíquota não estoura a largura.
- Tratamentos adicionais exibem a descrição/variante associada quando existir.

## Busca
- Campo + botão não causam rolagem horizontal.
- Dropdown de autocomplete cabe na viewport.
- Textos longos são truncados visualmente sem perder o termo pesquisável.
- Filtros avançados usam 1 coluna no mobile, 2 no tablet e 3 no desktop.
- Aplicar/Limpar ocupam largura total no mobile.

## Navegação
- Header não sobrepõe conteúdo.
- Links e botões são navegáveis por teclado.
- Focus visível.
- `aria-label` no campo de busca e botão de favorito.
- Paginação preserva filtros e termo.

## Conteúdo fiscal
- Código interno 99.* nunca aparece como Item LC 116.
- Registro sem NBS nunca aparece como cartão NBS confirmado.
- Variante residencial/não residencial permanece visível.

## Impressão/exportação
Depois de sincronizar os arquivos de exportação do Lovable:
- revisar PDF em A4;
- revisar Excel;
- revisar impressão;
- confirmar que rótulos internos/LC acompanham o novo modelo.
