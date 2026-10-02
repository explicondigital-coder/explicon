/**
 * WORKBENCH ONLY.
 * A implementação real deste cliente permanece no projeto Lovable.
 * Este arquivo existe apenas para resolver imports no snapshot do GitHub.
 * Não usar em deploy.
 *
 * O tipo any abaixo é deliberado: o stub precisa aceitar as chamadas do cliente
 * Supabase real sem reproduzir credenciais, schema gerado ou implementação runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPublicClient(): any {
  throw new Error("Cliente Supabase real deve ser restaurado a partir do Lovable antes da execução.");
}
