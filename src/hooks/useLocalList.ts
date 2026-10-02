import { useCallback, useEffect, useState } from "react";

export function useLocalList<T>(chave: string, limite = 20) {
  const [itens, setItens] = useState<T[]>([]);
  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(chave);
      if (bruto) setItens(JSON.parse(bruto) as T[]);
    } catch {}
  }, [chave]);

  const persistir = useCallback((proximo: T[]) => {
    setItens(proximo);
    try { window.localStorage.setItem(chave, JSON.stringify(proximo.slice(0, limite))); } catch {}
  }, [chave, limite]);

  const adicionar = useCallback((item: T, identidade: (a: T) => string) => {
    setItens((atual) => {
      const proximo = [item, ...atual.filter((i) => identidade(i) !== identidade(item))].slice(0, limite);
      try { window.localStorage.setItem(chave, JSON.stringify(proximo)); } catch {}
      return proximo;
    });
  }, [chave, limite]);

  const remover = useCallback((identidade: (a: T) => string, id: string) => {
    setItens((atual) => {
      const proximo = atual.filter((i) => identidade(i) !== id);
      try { window.localStorage.setItem(chave, JSON.stringify(proximo)); } catch {}
      return proximo;
    });
  }, [chave]);

  const limpar = useCallback(() => persistir([]), [persistir]);
  return { itens, adicionar, remover, limpar };
}
