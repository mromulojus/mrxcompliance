export type TaskStatus = 'A_FAZER' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDO';

export type TaskPriority = 'ALTA' | 'MEDIA' | 'BAIXA';

export type TaskOriginModule = 'OUVIDORIA' | 'AUDITORIA' | 'COBRANCAS';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  originModule: TaskOriginModule;
  empresaId?: string | null;
  processoId?: string | null;
  denunciaId?: string | null;
  dividaId?: string | null;
  responsavelUserId?: string | null;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
  anexos?: string[] | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  originModule: TaskOriginModule;
  empresaId?: string | null;
  processoId?: string | null;
  denunciaId?: string | null;
  dividaId?: string | null;
  responsavelUserId?: string | null;
  anexos?: string[] | null;
}

