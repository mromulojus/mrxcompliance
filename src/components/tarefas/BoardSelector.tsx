import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { Kanban, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BoardSelectorProps {
  selectedBoardId?: string;
  onBoardChange: (boardId: string | undefined) => void;
  empresaId?: string;
}

export function BoardSelector({ selectedBoardId, onBoardChange, empresaId }: BoardSelectorProps) {
  const { boards, createBoard } = useTaskBoards();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const { toast } = useToast();

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
    <div className="flex items-center gap-4">
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