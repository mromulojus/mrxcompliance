import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTaskStore } from '@/store/taskStore';
import { KanbanColumn } from '@/components/tasks/KanbanColumn';
import { TaskCard } from '@/components/tasks/TaskCard';
import { DraggableTask } from '@/components/tasks/DraggableTask';
import type { Task, TaskStatus } from '@/types/task';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TaskModal } from '@/components/tasks/TaskModal';
import { FixedSizeList as List } from 'react-window';

const statusTitles: Record<TaskStatus, string> = {
  A_FAZER: 'A Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  EM_REVISAO: 'Em Revisão',
  CONCLUIDO: 'Concluído',
};

const Tarefas: React.FC = () => {
  const { tasks, moveTask, createTask } = useTaskStore();
  const [openModal, setOpenModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }),
  );

  const byStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      A_FAZER: [], EM_ANDAMENTO: [], EM_REVISAO: [], CONCLUIDO: [],
    };
    for (const t of tasks) {
      if (globalSearch && !t.title.toLowerCase().includes(globalSearch.toLowerCase())) continue;
      grouped[t.status].push(t);
    }
    for (const k of Object.keys(grouped) as TaskStatus[]) grouped[k].sort((a, b) => a.orderIndex - b.orderIndex);
    return grouped;
  }, [tasks, globalSearch]);

  const onDragEnd = (event: DragEndEvent) => {
    const taskId = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    if (!overId) return;
    const status = overId.replace('drop-', '') as TaskStatus;
    void moveTask(taskId, status);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tarefas</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tarefas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Pesquisar título" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} className="w-64" />
          <Select>
            <SelectTrigger className="w-48"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="me">Meu usuário</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpenModal(true)}>Nova</Button>
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto pb-2">
          {(Object.keys(statusTitles) as TaskStatus[]).map((status) => (
            <div key={status} className="w-72 shrink-0 mr-3">
              <KanbanColumn
                title={statusTitles[status]}
                status={status}
                tasks={byStatus[status]}
                onAdd={() => setOpenModal(true)}
                renderDraggable={(task) => (
                  <SortableContext items={[task.id]} strategy={verticalListSortingStrategy}>
                    <DraggableTask task={task}>
                      {(dragging) => <TaskCard task={task} isDragging={dragging} />}
                    </DraggableTask>
                  </SortableContext>
                )}
              />
            </div>
          ))}
        </div>
      </DndContext>

      <TaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={async (data) => { await createTask({ ...data }); }}
      />
    </div>
  );
};

export default Tarefas;

