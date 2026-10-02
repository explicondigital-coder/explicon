import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { enviarLead } from "@/lib/leads.functions";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100, "Nome muito longo"),
  email: z.string().trim().email("Informe um e-mail válido").max(255, "E-mail muito longo"),
});

type FormValues = z.infer<typeof schema>;

export function LeadForm({
  termoBuscado,
  className,
}: {
  termoBuscado?: string;
  className?: string;
}) {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      await enviarLead({
        data: {
          nome: values.nome,
          email: values.email,
          termoBuscado: termoBuscado?.trim() || null,
          origem: "cta_duvida_classificacao",
        },
      });
      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
    }
  }

  return (
    <section
      className={`no-print rounded-2xl border border-brand/40 bg-card p-6 shadow-soft sm:p-8 ${className ?? ""}`}
    >
      {enviado ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="size-9 text-brand" />
          <p className="text-lg font-semibold text-foreground">Recebemos seu contato!</p>
          <p className="text-sm text-muted-foreground">
            Em breve alguém da Explicon vai te responder.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 px-3 py-1 text-xs font-medium text-foreground">
              <Sparkles className="size-3.5 text-brand" />
              Atendimento especializado
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Ficou com dúvida na classificação?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Deixe seu contato para que a Explicon possa retornar sobre a consulta realizada.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <label className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>Nome</span>
              <input
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                placeholder="Seu nome"
                autoComplete="name"
                {...register("nome")}
              />
              {errors.nome && <span className="text-xs text-destructive">{errors.nome.message}</span>}
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-foreground">
              <span>E-mail</span>
              <input
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                type="email"
                placeholder="voce@empresa.com.br"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
            </label>

            {erro && <p className="text-xs text-destructive">{erro}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Falar com a Explicon
            </button>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Ao enviar, seus dados serão usados apenas para retorno sobre esta solicitação.
            </p>
          </form>
        </div>
      )}
    </section>
  );
}
