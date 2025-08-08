import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

const LOGS_KEY = "activityLogs";

type Log = { id: string; ts: string; action: string; by: string; meta?: Record<string, unknown> };

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    document.title = "Logs de Atividades - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Log de atividades dos usuários no sistema MRx Compliance.");
    setLogs(JSON.parse(localStorage.getItem(LOGS_KEY) || "[]"));
  }, []);

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Logs de Atividades</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Últimas ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Sem registros.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{new Date(l.ts).toLocaleString()}</TableCell>
                      <TableCell>{l.by}</TableCell>
                      <TableCell>{l.action}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.meta ? JSON.stringify(l.meta) : "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ActivityLog;
