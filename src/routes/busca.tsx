import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { SearchBar } from "@/components/SearchBar";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ResultGroup } from "@/components/ResultGroup";
import { DetailPanel } from "@/components/DetailPanel";
import { Button } from "@/components/ui/button";
import { agruparPorItemLc, type Correlacao } from "@/lib/correlacoes";
import { buscarCorrelacoes } from "@/lib/correlacoes.functions";
import { useLocalList } from "@/hooks/useLocalList";
import { LeadForm } from "@/components/LeadForm";

const ITENS_POR_PAGINA = 10;

const searchSchema = z.object({
  q: z.string().catch(""),
  pagina: z.number().int().min(1).catch(1),
  item_lc: z.string().catch(""),
  nbs: z.string().catch(""),
  indop: z.string().catch(""),
  cclasstrib: z.string().catch(""),
  base_legal: z.string().catch(""),
  ordenar: z.enum(["item_lc", "nbs", "alfabetica"]).catch("item_lc"),
});

export const Route = createFileRoute("/busca")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Resultados da consulta — Explicon Consulta Tributária" },
      {
        name: "description",
        content:
          "Resultados de correlação tributária entre Item LC 116, NBS, INDOP e CClassTrib agrupados por item.",
      },
      { property: "og:title", content: "Resultados da consulta — Explicon" },
      {
        property: "og:description",
        content: "Correlações tributárias agrupadas por Item LC 116, com NBS, INDOP e CClassTrib.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Busca,
});

function Busca() {
  const search = Route.useSearch();
  const {
    q,
    pagina,
    item_lc,
    nbs,
    indop,
    cclasstrib,
    base_legal,
    ordenar,
  } = search;

  const [selecionado, setSelecionado] = useState<Correlacao | null>(null);
  const [painelAberto, setPainelAberto] = useState(false);
  const favoritos = useLocalList<Correlacao>("explicon-favoritos", 50);

  const { data, isLoading } = useQuery({
    queryKey: [
      "busca",
      q,
      pagina,
      item_lc,
      nbs,
      indop,
      cclasstrib,
      base_legal,
      ordenar,
    ],
    queryFn: () =>
      buscarCorrelacoes({
        data: {
          q,
          pagina,
          porPagina: ITENS_POR_PAGINA,
          item_lc: item_lc || null,
          nbs: nbs || null,
          indop: indop || null,
          cclasstrib: cclasstrib || null,
          base_legal: base_legal || null,
          ordenar,
        },
      }),
    staleTime: 60_000,
  });

  const grupos = agruparPorItemLc(data?.registros ?? []);
  const totalItens = data?.totalItens ?? data?.total ?? 0;
  const totalRegistros = data?.totalRegistros ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));

  const filtrosAtivos = [item_lc, nbs, indop, cclasstrib, base_legal].filter(Boolean).length;

  const searchPaginacao = (proximaPagina: number) => ({
    ...search,
    pagina: proximaPagina,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <SearchBar valorInicial={q} tamanho="compacto" />

        <AdvancedFilters
          q={q}
          valores={{
            item_lc,
            nbs,
            indop,
            cclasstrib,
            base_legal,
            ordenar,
          }}
        />

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {isLoading ? (
            <span>Consultando...</span>
          ) : (
            <>
              <span>{totalRegistros} correlação(ões)</span>
              <span aria-hidden="true">·</span>
              <span>{totalItens} Item(ns) LC</span>
              {q ? <span>para “{q}”</span> : null}
              {filtrosAtivos > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{filtrosAtivos} filtro(s) ativo(s)</span>
                </>
              ) : null}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-brand" />
          </div>
        ) : grupos.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-medium text-foreground">Nenhum resultado encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente outro termo, código NBS, Item LC ou remova algum filtro.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {grupos.map((g, i) => (
              <ResultGroup
                key={g.itemLc + i}
                grupo={g}
                indice={i}
                favoritos={favoritos.itens.map((f) => f.id)}
                onFavoritar={(c) => favoritos.adicionar(c, (x) => x.id)}
                onVerDetalhes={(c) => {
                  setSelecionado(c);
                  setPainelAberto(true);
                }}
              />
            ))}
          </div>
        )}

        <LeadForm termoBuscado={q} className="mt-10" />

        {totalPaginas > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginação">
            <Button asChild variant="outline" size="sm" disabled={pagina <= 1}>
              <Link
                to="/busca"
                search={searchPaginacao(Math.max(1, pagina - 1))}
              >
                Anterior
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </span>
            <Button asChild variant="outline" size="sm" disabled={pagina >= totalPaginas}>
              <Link
                to="/busca"
                search={searchPaginacao(Math.min(totalPaginas, pagina + 1))}
              >
                Próxima
              </Link>
            </Button>
          </nav>
        )}
      </main>
      <SiteFooter />
      <DetailPanel
        correlacao={selecionado}
        aberto={painelAberto}
        onOpenChange={setPainelAberto}
      />
    </div>
  );
}
