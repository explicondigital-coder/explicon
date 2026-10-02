import { Copy, Download, FileText, Printer, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { correlacaoParaTexto, type Correlacao } from "@/lib/correlacoes";

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </p>
      <p className="text-sm text-foreground">{valor ?? "—"}</p>
    </div>
  );
}

export function DetailPanel({
  correlacao,
  aberto,
  onOpenChange,
}: {
  correlacao: Correlacao | null;
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!correlacao) return null;
  const c = correlacao;

  async function copiar() {
    await navigator.clipboard.writeText(correlacaoParaTexto(c));
    toast.success("Resultado copiado");
  }

  async function exportarPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Explicon — Consulta Tributária", 14, 18);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(correlacaoParaTexto(c), 180), 14, 30);
    doc.save(`explicon-${c.item_lc ?? "correlacao"}.pdf`);
  }

  async function exportarExcel() {
    const XLSX = await import("xlsx");
    const planilha = XLSX.utils.json_to_sheet([c]);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Correlação");
    XLSX.writeFile(livro, `explicon-${c.item_lc ?? "correlacao"}.xlsx`);
  }

  async function compartilhar() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Explicon Consulta Tributária", url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  }

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Item LC {c.item_lc ?? "—"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">
          <Campo rotulo="Item LC 116" valor={c.item_lc} />
          <Campo rotulo="Descrição do Item LC" valor={c.descricao_lc} />
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="NBS" valor={c.nbs} />
            <Campo rotulo="INDOP" valor={c.indop} />
            <Campo rotulo="CClassTrib" valor={c.cclasstrib} />
            <Campo rotulo="CST" valor={c.cst} />
            <Campo rotulo="Local incidência IBS" valor={c.local_incidencia_ibs} />
            <Campo rotulo="Prestação onerosa" valor={c.ps_onerosa} />
            <Campo rotulo="Adquirido no exterior" valor={c.adq_exterior} />
          </div>
          <Campo rotulo="Descrição NBS" valor={c.descricao_nbs} />
          <Campo rotulo="Nome CClassTrib" valor={c.nome_cclasstrib} />
          <Campo rotulo="Descrição CST" valor={c.descricao_cst} />
          {c.reducao_aliquota && (
            <p className="rounded-lg border border-brand/60 bg-brand/10 px-3 py-2 text-sm font-semibold text-foreground">
              {c.reducao_aliquota}
            </p>
          )}
          <Campo rotulo="Base legal" valor={c.base_legal} />
          <Campo rotulo="Observações" valor={c.observacoes} />

          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={copiar}>
              <Copy className="size-4" /> Copiar
            </Button>
            <Button variant="secondary" size="sm" onClick={exportarPdf}>
              <FileText className="size-4" /> PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={exportarExcel}>
              <Download className="size-4" /> Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={compartilhar}>
              <Share2 className="size-4" /> Compartilhar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> Imprimir
            </Button>
            <Button size="sm" disabled className="bg-brand text-brand-foreground">
              <Sparkles className="size-4" /> Explicar com IA
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}