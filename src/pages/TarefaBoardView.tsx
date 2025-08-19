import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { KanbanDynamic } from '@/components/ui/kanban-dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskFormModal } from '@/components/tarefas/TaskFormModalNew';
import { TaskFormData } from '@/types/tarefas';
import { useTarefasData } from '@/hooks/useTarefasDataNew';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
		moveColumn,
		reorderTask,
		members,
		addMember,
		removeMember,
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
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">Membros</Button>
					</PopoverTrigger>
					<PopoverContent className="w-96">
						<div className="space-y-3">
							<div>
								<p className="text-sm font-medium mb-2">Membros atuais ({members.length})</p>
								<div className="flex flex-wrap gap-2">
									{members.map(m => {
										const u = users.find(x => x.user_id === m.user_id);
										return (
											<div key={m.user_id} className="flex items-center gap-2 border rounded px-2 py-1">
												<span className="text-sm">{u?.full_name || u?.username || m.user_id}</span>
												<Button variant="ghost" size="sm" onClick={() => void removeMember(boardId as string, m.user_id)}>Remover</Button>
											</div>
										);
									})}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Select onValueChange={(val) => void addMember(boardId as string, val)}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Adicionar membro" />
									</SelectTrigger>
									<SelectContent>
										{users
											.filter(u => !members.some(m => m.user_id === u.user_id))
											.map(u => (
												<SelectItem key={u.user_id} value={u.user_id}>{u.full_name || u.username}</SelectItem>
											))}
									</SelectContent>
								</Select>
								<Button onClick={() => {}} disabled>Adicionar</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
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
						{columns.map((col, idx) => (
							<div key={col.id} className="flex items-center gap-2 border rounded-md p-2 bg-muted/40">
								<Input
									value={col.name}
									onChange={(e) => void updateColumn(col.id, { name: e.target.value })}
									className="w-56"
								/>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="outline" size="sm" style={{ backgroundColor: col.color || undefined }}>Cor</Button>
									</PopoverTrigger>
									<PopoverContent>
										<div className="grid grid-cols-6 gap-2">
											{['#f97316','#ef4444','#22c55e','#3b82f6','#a855f7','#eab308','#06b6d4','#64748b'].map(c => (
												<button key={c} className="h-6 w-6 rounded" style={{ backgroundColor: c }} onClick={(e) => { e.preventDefault(); void updateColumn(col.id, { color: c }); }} />
											))}
										</div>
									</PopoverContent>
								</Popover>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="outline" size="sm">Padrão</Button>
									</PopoverTrigger>
									<PopoverContent className="w-80">
										<textarea
											defaultValue={col.card_default ? JSON.stringify(col.card_default, null, 2) : ''}
											onBlur={async (e) => { try { const json = e.currentTarget.value ? JSON.parse(e.currentTarget.value) : null; await updateColumn(col.id, { } as any); const sb = (await import('@/integrations/supabase/client')).supabase as any; await sb.from('task_columns').update({ card_default: json }).eq('id', col.id); } catch {} }}
											className="w-full h-40 text-xs font-mono border rounded p-2"
											placeholder='{"prioridade":"media"}'
										/>
										<p className="text-[10px] text-muted-foreground mt-1">Ao sair do campo salvamos automaticamente.</p>
									</PopoverContent>
								</Popover>
								<div className="flex items-center gap-1">
									<Button variant="ghost" size="sm" onClick={() => void moveColumn(boardId as string, col.id, Math.max(0, idx - 1))}>◀</Button>
									<Button variant="ghost" size="sm" onClick={() => void moveColumn(boardId as string, col.id, Math.min(columns.length - 1, idx + 1))}>▶</Button>
								</div>
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
					onRenameColumn={async (columnId, newName) => { await updateColumn(columnId, { name: newName }); }}
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