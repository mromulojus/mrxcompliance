import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "structureDefaults";

type Defaults = {
  prazoDocumentosDias: number;
  exigirCTPS: boolean;
  exigirRG: boolean;
  exigirCPF: boolean;
};

const Structure: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = React.useState<Defaults>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "") as Defaults;
    } catch {
      return { prazoDocumentosDias: 30, exigirCTPS: true, exigirRG: true, exigirCPF: true };
    }
  });

  React.useEffect(() => {
    document.title = "Estrutura Padrão - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Configurações padrão de cadastro e auditoria.");
  }, []);

  const salvar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    toast({ title: "Estrutura salva", description: "As configurações padrão foram atualizadas." });
  };

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Estrutura Padrão</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Prazo para entrega de documentos (dias)</span>
              <Input type="number" min={0} value={form.prazoDocumentosDias}
                onChange={(e) => setForm((f) => ({ ...f, prazoDocumentosDias: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center justify-between">
              <span>Exigir CTPS</span>
              <Switch checked={form.exigirCTPS} onCheckedChange={(v) => setForm((f) => ({ ...f, exigirCTPS: v }))} />
            </label>
            <label className="flex items-center justify-between">
              <span>Exigir RG</span>
              <Switch checked={form.exigirRG} onCheckedChange={(v) => setForm((f) => ({ ...f, exigirRG: v }))} />
            </label>
            <label className="flex items-center justify-between">
              <span>Exigir CPF</span>
              <Switch checked={form.exigirCPF} onCheckedChange={(v) => setForm((f) => ({ ...f, exigirCPF: v }))} />
            </label>
          </div>
          <div className="pt-2">
            <Button onClick={salvar}>Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Structure;
