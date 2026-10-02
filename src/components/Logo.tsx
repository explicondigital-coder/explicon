import { Link } from "@tanstack/react-router";
import logoExplicon from "@/assets/logo-explicon.png.asset.json";

export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link to="/" className="group inline-flex flex-col items-start gap-0.5">
      <img src={logoExplicon.url} alt="Explicon" className="h-5 w-auto dark:brightness-0 dark:invert" />
      {!compacto && <span className="text-[10px] font-medium tracking-wide text-muted-foreground">Consulta Tributária</span>}
    </Link>
  );
}
