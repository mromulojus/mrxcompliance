import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colaborador, Empresa, FiltrosColaborador, TemaMode, DashboardStats } from '@/types/hr';
import { Denuncia, DenunciaStatus, Comentario } from '@/types/denuncia';

interface HRContextType {
  colaboradores: Colaborador[];
  empresas: Empresa[];
  filtros: FiltrosColaborador;
  temaMode: TemaMode;
  selectedEmpresa: string;
  
  // Actions
  adicionarColaborador: (colaborador: Omit<Colaborador, 'id' | 'auditoria'>) => void;
  editarColaborador: (id: string, colaborador: Partial<Colaborador>) => void;
  removerColaborador: (id: string) => void;
  adicionarEmpresa: (empresa: Omit<Empresa, 'id'>) => void;
  editarEmpresa: (id: string, empresa: Partial<Empresa>) => void;
  removerEmpresa: (id: string) => void;
  setFiltros: (filtros: Partial<FiltrosColaborador>) => void;
  setTemaMode: (mode: TemaMode) => void;
  selecionarEmpresa: (empresaId: string) => void;
  
  // Denúncias
  denuncias: Denuncia[];
  denunciasNaoTratadas: Denuncia[];
  criarDenuncia: (dados: {
    empresaId: string;
    identificado: boolean;
    nome?: string;
    email?: string;
    relacao: Denuncia['relacao'];
    tipo: Denuncia['tipo'];
    setor?: string;
    conhecimentoFato: Denuncia['conhecimentoFato'];
    envolvidosCientes: boolean;
    descricao: string;
    evidenciasDescricao?: string;
    sugestao?: string;
  }) => string; // retorna protocolo
  atualizarStatus: (id: string, status: DenunciaStatus) => void;
  adicionarComentario: (id: string, autor: string, mensagem: string) => void;
  
  // Computed
  colaboradoresFiltrados: Colaborador[];
  dashboardStats: DashboardStats;
}


const HRContext = createContext<HRContextType | undefined>(undefined);

// Dados mockados
const empresasMock: Empresa[] = [
  {
    id: '1',
    nome: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    responsavel: 'João Silva',
    email: 'contato@techsolutions.com',
    telefone: '(11) 99999-1234'
  },
  {
    id: '2',
    nome: 'Inovação Digital S.A.',
    cnpj: '98.765.432/0001-10',
    endereco: 'Rua da Inovação, 500 - Rio de Janeiro/RJ',
    responsavel: 'Maria Santos',
    email: 'contato@inovacao.com',
    telefone: '(21) 99999-5678'
  },
  {
    id: '3',
    nome: 'Empresa Teste S.A.',
    cnpj: '11.222.333/0001-44',
    endereco: 'Rua dos Testes, 100 - Belo Horizonte/MG',
    responsavel: 'Pedro Costa',
    email: 'contato@teste.com',
    telefone: '(31) 99999-9999'
  }
];

const colaboradoresMock: Colaborador[] = [
  {
    id: '1',
    nome: 'Ana Silva Santos',
    email: 'ana.silva@techsolutions.com',
    cargo: 'Desenvolvedora Senior',
    departamento: 'Tecnologia',
    empresa: '1',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2022-03-15',
    data_nascimento: '1990-05-20',
    sexo: 'FEMININO',
    salario_base: 12000,
    telefone: '(11) 99999-1234',
    celular: '(11) 99999-1234',
    endereco: 'Rua das Flores, 123',
    cep: '01234-567',
    cidade: 'São Paulo',
    estado: 'SP',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Maria Silva',
    nome_pai: 'João Silva',
    contato_emergencia: {
      nome: 'Maria Silva',
      telefone: '(11) 98888-7777',
      parentesco: 'Mãe'
    },
    documentos: {
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      rg_orgao_emissor: 'SSP/SP',
      ctps: '1234567890',
      ctps_serie: '001',
      pis_pasep: '12345678901',
      titulo_eleitor: '123456789012',
      reservista: '123456789'
    },
    beneficios: {
      vale_transporte: true,
      vale_refeicao: true,
      valor_vale_transporte: 200,
      valor_vale_refeicao: 600,
      plano_saude: true,
      plano_odontologico: false
    },
    dependentes: {
      tem_filhos_menores_14: false,
      quantidade_filhos: 0,
      filhos: []
    },
    dados_bancarios: {
      banco: '001 - Banco do Brasil',
      agencia: '1234-5',
      conta: '12345-6',
      tipo_conta: 'CORRENTE',
      pix: 'ana.silva@techsolutions.com'
    },
    documentos_arquivos: [],
    historico: [],
    auditoria: {
      created_at: '2022-03-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 'admin'
    }
  },
  {
    id: '2',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@inovacao.com',
    cargo: 'Product Manager',
    departamento: 'Produto',
    empresa: '2',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2023-01-10',
    data_nascimento: '1985-12-10',
    sexo: 'MASCULINO',
    salario_base: 15000,
    telefone: '(21) 88888-5678',
    celular: '(21) 99999-5678',
    endereco: 'Av. Copacabana, 456',
    cep: '22070-011',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    estado_civil: 'CASADO',
    escolaridade: 'POS_GRADUACAO',
    nome_mae: 'Rosa Oliveira',
    nome_pai: 'Pedro Oliveira',
    contato_emergencia: {
      nome: 'Lucia Oliveira',
      telefone: '(21) 97777-8888',
      parentesco: 'Esposa'
    },
    documentos: {
      cpf: '987.654.321-00',
      rg: '98.765.432-1',
      rg_orgao_emissor: 'DETRAN/RJ',
      ctps: '0987654321',
      ctps_serie: '002',
      pis_pasep: '98765432100',
      titulo_eleitor: '987654321098',
      reservista: '987654321'
    },
    beneficios: {
      vale_transporte: false,
      vale_refeicao: true,
      valor_vale_transporte: 0,
      valor_vale_refeicao: 800,
      plano_saude: true,
      plano_odontologico: true
    },
    dependentes: {
      tem_filhos_menores_14: true,
      quantidade_filhos: 2,
      filhos: [
        {
          nome: 'João Oliveira',
          data_nascimento: '2015-03-20',
          cpf: '123.456.789-10'
        },
        {
          nome: 'Maria Oliveira',
          data_nascimento: '2018-08-15'
        }
      ]
    },
    dados_bancarios: {
      banco: '237 - Bradesco',
      agencia: '9876-5',
      conta: '98765-4',
      tipo_conta: 'CORRENTE',
      pix: '(21) 99999-5678'
    },
    documentos_arquivos: [],
    historico: [],
    auditoria: {
      created_at: '2023-01-10T09:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
      created_by: 'admin'
    }
  },
  // 10 colaboradores da empresa teste
  {
    id: '3',
    nome: 'João Santos Silva',
    email: 'joao.santos@teste.com',
    cargo: 'Analista de Sistemas',
    departamento: 'Tecnologia',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'PJ',
    data_admissao: '2023-06-01',
    data_nascimento: '1992-03-15',
    sexo: 'MASCULINO',
    salario_base: 8500,
    telefone: '(31) 99999-0001',
    celular: '(31) 99999-0001',
    endereco: 'Rua A, 100',
    cep: '30100-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Ana Santos',
    nome_pai: 'José Silva',
    contato_emergencia: { nome: 'Ana Santos', telefone: '(31) 98888-0001', parentesco: 'Mãe' },
    documentos: { cpf: '111.111.111-11', rg: '11.111.111-1', rg_orgao_emissor: 'SSP/MG', ctps: '1111111111', ctps_serie: '001', pis_pasep: '11111111111', titulo_eleitor: '111111111111', reservista: '111111111' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 180, valor_vale_refeicao: 500, plano_saude: true, plano_odontologico: false },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '104 - Caixa Econômica', agencia: '1111-1', conta: '11111-1', tipo_conta: 'CORRENTE', pix: 'joao.santos@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-06-01T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '4',
    nome: 'Maria Fernanda Costa',
    email: 'maria.costa@teste.com',
    cargo: 'Gerente de RH',
    departamento: 'Recursos Humanos',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2023-04-15',
    data_nascimento: '1988-07-22',
    sexo: 'FEMININO',
    salario_base: 11000,
    telefone: '(31) 99999-0002',
    celular: '(31) 99999-0002',
    endereco: 'Rua B, 200',
    cep: '30200-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'CASADO',
    escolaridade: 'POS_GRADUACAO',
    nome_mae: 'Rosa Costa',
    nome_pai: 'Pedro Costa',
    contato_emergencia: { nome: 'Carlos Costa', telefone: '(31) 98888-0002', parentesco: 'Esposo' },
    documentos: { cpf: '222.222.222-22', rg: '22.222.222-2', rg_orgao_emissor: 'SSP/MG', ctps: '2222222222', ctps_serie: '002', pis_pasep: '22222222222', titulo_eleitor: '222222222222', reservista: '' },
    beneficios: { vale_transporte: false, vale_refeicao: true, valor_vale_transporte: 0, valor_vale_refeicao: 650, plano_saude: true, plano_odontologico: true },
    dependentes: { tem_filhos_menores_14: true, quantidade_filhos: 1, filhos: [{ nome: 'Ana Costa', data_nascimento: '2016-01-10' }] },
    dados_bancarios: { banco: '033 - Santander', agencia: '2222-2', conta: '22222-2', tipo_conta: 'CORRENTE', pix: 'maria.costa@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-04-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '5',
    nome: 'Pedro Almeida',
    email: 'pedro.almeida@teste.com',
    cargo: 'Desenvolvedor Frontend',
    departamento: 'Tecnologia',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'PF',
    data_admissao: '2023-08-01',
    data_nascimento: '1995-11-30',
    sexo: 'MASCULINO',
    salario_base: 9200,
    telefone: '(31) 99999-0003',
    celular: '(31) 99999-0003',
    endereco: 'Rua C, 300',
    cep: '30300-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Lucia Almeida',
    nome_pai: 'Roberto Almeida',
    contato_emergencia: { nome: 'Lucia Almeida', telefone: '(31) 98888-0003', parentesco: 'Mãe' },
    documentos: { cpf: '333.333.333-33', rg: '33.333.333-3', rg_orgao_emissor: 'SSP/MG', ctps: '3333333333', ctps_serie: '003', pis_pasep: '33333333333', titulo_eleitor: '333333333333', reservista: '333333333' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 200, valor_vale_refeicao: 550, plano_saude: true, plano_odontologico: false },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '341 - Itaú', agencia: '3333-3', conta: '33333-3', tipo_conta: 'CORRENTE', pix: 'pedro.almeida@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-08-01T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '6',
    nome: 'Carla Mendes',
    email: 'carla.mendes@teste.com',
    cargo: 'Analista Financeiro',
    departamento: 'Financeiro',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2023-05-10',
    data_nascimento: '1991-09-18',
    sexo: 'FEMININO',
    salario_base: 7800,
    telefone: '(31) 99999-0004',
    celular: '(31) 99999-0004',
    endereco: 'Rua D, 400',
    cep: '30400-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Sandra Mendes',
    nome_pai: 'Marcos Mendes',
    contato_emergencia: { nome: 'Sandra Mendes', telefone: '(31) 98888-0004', parentesco: 'Mãe' },
    documentos: { cpf: '444.444.444-44', rg: '44.444.444-4', rg_orgao_emissor: 'SSP/MG', ctps: '4444444444', ctps_serie: '004', pis_pasep: '44444444444', titulo_eleitor: '444444444444', reservista: '' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 170, valor_vale_refeicao: 480, plano_saude: true, plano_odontologico: true },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '237 - Bradesco', agencia: '4444-4', conta: '44444-4', tipo_conta: 'CORRENTE', pix: 'carla.mendes@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-05-10T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '7',
    nome: 'Roberto Silva Junior',
    email: 'roberto.junior@teste.com',
    cargo: 'Coordenador de Marketing',
    departamento: 'Marketing',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2023-07-01',
    data_nascimento: '1987-12-05',
    sexo: 'MASCULINO',
    salario_base: 10500,
    telefone: '(31) 99999-0005',
    celular: '(31) 99999-0005',
    endereco: 'Rua E, 500',
    cep: '30500-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'CASADO',
    escolaridade: 'POS_GRADUACAO',
    nome_mae: 'Vera Silva',
    nome_pai: 'Roberto Silva',
    contato_emergencia: { nome: 'Patricia Silva', telefone: '(31) 98888-0005', parentesco: 'Esposa' },
    documentos: { cpf: '555.555.555-55', rg: '55.555.555-5', rg_orgao_emissor: 'SSP/MG', ctps: '5555555555', ctps_serie: '005', pis_pasep: '55555555555', titulo_eleitor: '555555555555', reservista: '555555555' },
    beneficios: { vale_transporte: false, vale_refeicao: true, valor_vale_transporte: 0, valor_vale_refeicao: 600, plano_saude: true, plano_odontologico: true },
    dependentes: { tem_filhos_menores_14: true, quantidade_filhos: 2, filhos: [{ nome: 'Lucas Silva', data_nascimento: '2017-04-12' }, { nome: 'Julia Silva', data_nascimento: '2019-08-25' }] },
    dados_bancarios: { banco: '001 - Banco do Brasil', agencia: '5555-5', conta: '55555-5', tipo_conta: 'CORRENTE', pix: 'roberto.junior@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-07-01T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '8',
    nome: 'Fernanda Oliveira',
    email: 'fernanda.oliveira@teste.com',
    cargo: 'Designer UX/UI',
    departamento: 'Design',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'PJ',
    data_admissao: '2023-09-15',
    data_nascimento: '1993-04-28',
    sexo: 'FEMININO',
    salario_base: 8800,
    telefone: '(31) 99999-0006',
    celular: '(31) 99999-0006',
    endereco: 'Rua F, 600',
    cep: '30600-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Carmen Oliveira',
    nome_pai: 'Sergio Oliveira',
    contato_emergencia: { nome: 'Carmen Oliveira', telefone: '(31) 98888-0006', parentesco: 'Mãe' },
    documentos: { cpf: '666.666.666-66', rg: '66.666.666-6', rg_orgao_emissor: 'SSP/MG', ctps: '6666666666', ctps_serie: '006', pis_pasep: '66666666666', titulo_eleitor: '666666666666', reservista: '' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 190, valor_vale_refeicao: 520, plano_saude: true, plano_odontologico: false },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '104 - Caixa Econômica', agencia: '6666-6', conta: '66666-6', tipo_conta: 'CORRENTE', pix: 'fernanda.oliveira@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-09-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '9',
    nome: 'Rafael Santos',
    email: 'rafael.santos@teste.com',
    cargo: 'Analista de Qualidade',
    departamento: 'Qualidade',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2023-10-01',
    data_nascimento: '1990-06-14',
    sexo: 'MASCULINO',
    salario_base: 7500,
    telefone: '(31) 99999-0007',
    celular: '(31) 99999-0007',
    endereco: 'Rua G, 700',
    cep: '30700-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'CASADO',
    escolaridade: 'MEDIO',
    nome_mae: 'Gloria Santos',
    nome_pai: 'Antonio Santos',
    contato_emergencia: { nome: 'Bruna Santos', telefone: '(31) 98888-0007', parentesco: 'Esposa' },
    documentos: { cpf: '777.777.777-77', rg: '77.777.777-7', rg_orgao_emissor: 'SSP/MG', ctps: '7777777777', ctps_serie: '007', pis_pasep: '77777777777', titulo_eleitor: '777777777777', reservista: '777777777' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 160, valor_vale_refeicao: 450, plano_saude: true, plano_odontologico: false },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '033 - Santander', agencia: '7777-7', conta: '77777-7', tipo_conta: 'CORRENTE', pix: 'rafael.santos@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-10-01T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '10',
    nome: 'Amanda Costa Lima',
    email: 'amanda.lima@teste.com',
    cargo: 'Assistente Administrativo',
    departamento: 'Administrativo',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2023-11-01',
    data_nascimento: '1996-08-20',
    sexo: 'FEMININO',
    salario_base: 4200,
    telefone: '(31) 99999-0008',
    celular: '(31) 99999-0008',
    endereco: 'Rua H, 800',
    cep: '30800-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'MEDIO',
    nome_mae: 'Silvia Lima',
    nome_pai: 'Eduardo Lima',
    contato_emergencia: { nome: 'Silvia Lima', telefone: '(31) 98888-0008', parentesco: 'Mãe' },
    documentos: { cpf: '888.888.888-88', rg: '88.888.888-8', rg_orgao_emissor: 'SSP/MG', ctps: '8888888888', ctps_serie: '008', pis_pasep: '88888888888', titulo_eleitor: '888888888888', reservista: '' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 140, valor_vale_refeicao: 400, plano_saude: false, plano_odontologico: false },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '341 - Itaú', agencia: '8888-8', conta: '88888-8', tipo_conta: 'CORRENTE', pix: 'amanda.lima@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2023-11-01T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '11',
    nome: 'Gabriel Pereira',
    email: 'gabriel.pereira@teste.com',
    cargo: 'Desenvolvedor Backend',
    departamento: 'Tecnologia',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'PF',
    data_admissao: '2024-01-15',
    data_nascimento: '1994-02-10',
    sexo: 'MASCULINO',
    salario_base: 10200,
    telefone: '(31) 99999-0009',
    celular: '(31) 99999-0009',
    endereco: 'Rua I, 900',
    cep: '30900-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'SOLTEIRO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Helena Pereira',
    nome_pai: 'Miguel Pereira',
    contato_emergencia: { nome: 'Helena Pereira', telefone: '(31) 98888-0009', parentesco: 'Mãe' },
    documentos: { cpf: '999.999.999-99', rg: '99.999.999-9', rg_orgao_emissor: 'SSP/MG', ctps: '9999999999', ctps_serie: '009', pis_pasep: '99999999999', titulo_eleitor: '999999999999', reservista: '999999999' },
    beneficios: { vale_transporte: false, vale_refeicao: true, valor_vale_transporte: 0, valor_vale_refeicao: 580, plano_saude: true, plano_odontologico: true },
    dependentes: { tem_filhos_menores_14: false, quantidade_filhos: 0, filhos: [] },
    dados_bancarios: { banco: '237 - Bradesco', agencia: '9999-9', conta: '99999-9', tipo_conta: 'CORRENTE', pix: 'gabriel.pereira@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', created_by: 'admin' }
  },
  {
    id: '12',
    nome: 'Juliana Rodrigues',
    email: 'juliana.rodrigues@teste.com',
    cargo: 'Coordenadora de Vendas',
    departamento: 'Vendas',
    empresa: '3',
    status: 'ATIVO',
    tipo_contrato: 'CLT',
    data_admissao: '2024-02-01',
    data_nascimento: '1989-10-30',
    sexo: 'FEMININO',
    salario_base: 9500,
    telefone: '(31) 99999-0010',
    celular: '(31) 99999-0010',
    endereco: 'Rua J, 1000',
    cep: '31000-000',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    estado_civil: 'DIVORCIADO',
    escolaridade: 'SUPERIOR',
    nome_mae: 'Cristina Rodrigues',
    nome_pai: 'Fernando Rodrigues',
    contato_emergencia: { nome: 'Cristina Rodrigues', telefone: '(31) 98888-0010', parentesco: 'Mãe' },
    documentos: { cpf: '101.010.101-01', rg: '10.101.010-1', rg_orgao_emissor: 'SSP/MG', ctps: '1010101010', ctps_serie: '010', pis_pasep: '10101010101', titulo_eleitor: '101010101010', reservista: '' },
    beneficios: { vale_transporte: true, vale_refeicao: true, valor_vale_transporte: 210, valor_vale_refeicao: 620, plano_saude: true, plano_odontologico: false },
    dependentes: { tem_filhos_menores_14: true, quantidade_filhos: 1, filhos: [{ nome: 'Isabela Rodrigues', data_nascimento: '2014-05-18', cpf: '123.987.654-32' }] },
    dados_bancarios: { banco: '001 - Banco do Brasil', agencia: '1010-1', conta: '10101-0', tipo_conta: 'CORRENTE', pix: 'juliana.rodrigues@teste.com' },
    documentos_arquivos: [],
    historico: [],
    auditoria: { created_at: '2024-02-01T10:00:00Z', updated_at: '2024-02-01T10:00:00Z', created_by: 'admin' }
  }
];

export function HRProvider({ children }: { children: React.ReactNode }) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(colaboradoresMock);
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasMock);
  const [filtros, setFiltrosState] = useState<FiltrosColaborador>({
    nome: '',
    status: '',
    empresa: '',
    departamento: ''
  });
  const [temaMode, setTemaMode] = useState<TemaMode>('claro');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  // Denúncias (simulação/localStorage até integrar Supabase)
  const [denuncias, setDenuncias] = useState<Denuncia[]>(() => {
    try {
      const raw = localStorage.getItem('denuncias');
      return raw ? JSON.parse(raw) as Denuncia[] : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try { localStorage.setItem('denuncias', JSON.stringify(denuncias)); } catch {}
  }, [denuncias]);

  const adicionarColaborador = (novoColaborador: Omit<Colaborador, 'id' | 'auditoria'>) => {
    const colaborador: Colaborador = {
      ...novoColaborador,
      id: Date.now().toString(),
      auditoria: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user'
      }
    };
    setColaboradores(prev => [...prev, colaborador]);
  };

  const editarColaborador = (id: string, updates: Partial<Colaborador>) => {
    setColaboradores(prev =>
      prev.map(colab =>
        colab.id === id
          ? {
              ...colab,
              ...updates,
              auditoria: {
                ...colab.auditoria,
                updated_at: new Date().toISOString()
              }
            }
          : colab
      )
    );
  };

  const removerColaborador = (id: string) => {
    setColaboradores(prev => prev.filter(colab => colab.id !== id));
  };

  const setFiltros = (novosFiltros: Partial<FiltrosColaborador>) => {
    setFiltrosState(prev => ({ ...prev, ...novosFiltros }));
  };

  const selecionarEmpresa = (empresaId: string) => {
    setSelectedEmpresa(empresaId);
  };

  const adicionarEmpresa = (novaEmpresa: Omit<Empresa, 'id'>) => {
    const empresa: Empresa = {
      ...novaEmpresa,
      id: Date.now().toString()
    };
    setEmpresas(prev => [...prev, empresa]);
  };

  const editarEmpresa = (id: string, updates: Partial<Empresa>) => {
    setEmpresas(prev =>
      prev.map(empresa =>
        empresa.id === id ? { ...empresa, ...updates } : empresa
      )
    );
  };

  const removerEmpresa = (id: string) => {
    setEmpresas(prev => prev.filter(empresa => empresa.id !== id));
    // Remove colaboradores da empresa
    setColaboradores(prev => prev.filter(colab => colab.empresa !== id));
  };

// Funções de Denúncias
const generateProtocolo = () => {
  const part = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MRX-${Date.now().toString().slice(-6)}-${part}`;
};

const criarDenuncia: HRContextType['criarDenuncia'] = (dados) => {
  const agora = new Date().toISOString();
  const nova: Denuncia = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    protocolo: generateProtocolo(),
    empresaId: dados.empresaId,
    identificado: dados.identificado,
    nome: dados.nome,
    email: dados.email,
    relacao: dados.relacao,
    tipo: dados.tipo,
    setor: dados.setor,
    conhecimentoFato: dados.conhecimentoFato,
    envolvidosCientes: dados.envolvidosCientes,
    descricao: dados.descricao,
    evidenciasDescricao: dados.evidenciasDescricao,
    sugestao: dados.sugestao,
    anexos: [],
    status: 'RECEBIDO',
    comentarios: [],
    createdAt: agora,
    updatedAt: agora,
  };
  setDenuncias(prev => [nova, ...prev]);
  return nova.protocolo;
};

const atualizarStatus: HRContextType['atualizarStatus'] = (id, status) => {
  setDenuncias(prev => prev.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d));
};

const adicionarComentario: HRContextType['adicionarComentario'] = (id, autor, mensagem) => {
  setDenuncias(prev => prev.map(d => {
    if (d.id !== id) return d;
    const comentario: Comentario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      denunciaId: id,
      autor,
      mensagem,
      createdAt: new Date().toISOString(),
    };
    return { ...d, comentarios: [...d.comentarios, comentario], updatedAt: new Date().toISOString() };
  }));
};

const denunciasNaoTratadas = denuncias.filter(d => d.status === 'RECEBIDO');

// Colaboradores filtrados
const colaboradoresFiltrados = colaboradores.filter(colab => {
  if (filtros.nome && !colab.nome.toLowerCase().includes(filtros.nome.toLowerCase())) {
    return false;
  }
  if (filtros.status && colab.status !== filtros.status) {
    return false;
  }
  if (filtros.empresa && colab.empresa !== filtros.empresa) {
    return false;
  }
  if (filtros.departamento && colab.departamento !== filtros.departamento) {
    return false;
  }
  if (selectedEmpresa && colab.empresa !== selectedEmpresa) {
    return false;
  }
  return true;
});

  // Stats do dashboard
  const calcComplianceMedia = () => {
    try {
      const rates = empresas.map((e) => {
        const data = localStorage.getItem(`auditoria-${e.id}`);
        if (!data) return null;
        const auditoria = JSON.parse(data) as { itens?: any[] };
        const documentos = (auditoria.itens || []).filter((i: any) => i.documento && i.documento.trim() !== '');
        if (documentos.length === 0) return null;
        const entregues = documentos.filter((i: any) => i.status === 'ENTREGUE').length;
        return Math.round((entregues / documentos.length) * 100);
      }).filter((r): r is number => r !== null);
      if (rates.length === 0) return 0;
      return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    } catch {
      return 0;
    }
  };

  const dashboardStats: DashboardStats = {
    totalColaboradores: colaboradores.length,
    colaboradoresAtivos: colaboradores.filter(c => c.status === 'ATIVO').length,
    // Taxa de compliance baseada no progresso das auditorias
    complianceRate: calcComplianceMedia(),
    aniversariantes: colaboradores.filter(c => {
      const hoje = new Date();
      const aniversario = new Date(c.data_nascimento);
      return aniversario.getMonth() === hoje.getMonth();
    }).length
  };

  return (
    <HRContext.Provider
      value={{
        colaboradores,
        empresas,
        filtros,
        temaMode,
        selectedEmpresa,
        adicionarColaborador,
        editarColaborador,
        removerColaborador,
        adicionarEmpresa,
        editarEmpresa,
        removerEmpresa,
        setFiltros,
        setTemaMode,
        selecionarEmpresa,
        colaboradoresFiltrados,
        dashboardStats,
        // Funções de denúncias
        denuncias,
        denunciasNaoTratadas,
        criarDenuncia,
        atualizarStatus,
        adicionarComentario
      }}
    >
      {children}
    </HRContext.Provider>
  );
}

export function useHR() {
  const context = useContext(HRContext);
  if (context === undefined) {
    throw new Error('useHR deve ser usado dentro de um HRProvider');
  }
  return context;
}