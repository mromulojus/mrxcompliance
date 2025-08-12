import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHR } from "@/context/HRContext";

const SystemData: React.FC = () => {
  const { empresas, colaboradores, loading, refetchEmpresas, refetchColaboradores } = useSupabaseData();
  const { criarDenuncia } = useHR();
  const { toast } = useToast();

  React.useEffect(() => {
    document.title = "Dados do Sistema - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Dados de empresas e colaboradores no MRx Compliance.");
  }, []);

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEmpresas = () => {
    const header = ["Nome", "CNPJ", "Responsável", "Email"];
    const rows = empresas.map((e) => [e.nome, e.cnpj, e.responsavel, e.email]);
    downloadCsv(`empresas.csv`, [header, ...rows]);
  };

  const exportColaboradores = () => {
    const header = ["Nome", "Email", "Cargo", "Empresa", "Status"];
    const rows = colaboradores.map((c) => [
      c.nome,
      c.email,
      c.cargo,
      empresas.find((e) => e.id === c.empresa_id)?.nome || c.empresa_id,
      c.status,
    ]);
    downloadCsv(`colaboradores.csv`, [header, ...rows]);
  };

  if (loading) {
    return (
      <main>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando dados...</span>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Dados do Sistema</h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Empresas ({empresas.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={exportEmpresas}>Exportar CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.nome}</TableCell>
                      <TableCell>{e.cnpj}</TableCell>
                      <TableCell>{e.responsavel}</TableCell>
                      <TableCell>{e.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Colaboradores ({colaboradores.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={exportColaboradores}>Exportar CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores.slice(0, 50).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nome}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.cargo}</TableCell>
                      <TableCell>{empresas.find((e) => e.id === c.empresa_id)?.nome || c.empresa_id}</TableCell>
                      <TableCell>{c.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {colaboradores.length > 50 && (
                <p className="mt-2 text-xs text-muted-foreground">Exibindo 50 de {colaboradores.length} registros.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default SystemData;
