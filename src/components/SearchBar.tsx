import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { sugerirCorrelacoes } from "@/lib/correlacoes.functions";

interface Sugestao {
  valor: string;
  tipo: string;
  descricao: string | null;
}

export function SearchBar({
  valorInicial = "",
  autoFocus = false,
  tamanho = "grande",
}: {
  valorInicial?: string;
  autoFocus?: boolean;
  tamanho?: "grande" | "compacto";
}) {
  const navigate = useNavigate();
  const [termo, setTermo] = useState(valorInicial);
  const [debounced, setDebounced] = useState(valorInicial);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTermo(valorInicial), [valorInicial]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(termo), 220);
    return () => clearTimeout(t);
  }, [termo]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["sugestoes", debounced],
    queryFn: () => sugerirCorrelacoes({ data: { q: debounced } }),
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
  });

  const sugestoes: Sugestao[] = (data?.sugestoes ?? []).map((s) => ({
    valor: s.descricao_lc || s.item_lc || s.nbs,
    tipo: s.item_lc ? `LC ${s.item_lc}` : "NBS",
    descricao: s.nbs ? `NBS ${s.nbs}${s.descricao_nbs ? ` — ${s.descricao_nbs}` : ""}` : null,
  }));

  function pesquisar(valor: string) {
    const q = valor.trim();
    if (!q) return;
    setAberto(false);
    navigate({ to: "/busca", search: { q } });
  }

  const alto = tamanho === "grande";

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pesquisar(termo);
        }}
        className={`flex w-full items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft transition focus-within:border-brand focus-within:shadow-brand ${
          alto ? "sm:p-2.5" : ""
        }`}
      >
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <input
          value={termo}
          autoFocus={autoFocus}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          aria-label="Campo de pesquisa tributária"
          placeholder="Digite um serviço, Item LC, NBS, INDOP, CClassTrib ou descrição..."
          className={`w-full bg-transparent outline-none placeholder:text-muted-foreground ${
            alto ? "py-2 text-base sm:text-lg" : "py-1.5 text-sm"
          }`}
        />
        {isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button
          type="submit"
          className="shrink-0 rounded-xl bg-brand font-semibold text-brand-foreground hover:bg-brand/90"
          size={alto ? "lg" : "default"}
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Pesquisar</span>
        </Button>
      </form>

      <AnimatePresence>
        {aberto && sugestoes.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-lift"
          >
            {sugestoes.map((s, i) => (
              <li key={`${s.tipo}-${s.valor}-${i}`}>
                <button
                  type="button"
                  onClick={() => pesquisar(s.valor)}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-accent"
                >
                  <span className="mt-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.tipo}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {s.valor}
                    </span>
                    {s.descricao && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.descricao}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}