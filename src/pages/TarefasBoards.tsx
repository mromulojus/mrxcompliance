import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

export default function TarefasBoards() {
  const navigate = useNavigate();
  const { boards, createBoard, deleteBoard } = useTaskBoards();
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard(newBoardName.trim());
      setNewBoardName('');
      navigate(`/tarefas/quadros/${board.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quadros de Tarefas</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie quadros de tarefas.</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nome do novo quadro"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleCreate} disabled={creating || !newBoardName.trim()}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Card key={board.id} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/tarefas/quadros/${board.id}`)}>
            <CardHeader>
              <CardTitle>{board.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Atualizado em {new Date(board.updated_at).toLocaleDateString('pt-BR')}</span>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); void deleteBoard(board.id); }}>Excluir</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

