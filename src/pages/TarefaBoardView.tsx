import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { KanbanDynamic } from '@/components/ui/kanban-dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskFormModal } from '@/components/tarefas/TaskFormModalNew';
import { TaskFormData } from '@/types/tarefas';
import { useTarefasData } from '@/hooks/useTarefasDataNew';

export default function TarefaBoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    board,
    columns,
    tasks,
    updateBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderTask,
  } = useTaskBoards(boardId);
  const { users, createTarefa } = useTarefasData();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(board?.name || '');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [cardDefaultsDraft, setCardDefaultsDraft] = useState<string>('');

  React.useEffect(() => {
    if (board?.card_default) {
      try { setCardDefaultsDraft(JSON.stringify(board.card_default, null, 2)); }
      catch { setCardDefaultsDraft(''); }
    } else {
      setCardDefaultsDraft('');
    }
  }, [board?.card_default]);

  React.useEffect(() => {
    setNameDraft(board?.name || '');
  }, [board?.name]);

  const handleSaveName = async () => {
    if (board && nameDraft.trim() && nameDraft.trim() !== board.name) {
      await updateBoard(board.id, nameDraft.trim());
    }
    setEditingName(false);
  };

  const onCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowTaskModal(true);
  };

  const columnsForKanban = useMemo(() => columns.map(c => ({ id: c.id, name: c.name, color: c.color })), [columns]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/tarefas/quadros')}>Voltar</Button>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="w-96" />
              <Button onClick={handleSaveName}>Salvar</Button>
              <Button variant="ghost" onClick={() => { setEditingName(false); setNameDraft(board?.name || ''); }}>Cancelar</Button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold" onDoubleClick={() => setEditingName(true)}>{board?.name || 'Quadro'}</h1>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Colunas</span>
            <Button size="sm" onClick={() => void createColumn(boardId as string, `Nova coluna ${columns.length + 1}`)}>Adicionar coluna</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {columns.map((col) => (
              <div key={col.id} className="flex items-center gap-2 border rounded-md p-2 bg-muted/40">
                <Input
                  value={col.name}
                  onChange={(e) => void updateColumn(col.id, { name: e.target.value })}
                  className="w-56"
                />
                <Button variant="ghost" size="sm" onClick={() => void deleteColumn(col.id)}>Excluir</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Modelo padrão de card (JSON)</span>
            <Button size="sm" onClick={() => { try { const json = cardDefaultsDraft ? JSON.parse(cardDefaultsDraft) : null; void updateBoard(boardId as string, nameDraft || board?.name || 'Quadro', json); } catch {} }}>Salvar modelo</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[160px] text-sm rounded-md border p-3 font-mono"
            placeholder='Ex: {"prioridade":"media","modulo_origem":"geral"}'
            value={cardDefaultsDraft}
            onChange={(e) => setCardDefaultsDraft(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">Esse JSON será aplicado como valores padrão ao criar novos cards neste quadro.</p>
        </CardContent>
      </Card>

      <div className="h-[calc(100vh-420px)] min-h-[520px]">
        <KanbanDynamic
          columns={columnsForKanban}
          tasks={tasks}
          onTaskUpdate={(taskId, newColumnId, newOrder) => reorderTask(taskId, newColumnId, newOrder)}
          onCreateTask={onCreateTask}
        />
      </div>

      <TaskFormModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        onSubmit={async (data: TaskFormData) => {
          await createTarefa({ ...data, board_id: boardId, column_id: selectedColumnId || undefined });
          setShowTaskModal(false);
        }}
        users={users}
        defaultValues={{ modulo_origem: 'geral', status: 'a_fazer' }}
        contextData={{ board_id: boardId, column_id: selectedColumnId || undefined }}
      />
    </div>
  );
}

