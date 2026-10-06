import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  termoBuscado: z.string().trim().max(200).nullable().default(null),
  origem: z.string().trim().min(1).max(80).default("cta_duvida_classificacao"),
});

export const enviarLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { data: leadId, error } = await supabase.rpc("enviar_lead_seguro", {
      _nome: data.nome,
      _email: data.email,
      _termo_buscado: data.termoBuscado,
      _origem: data.origem,
    });

    if (error) throw new Error(error.message);
    return { ok: true, id: leadId as string | null };
  });
