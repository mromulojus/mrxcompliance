import { create } from 'zustand';
import type { Task, TaskStatus, CreateTaskInput } from '@/types/task';

type TaskState = {
  tasks: Task[];
  isLoading: boolean;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  moveTask: (id: string, toStatus: TaskStatus, newIndex?: number) => Promise<void>;
  fetchTasks: (filters?: Partial<Pick<Task, 'empresaId' | 'originModule' | 'responsavelUserId' | 'priority'>>) => Promise<void>;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  async fetchTasks(filters) {
    set({ isLoading: true });
    try {
      // Placeholder local state for now; integrate Supabase soon
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      set({ isLoading: false });
    }
  },
  async createTask(input) {
    const temp: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status ?? 'A_FAZER',
      priority: input.priority ?? 'MEDIA',
      dueDate: input.dueDate ?? null,
      originModule: input.originModule,
      empresaId: input.empresaId ?? null,
      processoId: input.processoId ?? null,
      denunciaId: input.denunciaId ?? null,
      dividaId: input.dividaId ?? null,
      responsavelUserId: input.responsavelUserId ?? null,
      orderIndex: (get().tasks.filter(t => t.status === (input.status ?? 'A_FAZER')).length) + 1,
      anexos: input.anexos ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ tasks: [temp, ...get().tasks] });
    return temp;
  },
  async updateTask(id, updates) {
    const updatedTasks = get().tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    set({ tasks: updatedTasks });
    const task = updatedTasks.find(t => t.id === id)!;
    return task;
  },
  async moveTask(id, toStatus, newIndex) {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const without = tasks.filter(t => t.id !== id);
    const sameStatus = without.filter(t => t.status === toStatus)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const insertAt = Math.max(0, Math.min(newIndex ?? sameStatus.length, sameStatus.length));
    sameStatus.splice(insertAt, 0, { ...task, status: toStatus });
    const reindexed = [
      ...without.filter(t => t.status !== toStatus),
      ...sameStatus.map((t, idx) => ({ ...t, orderIndex: idx + 1 })),
    ];
    set({ tasks: reindexed });
  },
}));

