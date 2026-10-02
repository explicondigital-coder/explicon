import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur">
      <Toaster position="top-center" />
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/busca" search={{ q: "", pagina: 1 }}>
              <Search className="size-4" />
              <span className="hidden sm:inline">Consultar</span>
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-border/70 bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-foreground">Explicon Consulta Tributária</span> —
          correlação gratuita entre Item LC 116, NBS, INDOP e CClassTrib.
        </p>
        <p>Conteúdo informativo, não substitui análise profissional.</p>
      </div>
    </footer>
  );
}