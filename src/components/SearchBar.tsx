import { useEffect, useMemo, useRef, useState } from "react";
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

interface SugestaoV2 {
  valor?: string | null;
  tipo?: string | null;
  descricao?: string | null;
  item_lc?: string | null;
  nbs?: string | null;
  descricao_lc?: string | null;
  descricao_nbs?: string | null;
}

function normalizar(valor: string | null | undefined) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function classificarSugestao(
  termo: string,
  s: {
    item_lc?: string | null;
    descricao_lc?: string | null;
    nbs?: string | null;
    descricao_nbs?: string | null;
  },
): Sugestao {
  const q = normalizar(termo);
  const nbs = normalizar(s.nbs);
  const item = normalizar(s.item_lc);
  const descNbs = normalizar(s.descricao_nbs);
  const descLc = normalizar(s.descricao_lc);

  if (s.nbs && nbs.includes(q)) {
    return {
      valor: s.nbs,
      tipo: "NBS",
      descricao: s.descricao_nbs ?? s.descricao_lc ?? null,
    };
  }

  if (s.item_lc && item.includes(q)) {
    return {
      valor: s.item_lc,
      tipo: "Item LC",
      descricao: s.descricao_lc ?? null,
    };
  }

  if (s.descricao_nbs && descNbs.includes(q)) {
    return {
      valor: s.descricao_nbs,
      tipo: "Serviço NBS",
      descricao: s.nbs ? `NBS ${s.nbs}${s.item_lc ? ` · Item LC ${s.item_lc}` : ""}` : s.descricao_lc ?? null,
    };
  }

  return {
    valor: s.descricao_lc || s.descricao_nbs || s.item_lc || s.nbs || termo,
    tipo: descLc.includes(q) ? "Serviço" : "Correlação",
    descricao: s.item_lc
      ? `Item LC ${s.item_lc}${s.nbs ? ` · NBS ${s.nbs}` : ""}`
      : s.nbs
        ? `NBS ${s.nbs}`
        : null,
  };
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

  const sugestoes: Sugestao[] = useMemo(
    () =>
      ((data?.sugestoes ?? []) as SugestaoV2[])
        .map((s) => {
          if (s.tipo && s.valor) {
            return {
              tipo: s.tipo,
              valor: s.valor,
              descricao: s.descricao ?? null,
            };
          }
          return classificarSugestao(debounced, s);
        })
        .filter(
          (s, indice, todos) =>
            todos.findIndex((outro) => outro.tipo === s.tipo && outro.valor === s.valor) === indice,
        ),
    [data?.sugestoes, debounced],
  );

  function pesquisar(valor: string) {
    const q = valor.trim();
    if (!q) return;
    setAberto(false);
    navigate({ to: "/busca", search: { q, pagina: 1 } });
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
