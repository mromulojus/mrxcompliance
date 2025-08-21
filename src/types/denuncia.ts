export type DenunciaStatus = 'RECEBIDO' | 'EM_ANALISE' | 'INVESTIGACAO' | 'CONCLUIDO';

export interface Comentario {
  id: string;
  denunciaId: string;
  autor: string; // nome ou "Anônimo"
  mensagem: string;
  anexos?: string[]; // URLs dos anexos no Supabase Storage
  createdAt: string; // ISO date
}

export interface Denuncia {
  id: string;
  protocolo: string; // usado para acompanhamento público
  empresaId: string;
  identificado: boolean;
  nome?: string;
  email?: string;
  relacao: 'COLABORADOR' | 'EX_COLABORADOR' | 'FORNECEDOR' | 'CLIENTE' | 'OUTRO';
  tipo: 'DISCRIMINACAO' | 'ASSEDIO_MORAL' | 'CORRUPCAO' | 'VIOLACAO_TRABALHISTA' | 'OUTRO';
  setor?: string;
  conhecimentoFato: 'OUVI_FALAR' | 'DOCUMENTO' | 'COLEGA_TRABALHO' | 'OUTRO';
  envolvidosCientes: boolean;
  descricao: string;
  evidenciasDescricao?: string;
  sugestao?: string;
  anexos?: string[]; // futuro: URLs do Supabase Storage
  status: DenunciaStatus;
  comentarios: Comentario[];
  createdAt: string;
  updatedAt: string;
}
