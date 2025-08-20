export type TaskStatus = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido';
export type TaskPriority = 'alta' | 'media' | 'baixa';
export type TaskModule = 'ouvidoria' | 'auditoria' | 'cobrancas' | 'geral' | 'vendas' | 'juridico' | 'compliance';

// Interface básica para tarefa
export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  prioridade: TaskPriority;
  modulo_origem: TaskModule;
  empresa_id?: string;
  responsavel_id?: string;
  // Archive control
  is_archived?: boolean;
  archived_at?: string;
  // Boards/Columns (opcional)
  board_id?: string;
  column_id?: string;
  // Optional support for multiple responsibles (backward compatible)
  responsavel_ids?: string[];
  created_by: string;
  data_vencimento?: string;
  data_conclusao?: string;
  ordem_na_coluna: number;
  // Departamentos
  department_ids?: string[]; // preenchido via join no front
  primary_department_id?: string; // preenchido via join no front
  
  // Vinculações com outros módulos
  denuncia_id?: string;
  divida_id?: string;
  colaborador_id?: string;
  processo_id?: string;
  
  // Anexos
  anexos?: string[];
  
  created_at: string;
  updated_at: string;
}

// Interface estendida com dados do usuário responsável
export interface TarefaWithUser extends Tarefa {
  responsavel?: {
    user_id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
  };
  // Optional list of responsibles for multi-assignment UIs
  responsaveis?: UserProfile[];
}

// Interface para dados de usuário
export interface UserProfile {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface TaskFormData {
  titulo: string;
  descricao?: string;
  modulo_origem: TaskModule;
  empresa_id?: string;
  responsavel_id?: string;
  status: TaskStatus;
  prioridade: TaskPriority;
  data_vencimento?: string;
  anexos?: string[];
  department_ids?: string[];
  primary_department_id?: string;
  // Contexto de criação em quadros/colunas
  board_id?: string;
  column_id?: string;
}

export interface TaskFilters {
  responsavel?: string;
  prioridade?: TaskPriority;
  empresa?: string;
  modulo?: TaskModule;
  status?: TaskStatus;
  busca?: string;
  department?: string; // filtro por 1 departamento; extendemos depois para múltiplos
}

export interface TaskKPIs {
  total: number;
  a_fazer: number;
  em_andamento: number;
  em_revisao: number;
  concluido: number;
  atrasadas: number;
  vencendo_hoje: number;
}

export const TASK_STATUS_LABELS = {
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento', 
  em_revisao: 'Em Revisão',
  concluido: 'Concluído'
} as const;

export const TASK_PRIORITY_LABELS = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa'
} as const;

export const TASK_MODULE_LABELS = {
  ouvidoria: 'Ouvidoria',
  auditoria: 'Auditoria',
  cobrancas: 'Cobranças',
  geral: 'Geral',
  vendas: 'Vendas',
  juridico: 'Jurídico',
  compliance: 'Compliance'
} as const;

export const PRIORITY_COLORS = {
  alta: 'text-red-600 bg-red-50',
  media: 'text-yellow-600 bg-yellow-50', 
  baixa: 'text-green-600 bg-green-50'
} as const;

export const MODULE_COLORS = {
  ouvidoria: 'text-purple-600 bg-purple-50',
  auditoria: 'text-blue-600 bg-blue-50',
  cobrancas: 'text-orange-600 bg-orange-50',
  geral: 'text-gray-600 bg-gray-50',
  vendas: 'text-green-600 bg-green-50',
  juridico: 'text-indigo-600 bg-indigo-50',
  compliance: 'text-teal-600 bg-teal-50'
} as const;