import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Docs: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    document.title = "Documentação & Webhooks - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Envie dados para n8n, Zapier e outros via webhooks.");
  }, []);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!webhookUrl) {
      toast({ title: "Erro", description: "Informe a URL do webhook", variant: "destructive" });
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          example: { empresas: true, colaboradores: true },
        }),
      });
      toast({ title: "Requisição enviada", description: "Verifique o histórico do seu webhook (n8n/Zapier)." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao enviar o webhook.", variant: "destructive" });
    }
  };

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Documentação & Integrações</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Webhook de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrigger} className="space-y-3">
            <label className="block">
              <span className="text-sm text-muted-foreground">URL do Webhook (n8n, Zapier...)</span>
              <Input placeholder="https://hooks.zapier.com/..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
            </label>
            <Button type="submit">Disparar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Docs;
