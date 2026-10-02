import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const salvo = window.localStorage.getItem("explicon-tema");
    const preferido =
      salvo === "dark" ||
      (salvo === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setEscuro(preferido);
    document.documentElement.classList.toggle("dark", preferido);
  }, []);

  function alternar() {
    const proximo = !escuro;
    setEscuro(proximo);
    document.documentElement.classList.toggle("dark", proximo);
    window.localStorage.setItem("explicon-tema", proximo ? "dark" : "light");
  }

  return (
    <Button variant="ghost" size="icon" onClick={alternar} aria-label="Alternar tema">
      {escuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
