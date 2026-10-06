import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { obterOpcoesFiltro } from "@/lib/correlacoes.functions";
import { ORDENACOES } from "@/lib/correlacoes";
import { Button } from "@/components/ui/button";

export interface FiltrosBusca {
  item_lc: string;
  nbs: string;
  indop: string;
  cclasstrib: string;
  base_legal: string;
  ordenar: "item_lc" | "nbs" | "alfabetica";
}

export function AdvancedFilters({
  q,
  valores,
}: {
  q: string;
  valores: FiltrosBusca;
}) {
  const navigate = useNavigate();
  const [local, setLocal] = useState<FiltrosBusca>(valores);
  const [aberto, setAberto] = useState(false);
  const [jaAbriu, setJaAbriu] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["opcoes-filtros"],
    queryFn: () => obterOpcoesFiltro(),
    enabled: jaAbriu,
    staleTime: 60 * 60_000,
    gcTime: 2 * 60 * 60_000,
  });

  function aplicar() {
    navigate({
      to: "/busca",
      search: {
        q,
        pagina: 1,
        ...local,
      },
    });
  }

  function limpar() {
    const vazio: FiltrosBusca = {
      item_lc: "",
      nbs: "",
      indop: "",
      cclasstrib: "",
      base_legal: "",
      ordenar: "item_lc",
    };
    setLocal(vazio);
    navigate({
      to: "/busca",
      search: { q, pagina: 1, ...vazio },
    });
  }

  const selectClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-brand";

  return (
    <details
      open={aberto}
      onToggle={(event) => {
        const proximo = event.currentTarget.open;
        setAberto(proximo);
        if (proximo) setJaAbriu(true);
      }}
      className="mt-4 rounded-xl border border-border bg-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-foreground">
        <SlidersHorizontal className="size-4 text-brand" />
        Filtros avançados
      </summary>

      <div className="grid gap-4 border-t border-border px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          <span>Item LC 116 / categoria interna</span>
          <select
            className={selectClass}
            value={local.item_lc}
            disabled={isLoading}
            onChange={(e) => setLocal((v) => ({ ...v, item_lc: e.target.value }))}
          >
            <option value="">Todos</option>
            {(data?.itensLc ?? []).map((valor) => (
              <option key={valor} value={valor}>{valor}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          <span>NBS</span>
          <select
            className={selectClass}
            value={local.nbs}
            disabled={isLoading}
            onChange={(e) => setLocal((v) => ({ ...v, nbs: e.target.value }))}
          >
            <option value="">Todos</option>
            {(data?.nbs ?? []).map((valor) => (
              <option key={valor} value={valor}>{valor}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          <span>INDOP</span>
          <select
            className={selectClass}
            value={local.indop}
            disabled={isLoading}
            onChange={(e) => setLocal((v) => ({ ...v, indop: e.target.value }))}
          >
            <option value="">Todos</option>
            {(data?.indop ?? []).map((valor) => (
              <option key={valor} value={valor}>{valor}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          <span>cClassTrib</span>
          <select
            className={selectClass}
            value={local.cclasstrib}
            disabled={isLoading}
            onChange={(e) => setLocal((v) => ({ ...v, cclasstrib: e.target.value }))}
          >
            <option value="">Todos</option>
            {(data?.cclasstrib ?? []).map((valor) => (
              <option key={valor} value={valor}>{valor}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          <span>Ordenação</span>
          <select
            className={selectClass}
            value={local.ordenar}
            onChange={(e) =>
              setLocal((v) => ({
                ...v,
                ordenar: e.target.value as FiltrosBusca["ordenar"],
              }))
            }
          >
            {ORDENACOES.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-col items-stretch gap-2 sm:col-span-2 sm:flex-row sm:items-end lg:col-span-3">
          <Button className="w-full sm:w-auto" type="button" onClick={aplicar}>Aplicar filtros</Button>
          <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={limpar}>Limpar</Button>
        </div>
      </div>
    </details>
  );
}
