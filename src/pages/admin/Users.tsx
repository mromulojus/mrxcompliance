import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
const UsersPage: React.FC = () => {

  React.useEffect(() => {
    document.title = "Usuários - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Gestão de usuários e papéis no sistema.");
  }, []);

  const canDeleteUsers = true;
  const canCreateUsers = true;

  const sampleUsers = [
    { username: "mrxbr", role: "superuser" },
    { username: "admin", role: "administrador" },
    { username: "empresa", role: "empresarial" },
    { username: "oper", role: "operacional" },
  ];

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Usuários</h1>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>Papéis e permissões configuradas</CardDescription>
              </div>
              <Button disabled={!canCreateUsers}>Novo Usuário</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleUsers.map((u) => (
                  <TableRow key={u.username}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell className="uppercase">{u.role}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="destructive" size="sm" disabled={!canDeleteUsers}>Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regras de Acesso</CardTitle>
            <CardDescription>Resumo solicitado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Superuser</strong>: acesso total; credenciais: mrxbr / 1408.</p>
            <p><strong>Administrador</strong>: tudo, exceto excluir usuários e ver logs; sem acesso à estrutura.</p>
            <p><strong>Empresarial</strong>: visualiza dados das empresas vinculadas; não pode criar/excluir usuários.</p>
            <p><strong>Operacional</strong>: acesso na empresa; não vê denúncias nem previsão de rescisão.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default UsersPage;
