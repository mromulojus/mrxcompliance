import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserManagement } from "@/components/admin/UserManagement";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
type DatabaseRole = UserRole;

type User = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: DatabaseRole;
  is_active: boolean;
  created_at: string;
  empresa_ids: string[];
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const canDeleteUsers = profile?.role === 'superuser';
  const canCreateUsers = profile?.role === 'superuser' || profile?.role === 'administrador';

  React.useEffect(() => {
    document.title = "Usuários - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Gestão de usuários e papéis no sistema.");
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          full_name,
          role,
          is_active,
          created_at,
          empresa_ids
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Erro ao carregar usuários",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Get emails from auth metadata since we can't use admin API
      const usersWithEmails = (data || []).map((profile) => ({
        id: profile.user_id,
        username: profile.username,
        email: profile.username.includes('@') ? profile.username : `${profile.username}@sistema.interno`,
        full_name: profile.full_name || '',
        role: profile.role as DatabaseRole,
        is_active: profile.is_active,
        created_at: profile.created_at,
        empresa_ids: profile.empresa_ids || []
      }));

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserChange = () => {
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    // Trigger edit dialog in UserManagement component
    const editButton = document.querySelector(`[data-user-id="${user.id}"][data-action="edit"]`) as HTMLButtonElement;
    if (editButton) {
      editButton.click();
    }
  };

  const handleDeleteUser = (user: User) => {
    // Trigger delete dialog in UserManagement component
    const deleteButton = document.querySelector(`[data-user-id="${user.id}"][data-action="delete"]`) as HTMLButtonElement;
    if (deleteButton) {
      deleteButton.click();
    }
  };

  const handleChangePassword = (user: User) => {
    // Trigger change password dialog in UserManagement component
    const changePasswordButton = document.querySelector(`[data-user-id="${user.id}"][data-action="change-password"]`) as HTMLButtonElement;
    if (changePasswordButton) {
      changePasswordButton.click();
    }
  };

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
              <UserManagement 
                users={users}
                onUserChange={handleUserChange}
                canCreateUsers={canCreateUsers}
                canDeleteUsers={canDeleteUsers}
              />
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell className="uppercase">{user.role}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Editar
                        </Button>
                        {profile?.role === 'superuser' && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleChangePassword(user)}
                          >
                            Alterar Senha
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={!canDeleteUsers}
                          onClick={() => handleDeleteUser(user)}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
