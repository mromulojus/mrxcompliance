export interface DocumentoColaborador {
  id: string;
  tipo: 'RG' | 'CPF' | 'CTPS' | 'COMPROVANTE_ENDERECO' | 'DIPLOMA' | 'CERTIDAO' | 'LAUDO' | 'CONTRATO' | 'OUTROS';
  nome: string;
  url: string;
  data_upload: string;
}

export interface HistoricoColaborador {
  id: string;
  data: string;
  observacao: string;
  usuario: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  empresa: string;
  status: 'ATIVO' | 'INATIVO' | 'DEMITIDO';
  tipo_contrato: 'CLT' | 'PJ' | 'PF';
  data_admissao: string;
  data_nascimento: string;
  sexo: 'MASCULINO' | 'FEMININO';
  salario_base: number;
  telefone: string;
  celular: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  estado_civil: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'UNIAO_ESTAVEL';
  escolaridade: 'FUNDAMENTAL' | 'MEDIO' | 'SUPERIOR' | 'POS_GRADUACAO' | 'MESTRADO' | 'DOUTORADO';
  nome_mae: string;
  nome_pai: string;
  contato_emergencia: {
    nome: string;
    telefone: string;
    parentesco: string;
  };
  documentos: {
    cpf: string;
    rg: string;
    rg_orgao_emissor: string;
    ctps: string;
    ctps_serie: string;
    pis_pasep: string;
    titulo_eleitor: string;
    reservista: string;
  };
  beneficios: {
    vale_transporte: boolean;
    vale_refeicao: boolean;
    valor_vale_transporte: number;
    valor_vale_refeicao: number;
    plano_saude: boolean;
    plano_odontologico: boolean;
  };
  dependentes: {
    tem_filhos_menores_14: boolean;
    quantidade_filhos: number;
    filhos: Array<{
      nome: string;
      data_nascimento: string;
      cpf?: string;
    }>;
  };
  dados_bancarios: {
    banco: string;
    agencia: string;
    conta: string;
    tipo_conta: 'CORRENTE' | 'POUPANCA';
    pix?: string;
  };
  foto_perfil?: string;
  documentos_arquivos: DocumentoColaborador[];
  historico: HistoricoColaborador[];
  auditoria: {
    created_at: string;
    updated_at: string;
    created_by: string;
  };
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  responsavel: string;
  email: string;
  telefone: string;
}

export interface DashboardStats {
  totalColaboradores: number;
  colaboradoresAtivos: number;
  complianceRate: number;
  aniversariantes: number;
}

export interface FiltrosColaborador {
  nome: string;
  status: string;
  empresa: string;
  departamento: string;
}

export type TemaMode = 'claro' | 'escuro';

export interface Tema {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  background: string;
  cardBackground: string;
}