import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/context/AuthContext";

type DatabaseRole = UserRole;
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type UserFormData = {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: DatabaseRole;
};

type User = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: DatabaseRole;
  is_active: boolean;
  created_at: string;
};

type UserManagementProps = {
  users: User[];
  onUserChange: () => void;
  canCreateUsers: boolean;
  canDeleteUsers: boolean;
};

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUserChange,
  canCreateUsers,
  canDeleteUsers
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const createForm = useForm<UserFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      full_name: "",
      role: "operacional"
    }
  });

  const editForm = useForm<Omit<UserFormData, "password">>({
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      role: "operacional"
    }
  });

  const handleCreateUser = async (data: UserFormData) => {
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        user_metadata: {
          username: data.username,
          full_name: data.full_name
        }
      });

      if (authError) {
        toast({
          title: "Erro ao criar usuário",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          username: data.username,
          full_name: data.full_name,
          role: data.role as DatabaseRole,
          is_active: true
        });

      if (profileError) {
        toast({
          title: "Erro ao criar perfil",
          description: profileError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Usuário criado",
        description: `Usuário ${data.username} criado com sucesso.`
      });

      createForm.reset();
      setIsCreateOpen(false);
      onUserChange();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao criar usuário.",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async (data: Omit<UserFormData, "password">) => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.full_name,
          role: data.role as DatabaseRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', editingUser.id);

      if (error) {
        toast({
          title: "Erro ao editar usuário",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Usuário editado",
        description: `Usuário ${data.username} editado com sucesso.`
      });

      editForm.reset();
      setIsEditOpen(false);
      setEditingUser(null);
      onUserChange();
    } catch (error) {
      console.error('Error editing user:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao editar usuário.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      // Deactivate user instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Erro ao excluir usuário",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Usuário excluído",
        description: `Usuário ${user.username} foi desativado.`
      });

      onUserChange();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao excluir usuário.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
    setIsEditOpen(true);
  };

  return (
    <>
      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCreateUsers}>Novo Usuário</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome de usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um papel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operacional">Operacional</SelectItem>
                        <SelectItem value="empresarial">Empresarial</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="superuser">Superuser</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Usuário</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome de usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um papel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operacional">Operacional</SelectItem>
                        <SelectItem value="empresarial">Empresarial</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="superuser">Superuser</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Render action buttons for each user */}
      {users.map((user) => (
        <div key={user.id} className="hidden">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openEditDialog(user)}
            data-user-id={user.id}
            data-action="edit"
          >
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={!canDeleteUsers}
                data-user-id={user.id}
                data-action="delete"
              >
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o usuário {user.username}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteUser(user)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </>
  );
};