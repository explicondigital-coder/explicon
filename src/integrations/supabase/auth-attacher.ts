import { createMiddleware } from "@tanstack/react-start";

/**
 * WORKBENCH ONLY.
 * No projeto Lovable, este middleware anexa a sessão Supabase às server functions.
 * O cliente real não é copiado para o GitHub enquanto o projeto não estiver sincronizado.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => next(),
);
