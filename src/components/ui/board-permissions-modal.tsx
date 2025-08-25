import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Search } from 'lucide-react';
import { BoardPermission } from '@/hooks/useTaskBoards';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BoardPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
  permissions: BoardPermission[];
  onAddPermission: (userId: string, level: 'view' | 'edit' | 'admin') => Promise<void>;
  onRemovePermission: (permissionId: string) => Promise<void>;
}

interface User {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

const permissionLabels = {
  view: 'Visualizar',
  edit: 'Editar',
  admin: 'Administrador'
};

const permissionColors = {
  view: 'bg-blue-100 text-blue-800',
  edit: 'bg-green-100 text-green-800', 
  admin: 'bg-red-100 text-red-800'
};

export function BoardPermissionsModal({
  isOpen,
  onClose,
  boardId,
  boardName,
  permissions,
  onAddPermission,
  onRemovePermission
}: BoardPermissionsModalProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .eq('is_active', true);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    !permissions.some(p => p.user_id === user.user_id) &&
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPermission = async () => {
    if (!selectedUser) {
      toast({
        title: "Erro",
        description: "Selecione um usuário",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddPermission(selectedUser, selectedPermission);
      setSelectedUser('');
      setSelectedPermission('view');
      toast({
        title: "Sucesso",
        description: "Permissão adicionada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar permissão",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePermission = async (permissionId: string, userName: string) => {
    try {
      await onRemovePermission(permissionId);
      toast({
        title: "Sucesso",
        description: `Permissão de ${userName} removida`
      });
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover permissão",
        variant: "destructive"
      });
    }
  };

  const getUserInitials = (name: string, username: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return username?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Permissões - {boardName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Adicionar Nova Permissão */}
          <div className="border rounded-lg p-4 space-y-4">
            <Label className="text-sm font-medium">Adicionar Usuário</Label>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchTerm && filteredUsers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredUsers.map(user => (
                      <div
                        key={user.user_id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                        onClick={() => {
                          setSelectedUser(user.user_id);
                          setSearchTerm(user.full_name || user.username);
                        }}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {getUserInitials(user.full_name, user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || user.username}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Select value={selectedPermission} onValueChange={(value: 'view' | 'edit' | 'admin') => setSelectedPermission(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Visualizar</SelectItem>
                  <SelectItem value="edit">Editar</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddPermission} disabled={!selectedUser || isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de Permissões Atuais */}
          <div>
            <Label className="text-sm font-medium">Usuários com Acesso</Label>
            
            {permissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum usuário com permissões específicas</p>
                <p className="text-sm">Quadro público pode ser visto por todos</p>
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {permissions.map(permission => {
                  const user = permission.profiles;
                  return (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user?.avatar_url} />
                          <AvatarFallback>
                            {getUserInitials(user?.full_name || '', user?.username || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.full_name || user?.username}</p>
                          <p className="text-sm text-gray-500">@{user?.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={permissionColors[permission.permission_level]}>
                          {permissionLabels[permission.permission_level]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePermission(permission.id, user?.full_name || user?.username || '')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}