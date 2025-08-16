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
import { Label } from "@/components/ui/label";

type UserFormData = {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: DatabaseRole;
  empresa_ids: string[];
};

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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [empresas, setEmpresas] = useState<Array<{id: string; nome: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmpresas = async () => {
      const { data } = await supabase
        .from('empresas')
        .select('id, nome')
        .order('nome');
      if (data) setEmpresas(data);
    };
    fetchEmpresas();
  }, []);

  const createForm = useForm<UserFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      full_name: "",
      role: "operacional",
      empresa_ids: []
    }
  });

  const editForm = useForm<Omit<UserFormData, "password">>({
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      role: "operacional",
      empresa_ids: []
    }
  });

  const changePasswordForm = useForm<{ newPassword: string; confirmPassword: string }>({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const handleCreateUser = async (data: UserFormData) => {
    try {
      // Create user with normal signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: data.username,
            full_name: data.full_name
          }
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

      if (!authData.user) {
        toast({
          title: "Erro",
          description: "Falha ao criar usuário.",
          variant: "destructive"
        });
        return;
      }

      // Update the profile with the correct role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.full_name,
          role: data.role as DatabaseRole,
          is_active: true,
          empresa_ids: data.empresa_ids,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't show error to user since the user was created successfully
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
          empresa_ids: data.empresa_ids,
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
      role: user.role,
      empresa_ids: user.empresa_ids || []
    });
    setIsEditOpen(true);
  };

  const openChangePasswordDialog = (user: User) => {
    setChangingPasswordUser(user);
    changePasswordForm.reset({
      newPassword: "",
      confirmPassword: ""
    });
    setIsChangePasswordOpen(true);
  };

  const handleChangePassword = async (data: { newPassword: string; confirmPassword: string }) => {
    if (!changingPasswordUser) return;

    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (data.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('change-user-password', {
        body: {
          user_id: changingPasswordUser.id,
          new_password: data.newPassword
        }
      });

      if (error) {
        toast({
          title: "Erro ao alterar senha",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Senha alterada",
        description: `Senha do usuário ${changingPasswordUser.username} alterada com sucesso.`
      });

      changePasswordForm.reset();
      setIsChangePasswordOpen(false);
      setChangingPasswordUser(null);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao alterar senha.",
        variant: "destructive"
      });
    }
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
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="superuser">Superuser</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(createForm.watch("role") === "empresarial" || createForm.watch("role") === "operacional") && (
                <FormField
                  control={createForm.control}
                  name="empresa_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresas Vinculadas</FormLabel>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {empresas.map((empresa) => (
                          <div key={empresa.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`empresa-${empresa.id}`}
                              checked={field.value.includes(empresa.id)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, empresa.id]
                                  : field.value.filter(id => id !== empresa.id);
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor={`empresa-${empresa.id}`} className="text-sm">
                              {empresa.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <Form {...changePasswordForm}>
            <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Alterando senha para: <strong>{changingPasswordUser?.username}</strong>
              </div>
              <FormField
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite a nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={changePasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme a nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Alterar Senha</Button>
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
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="superuser">Superuser</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(editForm.watch("role") === "empresarial" || editForm.watch("role") === "operacional") && (
                <FormField
                  control={editForm.control}
                  name="empresa_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresas Vinculadas</FormLabel>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {empresas.map((empresa) => (
                          <div key={empresa.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-empresa-${empresa.id}`}
                              checked={field.value.includes(empresa.id)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, empresa.id]
                                  : field.value.filter(id => id !== empresa.id);
                                field.onChange(newValue);
                              }}
                            />
                            <Label htmlFor={`edit-empresa-${empresa.id}`} className="text-sm">
                              {empresa.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => openChangePasswordDialog(user)}
            data-user-id={user.id}
            data-action="change-password"
            className="hidden"
          >
            Alterar Senha
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