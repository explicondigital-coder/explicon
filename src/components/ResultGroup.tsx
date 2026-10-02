import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { itemLcParaSlug, type Correlacao, type GrupoItemLc } from "@/lib/correlacoes";

function valorOuNaoInformado(valor: string | null | undefined) {
  const normalizado = valor?.trim();
  return normalizado ? normalizado : "Não informado";
}

function Campo({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string | null | undefined;
  destaque?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </p>
      <p className={`text-sm ${destaque ? "font-semibold text-foreground" : "text-foreground"}`}>
        {valorOuNaoInformado(valor)}
      </p>
    </div>
  );
}

function CorrelacaoCard({
  registro,
  onVerDetalhes,
  onFavoritar,
  favorito,
}: {
  registro: Correlacao;
  onVerDetalhes: (c: Correlacao) => void;
  onFavoritar: (c: Correlacao) => void;
  favorito: boolean;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-brand/60 bg-brand/10 text-foreground">
            NBS {valorOuNaoInformado(registro.nbs)}
          </Badge>
          <Badge className="bg-brand text-brand-foreground hover:bg-brand">
            Item LC 116: {valorOuNaoInformado(registro.item_lc)}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoritar"
            onClick={() => onFavoritar(registro)}
          >
            <Star className={`size-4 ${favorito ? "fill-brand text-brand" : ""}`} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onVerDetalhes(registro)}>
            <Eye className="size-4" />
            Ver detalhes
          </Button>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <section className="space-y-4 px-4 py-5 sm:px-5 md:border-r md:border-border/70">
          <h3 className="text-sm font-bold text-foreground">Informações Básicas</h3>
          <Campo rotulo="Descrição NBS" valor={registro.descricao_nbs} />
          <Campo rotulo="Descrição do Item" valor={registro.descricao_lc} />
          <Campo rotulo="Local de Incidência IBS" valor={registro.local_incidencia_ibs} />
          <Campo rotulo="CST" valor={registro.cst} destaque />
        </section>

        <section className="space-y-4 border-t border-border/70 px-4 py-5 sm:px-5 md:border-t-0">
          <h3 className="text-sm font-bold text-foreground">Informações Tributárias</h3>
          <Campo rotulo="cClassTrib" valor={registro.cclasstrib} destaque />
          <Campo rotulo="Nome cClassTrib" valor={registro.nome_cclasstrib} />
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Redução de Alíquota
            </p>
            {registro.reducao_aliquota ? (
              <Badge className="bg-brand text-brand-foreground hover:bg-brand">
                {registro.reducao_aliquota}
              </Badge>
            ) : (
              <p className="text-sm text-foreground">Não informado</p>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

function TratamentoAdicionalCard({
  registro,
  onVerDetalhes,
}: {
  registro: Correlacao;
  onVerDetalhes: (c: Correlacao) => void;
}) {
  return (
    <article className="rounded-xl border border-dashed border-brand/50 bg-brand/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-brand" />
            <p className="text-sm font-semibold text-foreground">
              Tratamento tributário adicional — verificar aplicabilidade
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="CST" valor={registro.cst} destaque />
            <Campo rotulo="cClassTrib" valor={registro.cclasstrib} destaque />
            <Campo rotulo="Nome cClassTrib" valor={registro.nome_cclasstrib} />
            <Campo rotulo="Redução de Alíquota" valor={registro.reducao_aliquota} />
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Este registro não possui NBS associado na base atual. Ele não deve ser interpretado
            como uma correlação NBS confirmada para todo o serviço.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => onVerDetalhes(registro)}>
          <Eye className="size-4" />
          Ver detalhes
        </Button>
      </div>
    </article>
  );
}

export function ResultGroup({
  grupo,
  indice,
  onVerDetalhes,
  onFavoritar,
  favoritos,
}: {
  grupo: GrupoItemLc;
  indice: number;
  onVerDetalhes: (c: Correlacao) => void;
  onFavoritar: (c: Correlacao) => void;
  favoritos: string[];
}) {
  const correlacoesPrincipais = grupo.registros.filter((registro) => Boolean(registro.nbs?.trim()));
  const tratamentosAdicionais = grupo.registros.filter((registro) => !registro.nbs?.trim());

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(indice * 0.04, 0.24) }}
      className="space-y-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-brand text-brand-foreground hover:bg-brand">
              Item LC {grupo.itemLc}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {correlacoesPrincipais.length} correlaç
              {correlacoesPrincipais.length === 1 ? "ão NBS" : "ões NBS"}
            </span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-foreground sm:text-lg">
            {grupo.descricao ?? "Descrição não informada"}
          </h2>
        </div>

        {grupo.itemLc !== "—" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/item/$slug" params={{ slug: itemLcParaSlug(grupo.itemLc) }}>
              Página do item
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        )}
      </header>

      {correlacoesPrincipais.length > 0 ? (
        <div className="space-y-4">
          {correlacoesPrincipais.map((registro) => (
            <CorrelacaoCard
              key={registro.id}
              registro={registro}
              onVerDetalhes={onVerDetalhes}
              onFavoritar={onFavoritar}
              favorito={favoritos.includes(registro.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nenhuma correlação NBS confirmada foi encontrada para este item.
        </div>
      )}

      {tratamentosAdicionais.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-brand/30 bg-brand/5 p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Tratamentos tributários adicionais — verificar aplicabilidade
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Regras sem NBS associado são apresentadas separadamente para evitar que uma condição
              específica seja confundida com enquadramento automático do serviço.
            </p>
          </div>

          <div className="space-y-3">
            {tratamentosAdicionais.map((registro) => (
              <TratamentoAdicionalCard
                key={registro.id}
                registro={registro}
                onVerDetalhes={onVerDetalhes}
              />
            ))}
          </div>
        </section>
      )}
    </motion.section>
  );
}
