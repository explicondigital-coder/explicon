import { useCallback, useEffect, useState } from "react";

function escreverLocalStorage(chave: string, valor: unknown) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch (error) {
    console.warn("[Tax Link] Não foi possível persistir no localStorage:", error);
  }
}

export function useLocalList<T>(chave: string, limite = 20) {
  const [itens, setItens] = useState<T[]>([]);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(chave);
      if (bruto) setItens(JSON.parse(bruto) as T[]);
    } catch (error) {
      console.warn("[Tax Link] Não foi possível ler o localStorage:", error);
    }
  }, [chave]);

  const persistir = useCallback(
    (proximo: T[]) => {
      const limitado = proximo.slice(0, limite);
      setItens(limitado);
      escreverLocalStorage(chave, limitado);
    },
    [chave, limite],
  );

  const adicionar = useCallback(
    (item: T, identidade: (a: T) => string) => {
      setItens((atual) => {
        const proximo = [item, ...atual.filter((i) => identidade(i) !== identidade(item))].slice(
          0,
          limite,
        );
        escreverLocalStorage(chave, proximo);
        return proximo;
      });
    },
    [chave, limite],
  );

  const remover = useCallback(
    (identidade: (a: T) => string, id: string) => {
      setItens((atual) => {
        const proximo = atual.filter((i) => identidade(i) !== id);
        escreverLocalStorage(chave, proximo);
        return proximo;
      });
    },
    [chave],
  );

  const limpar = useCallback(() => persistir([]), [persistir]);

  return { itens, adicionar, remover, limpar };
}
