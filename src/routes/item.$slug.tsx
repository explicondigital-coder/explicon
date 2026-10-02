import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ResultGroup } from "@/components/ResultGroup";
import { DetailPanel } from "@/components/DetailPanel";
import { agruparPorItemLc, rotuloCodigoItem, slugParaItemLc, type Correlacao } from "@/lib/correlacoes";
import { obterItemLc } from "@/lib/correlacoes.functions";

export const Route = createFileRoute("/item/$slug")({
  loader: ({ params }) => obterItemLc({ data: { itemLc: slugParaItemLc(params.slug) } }),
  head: ({ params, loaderData }) => {
    const itemLc = slugParaItemLc(params.slug);
    const descricao = loaderData?.registros?.[0]?.descricao_lc ?? "Correlação tributária";
    const rotulo = rotuloCodigoItem(itemLc);
    const title = `${rotulo} ${itemLc} — ${descricao} | Explicon`;
    const description = `Classificação ${itemLc} (${descricao}) com NBS, INDOP, CST e cClassTrib no Explicon Tax Link.`;
    const canonical = `https://consulta.explicon.com.br/item/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "index,follow,max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: ItemLcPagina,
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Não foi possível carregar o item.</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Item LC não encontrado.</div>
  ),
});

function ItemLcPagina() {
  const { slug } = Route.useParams();
  const itemLc = slugParaItemLc(slug);
  const inicial = Route.useLoaderData();
  const [selecionado, setSelecionado] = useState<Correlacao | null>(null);
  const [aberto, setAberto] = useState(false);

  const { data } = useQuery({
    queryKey: ["item-lc", itemLc],
    queryFn: () => obterItemLc({ data: { itemLc } }),
    initialData: inicial,
    staleTime: 300_000,
  });

  const grupos = agruparPorItemLc(data?.registros ?? []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>{" "}
          / <span className="text-foreground">{rotuloCodigoItem(itemLc)} {itemLc}</span>
        </nav>

        {grupos.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            Nenhuma correlação encontrada para {rotuloCodigoItem(itemLc)} {itemLc}.
          </p>
        ) : (
          <div className="space-y-8">
            {grupos.map((g, i) => (
              <ResultGroup
                key={g.itemLc + i}
                grupo={g}
                indice={i}
                favoritos={[]}
                onFavoritar={() => undefined}
                onVerDetalhes={(c) => {
                  setSelecionado(c);
                  setAberto(true);
                }}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
      <DetailPanel correlacao={selecionado} aberto={aberto} onOpenChange={setAberto} />
    </div>
  );
}
