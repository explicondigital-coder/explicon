# Explicon Tax Link — critérios antes de publicar

## Obrigatórios
- Migration de paginação por Item LC testada fora de produção.
- Busca por contabilidade retorna cada NBS em cartão separado.
- Registro sem NBS nunca aparece como correlação NBS confirmada.
- CST e cClassTrib permanecem originados apenas do banco.
- Não exibir por enquanto IBS 2026 0,10% nem CBS 2026 0,90%.
- Paginação não pode dividir o mesmo Item LC entre páginas.
- Consultas devem ser registradas apenas na primeira página da pesquisa.
- Pesquisa sem resultado também deve ser registrada.
- RLS deve ser testada com leitor, editor e administrador.
- Build, lint e testes devem concluir sem erro.

## Qualidade dos dados
- Revisar duplicidades estruturais.
- Identificar claramente códigos internos 99.*.
- Revisar valores de item_lc fora do padrão NN.NN.
- Revisar regras sem NBS como tratamentos adicionais.
- Não preencher Base Legal por inferência.
- Registrar a data da última revisão da base.

## UX
- Desktop: Informações Básicas e Tributárias em duas colunas.
- Mobile: blocos empilhados, sem tabela horizontal.
- Múltiplos NBS geram múltiplos cartões.
- Campo vazio aparece como "Não informado".
- Favoritos e ações de detalhes devem continuar funcionando.
