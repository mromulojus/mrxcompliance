export type ProcessoStatus = 'ativo' | 'suspenso' | 'arquivado' | 'transitado_julgado' | 'baixado';
export type EventoTipo = 'audiencia' | 'prazo' | 'reuniao' | 'vencimento' | 'intimacao' | 'peticao' | 'decisao' | 'outro';
export type DocumentoProcessoTipo = 'inicial' | 'contestacao' | 'sentenca' | 'recurso' | 'acordo' | 'comprovante' | 'procuracao' | 'outro';

export interface Evento {
  id: string;
  empresa_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  tipo: EventoTipo;
  local?: string;
  participantes?: string[];
  processo_id?: string;
  divida_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessoJudicial {
  id: string;
  empresa_id: string;
  numero_processo: string;
  titulo: string;
  acao: string;
  juizo?: string;
  vara?: string;
  tribunal?: string;
  link_tribunal?: string;
  autor: string;
  reu: string;
  reu_contratado?: string;
  parte_contraria?: string;
  advogado_responsavel?: string;
  status: ProcessoStatus;
  valor_causa?: number;
  valor_origem?: number;
  valor_compra?: number;
  valor_pensao?: number;
  data_distribuicao?: string;
  data_cadastro: string;
  observacoes?: string;
  divida_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessoHistorico {
  id: string;
  processo_id: string;
  data_evento: string;
  tipo_evento: string;
  descricao: string;
  detalhes?: string;
  urgente: boolean;
  created_by: string;
  created_at: string;
}

export interface ProcessoDocumento {
  id: string;
  processo_id: string;
  nome_documento: string;
  tipo: DocumentoProcessoTipo;
  url_arquivo: string;
  tamanho_arquivo?: number;
  mime_type?: string;
  data_upload: string;
  uploaded_by: string;
  tags?: string[];
  observacoes?: string;
}

export interface ProcessoValor {
  id: string;
  processo_id: string;
  tipo: string; // Will be 'honorario' | 'despesa' | 'valor_processo' but allowing string for database compatibility
  descricao: string;
  valor: number;
  data_vencimento?: string;
  data_pagamento?: string;
  pago: boolean;
  forma_pagamento?: string;
  observacoes?: string;
  created_by: string;
  created_at: string;
}

export interface ProcessoKPIs {
  tempo_medio_tramitacao: number;
  decisoes_favoraveis: number;
  valores_recuperados: number;
  total_processos: number;
}

export interface CalendarioFiltros {
  empresa_id?: string;
  tipo?: EventoTipo;
  data_inicio?: string;
  data_fim?: string;
  processo_id?: string;
}

export interface ProcessoFiltros {
  empresa_id?: string;
  status?: ProcessoStatus;
  numero_processo?: string;
  autor?: string;
  reu?: string;
  advogado?: string;
  tribunal?: string;
  data_inicio?: string;
  data_fim?: string;
}