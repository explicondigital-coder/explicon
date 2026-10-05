import { lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";

const LeadForm = lazy(() =>
  import("@/components/LeadForm").then((module) => ({ default: module.LeadForm })),
);

const SUGESTOES = [
  "Fisioterapia",
  "Psicologia",
  "Advocacia",
  "Construção Civil",
  "04.08",
  "1.2301",
  "Serviços Médicos",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explicon Consulta Tributária — Item LC 116, NBS, INDOP e CClassTrib" },
      {
        name: "description",
        content:
          "Consulte gratuitamente a correlação entre Item LC 116, NBS, INDOP, CClassTrib e base legal. Busca inteligente para contadores, advogados e empresas.",
      },
      { property: "og:title", content: "Explicon Consulta Tributária" },
      {
        property: "og:description",
        content:
          "Correlação gratuita entre Item LC 116, NBS, INDOP, CClassTrib e base legal em uma única busca.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:url", content: "https://consulta.explicon.com.br/" },
    ],
    links: [{ rel: "canonical", href: "https://consulta.explicon.com.br/" }],
  }),
  component: Home,
});

function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Explicon Tax Link",
    url: "https://consulta.explicon.com.br/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://consulta.explicon.com.br/busca?q={search_term_string}&pagina=1",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-3xl text-center">
          <Badge variant="outline" className="mb-6 border-brand/40 text-xs">
            Reforma tributária · IBS · CBS
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            EXPLI<span className="text-brand">CON</span>
            <span className="mt-2 block text-lg font-semibold text-muted-foreground sm:text-2xl">
              Consulta Tributária
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Consulte gratuitamente a correlação entre Item LC 116, NBS, INDOP, CClassTrib e Base
            Legal.
          </p>

          <div className="mt-9">
            <SearchBar autoFocus />
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Pesquisas sugeridas:</span>
            {SUGESTOES.map((s) => (
              <Link
                key={s}
                to="/busca"
                search={{ q: s, pagina: 1 }}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition hover:border-brand hover:shadow-soft"
              >
                {s}
              </Link>
            ))}
          </div>

          <Link
            to="/busca"
            search={{ q: "", pagina: 1 }}
            className="mt-10 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Ver todas as correlações <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
        <Suspense fallback={<div className="h-52" aria-hidden="true" />}>
          <LeadForm />
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}
