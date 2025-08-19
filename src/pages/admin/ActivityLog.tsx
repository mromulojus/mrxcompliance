import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ActivityLogRow = Database["public"]["Tables"]["activity_logs"]["Row"];

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Logs de Atividades - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Log de atividades dos usuários no sistema MRx Compliance.");

    const fetchLogs = async () => {
      setLoading(true);
      setErrorMessage(null);
      const { data, error } = await supabase
        .from("activity_logs")
        .select("id, action, by_user, created_at, meta")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        setErrorMessage(error.message);
        setLogs([]);
      } else {
        setLogs(data || []);
      }

      setLoading(false);
    };

    void fetchLogs();

    const channel = supabase
      .channel("activity_logs_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        () => {
          // Recarrega quando houver novas inserções
          void (async () => {
            const { data } = await supabase
              .from("activity_logs")
              .select("id, action, by_user, created_at, meta")
              .order("created_at", { ascending: false })
              .limit(200);
            setLogs(data || []);
          })();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Carregando…</TableCell>
                  </TableRow>
                ) : errorMessage ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-red-600">Erro ao carregar: {errorMessage}</TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Sem registros.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                      <TableCell>{l.by_user}</TableCell>
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
