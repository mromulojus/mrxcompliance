export type StatusAuditoria = 'NAO_SOLICITADO' | 'SOLICITADO' | 'ENTREGUE';

export interface HistoricoMovimento {
  id: string;
  data: string;
  usuario: string;
  tipo: 'STATUS_MUDANCA' | 'ARQUIVO_UPLOAD' | 'COMENTARIO' | 'VENCIMENTO_ALTERADO';
  descricao: string;
  comentario?: string;
}

export interface ItemAuditoria {
  id: string;
  categoria: string;
  documento: string;
  status: StatusAuditoria;
  data_entrega?: string;
  data_vencimento?: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  historico: HistoricoMovimento[];
}

export interface AuditoriaEmpresa {
  empresa_id: string;
  itens: ItemAuditoria[];
  created_at: string;
  updated_at: string;
}

export const ITENS_AUDITORIA_PADRAO: Omit<ItemAuditoria, 'id'>[] = [
  // I. Documentação Societária e Regulatória
  { categoria: "I. Documentação Societária e Regulatória", documento: "", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Contrato Social (ou Estatuto Social)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Cartão do CNPJ", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Comprovante de Endereço da Sede", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Alvará de Funcionamento Geral", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Alvará Específico (se aplicável)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Documento de Identificação dos Sócios", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Procuração (para representantes legais)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Convenção coletiva", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Organograma Empresarial", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  
  // II. Governança, Ética e Compliance
  { categoria: "II. Governança, Ética e Compliance", documento: "", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Código de Ética e Conduta", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Política Anticorrupção", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Canal de Denúncias (Formulário/Plataforma)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Política contra Assédio Moral e Sexual", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Política de Diversidade, Equidade e Inclusão", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Declaração de Ausência de Conflito de Interesses", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Contrato com o Escritório Jurídico (Compliance)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  
  // III. Proteção de Dados (LGPD)
  { categoria: "III. Proteção de Dados (LGPD)", documento: "", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Política de Segurança da Informação e Privacidade", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Termo de Consentimento para Tratamento de Dados", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Mapeamento de Dados Pessoais (Data Mapping)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  
  // IV. Gestão de Pessoas e Cultura
  { categoria: "IV. Gestão de Pessoas e Cultura", documento: "", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Regimento Interno", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Termo de Ciência e Adesão às Políticas Internas", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Programa de Segurança do Trabalho (PGR/PCMSO)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Plano de Cargos, Carreiras e Funções", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Formulário de Contratação (padrão)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Análise de Perfil Comportamental", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "CONVENÇÃO COLETIVA", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  
  // V. Contratos e Terceiros
  { categoria: "V. Contratos e Terceiros", documento: "", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Contrato Padrão de Prestação de Serviços", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Contrato com Colaboradores (CLT)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Contrato com Fornecedores (Pessoa Jurídica)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Termo de Confidencialidade e Não Divulgação (NDA)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] },
  { categoria: "", documento: "Termo de Responsabilidade Anticorrupção (para terceiros)", status: 'NAO_SOLICITADO' as StatusAuditoria, historico: [] }
];