import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { Kanban, Plus, Filter, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskModule, UserProfile } from '@/types/tarefas';
import { supabase } from '@/integrations/supabase/client';

interface BoardSelectorProps {
  selectedBoardId?: string;
  onBoardChange: (boardId: string | undefined) => void;
  empresaId?: string;
  selectedModule?: TaskModule;
  onModuleChange: (module: TaskModule | undefined) => void;
  selectedUser?: string;
  onUserChange: (userId: string | undefined) => void;
}

export function BoardSelector({ 
  selectedBoardId, 
  onBoardChange, 
  empresaId, 
  selectedModule, 
  onModuleChange,
  selectedUser,
  onUserChange 
}: BoardSelectorProps) {
  const { boards, createBoard } = useTaskBoards();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users for filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersResult, userResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id, full_name, username, is_active')
            .eq('is_active', true)
            .order('full_name'),
          supabase.auth.getUser()
        ]);

        if (usersResult.data) setUsers(usersResult.data);
        if (userResult.data.user) setCurrentUser(userResult.data.user.id);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const filteredBoards = boards.filter(board => 
    !empresaId || board.empresa_id === empresaId
  );

  const handleCreateDepartmentBoards = async () => {
    if (!empresaId) {
      toast({
        title: 'Erro',
        description: 'É necessário selecionar uma empresa primeiro',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingBoard(true);
    
    const departmentalBoards = [
      'VENDAS (xGROWTH)',
      'COMPLIANCE (Mrx Compliance)', 
      'JURIDICO (MR Advocacia)',
      'OUVIDORIA (Ouve.ai)',
      'COBRANÇA (Debto)',
      'ADMINISTRATIVO'
    ];

    try {
      // Check if departmental boards already exist
      const existingBoards = filteredBoards.map(b => b.name);
      const boardsToCreate = departmentalBoards.filter(name => 
        !existingBoards.includes(name)
      );

      if (boardsToCreate.length === 0) {
        toast({
          title: 'Quadros já existem',
          description: 'Os quadros departamentais já foram criados para esta empresa'
        });
        return;
      }

      // Create missing departmental boards
      for (const boardName of boardsToCreate) {
        await createBoard(boardName, empresaId);
      }

      toast({
        title: 'Quadros criados',
        description: `${boardsToCreate.length} quadros departamentais foram criados com sucesso`
      });
    } catch (error) {
      console.error('Erro ao criar quadros departamentais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar os quadros departamentais',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingBoard(false);
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Kanban className="h-4 w-4" />
        <span className="text-sm font-medium">Quadro:</span>
      </div>
      
      <Select 
        value={selectedBoardId || "all"} 
        onValueChange={(value) => onBoardChange(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecione um quadro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Tarefas</SelectItem>
          {filteredBoards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              {board.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Módulo:</span>
      </div>

      <Select 
        value={selectedModule || "all"} 
        onValueChange={(value) => onModuleChange(value === "all" ? undefined : value as TaskModule)}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Todos os módulos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Módulos</SelectItem>
          <SelectItem value="geral">🏢 Administrativo</SelectItem>
          <SelectItem value="ouvidoria">🎧 Ouvidoria</SelectItem>
          <SelectItem value="auditoria">🔍 Auditoria</SelectItem>
          <SelectItem value="cobrancas">💰 Cobranças</SelectItem>
          <SelectItem value="vendas">🚀 Vendas</SelectItem>
          <SelectItem value="juridico">⚖️ Jurídico</SelectItem>
          <SelectItem value="compliance">✅ Compliance</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Responsável:</span>
      </div>

      <Select 
        value={selectedUser || "all"} 
        onValueChange={(value) => onUserChange(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Todos os usuários" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {currentUser && (
            <SelectItem value={currentUser}>Minhas Tarefas</SelectItem>
          )}
          <SelectItem value="unassigned">Não Atribuídas</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.user_id} value={user.user_id}>
              {user.full_name || user.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {empresaId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateDepartmentBoards}
          disabled={isCreatingBoard}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreatingBoard ? 'Criando...' : 'Criar Quadros Departamentais'}
        </Button>
      )}
    </div>
  );
}