import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Colaborador, Empresa, FiltrosColaborador, DashboardStats, TemaMode } from '@/types/hr';
import { Denuncia } from '@/types/denuncia';
import { useSupabaseData, Colaborador as SupabaseColaborador, Empresa as SupabaseEmpresa } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface HRContextType {
  // Dados
  colaboradores: Colaborador[];
  empresas: Empresa[];
  denuncias: Denuncia[];
  loading: boolean;
  
  // Filtros e estado
  filtros: FiltrosColaborador;
  temaMode: TemaMode;
  empresaSelecionada: string | null;
  
  // Ações de Colaboradores
  adicionarColaborador: (colaborador: Omit<Colaborador, 'id' | 'auditoria'>) => Promise<void>;
  editarColaborador: (id: string, colaborador: Partial<Omit<Colaborador, 'id' | 'auditoria'>>) => Promise<void>;
  removerColaborador: (id: string) => Promise<void>;
  
  // Ações de Empresas
  adicionarEmpresa: (empresa: Omit<Empresa, 'id'>) => Promise<void>;
  editarEmpresa: (id: string, empresa: Partial<Omit<Empresa, 'id'>>) => Promise<void>;
  removerEmpresa: (id: string) => Promise<void>;
  
  // Filtros e tema
  setFiltros: (filtros: Partial<FiltrosColaborador>) => void;
  setTemaMode: (mode: TemaMode) => void;
  selecionarEmpresa: (empresaId: string | null) => void;
  
  // Denúncias
  criarDenuncia: (denuncia: any) => void;
  atualizarStatus: (id: string, status: string) => void;
  adicionarComentario: (id: string, comentario: any) => void;
  denunciasNaoTratadas: Denuncia[];
  
  // Computados
  colaboradoresFiltrados: Colaborador[];
  dashboardStats: DashboardStats;
  
  // Refresh
  refetchData: () => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

// Função para converter empresa do Supabase para o formato HR
const convertEmpresaFromSupabase = (empresa: SupabaseEmpresa): Empresa => ({
  id: empresa.id,
  nome: empresa.nome,
  cnpj: empresa.cnpj,
  endereco: empresa.endereco,
  responsavel: empresa.responsavel,
  email: empresa.email,
  telefone: empresa.telefone
});

// Função para converter empresa do formato HR para Supabase
const convertEmpresaToSupabase = (empresa: Partial<Empresa>): Partial<SupabaseEmpresa> => ({
  nome: empresa.nome,
  cnpj: empresa.cnpj,
  endereco: empresa.endereco,
  responsavel: empresa.responsavel,
  email: empresa.email,
  telefone: empresa.telefone
});

// Função para converter colaborador do Supabase para o formato HR
const convertColaboradorFromSupabase = (colaborador: SupabaseColaborador): Colaborador => ({
  id: colaborador.id,
  nome: colaborador.nome,
  email: colaborador.email,
  cargo: colaborador.cargo,
  departamento: colaborador.departamento,
  empresa: colaborador.empresa_id,
  status: colaborador.status,
  tipo_contrato: colaborador.tipo_contrato,
  data_admissao: colaborador.data_admissao,
  data_nascimento: colaborador.data_nascimento,
  sexo: colaborador.sexo,
  salario_base: Number(colaborador.salario_base),
  telefone: colaborador.telefone || '',
  celular: colaborador.celular || '',
  endereco: colaborador.endereco,
  cep: colaborador.cep,
  cidade: colaborador.cidade,
  estado: colaborador.estado,
  estado_civil: colaborador.estado_civil,
  escolaridade: colaborador.escolaridade,
  nome_mae: colaborador.nome_mae,
  nome_pai: colaborador.nome_pai || '',
  contato_emergencia: {
    nome: colaborador.contato_emergencia_nome,
    telefone: colaborador.contato_emergencia_telefone,
    parentesco: colaborador.contato_emergencia_parentesco
  },
  documentos: {
    cpf: colaborador.cpf,
    rg: colaborador.rg,
    rg_orgao_emissor: colaborador.rg_orgao_emissor,
    ctps: colaborador.ctps || '',
    ctps_serie: colaborador.ctps_serie || '',
    pis_pasep: colaborador.pis_pasep || '',
    titulo_eleitor: colaborador.titulo_eleitor || '',
    reservista: colaborador.reservista || ''
  },
  beneficios: {
    vale_transporte: colaborador.vale_transporte || false,
    vale_refeicao: colaborador.vale_refeicao || false,
    valor_vale_transporte: Number(colaborador.valor_vale_transporte) || 0,
    valor_vale_refeicao: Number(colaborador.valor_vale_refeicao) || 0,
    plano_saude: colaborador.plano_saude || false,
    plano_odontologico: colaborador.plano_odontologico || false
  },
  dependentes: {
    tem_filhos_menores_14: colaborador.tem_filhos_menores_14 || false,
    quantidade_filhos: colaborador.quantidade_filhos || 0,
    filhos: Array.isArray(colaborador.filhos) ? colaborador.filhos : []
  },
  dados_bancarios: {
    banco: colaborador.banco || '',
    agencia: colaborador.agencia || '',
    conta: colaborador.conta || '',
    tipo_conta: colaborador.tipo_conta || 'CORRENTE',
    pix: colaborador.pix || ''
  },
  foto_perfil: colaborador.foto_perfil,
  documentos_arquivos: [],
  historico: [],
  auditoria: {
    created_at: colaborador.created_at,
    updated_at: colaborador.updated_at,
    created_by: colaborador.created_by || ''
  }
});

// Função para converter colaborador do formato HR para Supabase
const convertColaboradorToSupabase = (colaborador: Partial<Colaborador>): Partial<SupabaseColaborador> => ({
  nome: colaborador.nome,
  email: colaborador.email,
  cargo: colaborador.cargo,
  departamento: colaborador.departamento,
  empresa_id: colaborador.empresa,
  status: colaborador.status,
  tipo_contrato: colaborador.tipo_contrato,
  data_admissao: colaborador.data_admissao,
  data_nascimento: colaborador.data_nascimento,
  sexo: colaborador.sexo,
  salario_base: colaborador.salario_base,
  telefone: colaborador.telefone,
  celular: colaborador.celular,
  endereco: colaborador.endereco,
  cep: colaborador.cep,
  cidade: colaborador.cidade,
  estado: colaborador.estado,
  estado_civil: colaborador.estado_civil,
  escolaridade: colaborador.escolaridade,
  nome_mae: colaborador.nome_mae,
  nome_pai: colaborador.nome_pai,
  contato_emergencia_nome: colaborador.contato_emergencia?.nome,
  contato_emergencia_telefone: colaborador.contato_emergencia?.telefone,
  contato_emergencia_parentesco: colaborador.contato_emergencia?.parentesco,
  // Só incluir CPF se não estiver vazio
  cpf: colaborador.documentos?.cpf && colaborador.documentos.cpf.trim() !== '' ? colaborador.documentos.cpf : null,
  rg: colaborador.documentos?.rg,
  rg_orgao_emissor: colaborador.documentos?.rg_orgao_emissor,
  ctps: colaborador.documentos?.ctps,
  ctps_serie: colaborador.documentos?.ctps_serie,
  pis_pasep: colaborador.documentos?.pis_pasep,
  titulo_eleitor: colaborador.documentos?.titulo_eleitor,
  reservista: colaborador.documentos?.reservista,
  vale_transporte: colaborador.beneficios?.vale_transporte,
  vale_refeicao: colaborador.beneficios?.vale_refeicao,
  valor_vale_transporte: colaborador.beneficios?.valor_vale_transporte,
  valor_vale_refeicao: colaborador.beneficios?.valor_vale_refeicao,
  plano_saude: colaborador.beneficios?.plano_saude,
  plano_odontologico: colaborador.beneficios?.plano_odontologico,
  tem_filhos_menores_14: colaborador.dependentes?.tem_filhos_menores_14,
  quantidade_filhos: colaborador.dependentes?.quantidade_filhos,
  filhos: colaborador.dependentes?.filhos,
  banco: colaborador.dados_bancarios?.banco,
  agencia: colaborador.dados_bancarios?.agencia,
  conta: colaborador.dados_bancarios?.conta,
  tipo_conta: colaborador.dados_bancarios?.tipo_conta,
  pix: colaborador.dados_bancarios?.pix,
  foto_perfil: colaborador.foto_perfil
});

export function HRProvider({ children }: { children: React.ReactNode }) {
  const { 
    empresas: supabaseEmpresas, 
    colaboradores: supabaseColaboradores, 
    loading: supabaseLoading,
    adicionarEmpresa: addEmpresaSupabase,
    editarEmpresa: editEmpresaSupabase,
    removerEmpresa: removeEmpresaSupabase,
    adicionarColaborador: addColaboradorSupabase,
    editarColaborador: editColaboradorSupabase,
    removerColaborador: removeColaboradorSupabase
  } = useSupabaseData();

  // Convert Supabase data to local format
  const empresas = useMemo(() => 
    supabaseEmpresas.map(convertEmpresaFromSupabase), 
    [supabaseEmpresas]
  );
  
  const colaboradores = useMemo(() => 
    supabaseColaboradores.map(convertColaboradorFromSupabase), 
    [supabaseColaboradores]
  );

  // Mock denuncias data for now
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);

  // Local state
  const [filtros, setFiltrosState] = useState<FiltrosColaborador>({
    nome: '',
    status: '',
    empresa: '',
    departamento: ''
  });
  
  const [temaMode, setTemaMode] = useState<TemaMode>('claro');
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);

  const adicionarColaborador = async (colaboradorData: Omit<Colaborador, 'id' | 'auditoria'>) => {
    try {
      // Validação obrigatória do CPF
      if (!colaboradorData.documentos?.cpf || colaboradorData.documentos.cpf.trim() === '') {
        toast.error('CPF é obrigatório para cadastrar o colaborador');
        return;
      }
      
      // Verificar se CPF já existe
      const colaboradorExistente = colaboradores.find(c => c.documentos?.cpf === colaboradorData.documentos?.cpf);
      if (colaboradorExistente) {
        toast.error(`Já existe um colaborador com o CPF ${colaboradorData.documentos.cpf}`);
        return;
      }
      
      const supabaseData = convertColaboradorToSupabase({
        ...colaboradorData,
        id: '', // temporary id, will be replaced by supabase
        auditoria: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: ''
        }
      });
      
      await addColaboradorSupabase(supabaseData as any);
      toast.success('Colaborador adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar colaborador:', error);
      
      // Tratamento específico para erro de CPF duplicado
      if (error.message?.includes('colaboradores_cpf_key') || error.message?.includes('duplicate key')) {
        toast.error('Este CPF já está cadastrado no sistema');
      } else {
        toast.error('Erro ao adicionar colaborador: ' + error.message);
      }
    }
  };

  const editarColaborador = async (id: string, dadosAtualizados: Partial<Omit<Colaborador, 'id' | 'auditoria'>>) => {
    try {
      const supabaseData = convertColaboradorToSupabase(dadosAtualizados as Colaborador);
      await editColaboradorSupabase(id, supabaseData);
      toast.success('Colaborador atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar colaborador:', error);
      toast.error('Erro ao editar colaborador');
    }
  };

  const removerColaborador = async (id: string) => {
    try {
      await removeColaboradorSupabase(id);
      toast.success('Colaborador removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      toast.error('Erro ao remover colaborador');
    }
  };

  const adicionarEmpresa = async (empresaData: Omit<Empresa, 'id'>) => {
    try {
      const supabaseData = convertEmpresaToSupabase({
        ...empresaData,
        id: '' // temporary id, will be replaced by supabase
      });
      await addEmpresaSupabase(supabaseData as any);
      toast.success('Empresa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      toast.error('Erro ao adicionar empresa');
    }
  };

  const editarEmpresa = async (id: string, dadosAtualizados: Partial<Omit<Empresa, 'id'>>) => {
    try {
      const supabaseData = convertEmpresaToSupabase(dadosAtualizados as Empresa);
      await editEmpresaSupabase(id, supabaseData);
      toast.success('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar empresa:', error);
      toast.error('Erro ao editar empresa');
    }
  };

  const removerEmpresa = async (id: string) => {
    try {
      // First remove all collaborators from this company
      const colaboradoresDaEmpresa = colaboradores.filter(c => c.empresa === id);
      for (const colaborador of colaboradoresDaEmpresa) {
        await removeColaboradorSupabase(colaborador.id);
      }
      
      // Then remove the company
      await removeEmpresaSupabase(id);
      toast.success('Empresa e colaboradores removidos com sucesso!');
    } catch (error) {
      console.error('Erro ao remover empresa:', error);
      toast.error('Erro ao remover empresa');
    }
  };

  const refetchData = async () => {
    // Data is automatically refreshed by useSupabaseData hook
    console.log('Data refresh triggered');
  };

  const selecionarEmpresa = (empresaId: string | null) => {
    setEmpresaSelecionada(empresaId);
  };

  const setFiltros = (novosFiltros: Partial<FiltrosColaborador>) => {
    setFiltrosState(prev => ({ ...prev, ...novosFiltros }));
  };

  // Mock denúncias functions for now
  const criarDenuncia = (denuncia: any) => {
    console.log('Mock criar denuncia:', denuncia);
  };

  const atualizarStatus = (id: string, status: string) => {
    console.log('Mock atualizar status:', id, status);
  };

  const adicionarComentario = (id: string, comentario: any) => {
    console.log('Mock adicionar comentario:', id, comentario);
  };

  // Computed values
  const denunciasNaoTratadas = useMemo(() => {
    return denuncias.filter(d => d.status === 'RECEBIDO' || d.status === 'EM_ANALISE');
  }, [denuncias]);

  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter(colaborador => {
      if (filtros.nome && !colaborador.nome.toLowerCase().includes(filtros.nome.toLowerCase())) {
        return false;
      }
      if (filtros.status && colaborador.status !== filtros.status) {
        return false;
      }
      if (filtros.empresa && colaborador.empresa !== filtros.empresa) {
        return false;
      }
      if (filtros.departamento && colaborador.departamento !== filtros.departamento) {
        return false;
      }
      return true;
    });
  }, [colaboradores, filtros]);

  const dashboardStats = useMemo((): DashboardStats => {
    const totalColaboradores = colaboradores.length;
    const colaboradoresAtivos = colaboradores.filter(c => c.status === 'ATIVO').length;
    const complianceRate = totalColaboradores > 0 ? Math.round((colaboradoresAtivos / totalColaboradores) * 100) : 0;
    
    // Mock aniversariantes - in real app would check birth dates
    const aniversariantes = Math.floor(Math.random() * 5);

    return {
      totalColaboradores,
      colaboradoresAtivos,
      complianceRate,
      aniversariantes
    };
  }, [colaboradores]);

  const value: HRContextType = {
    colaboradores,
    empresas,
    denuncias,
    loading: supabaseLoading,
    filtros,
    temaMode,
    empresaSelecionada,
    adicionarColaborador,
    editarColaborador,
    removerColaborador,
    adicionarEmpresa,
    editarEmpresa,
    removerEmpresa,
    setFiltros,
    setTemaMode,
    selecionarEmpresa,
    criarDenuncia,
    atualizarStatus,
    adicionarComentario,
    denunciasNaoTratadas,
    colaboradoresFiltrados,
    dashboardStats,
    refetchData
  };

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR deve ser usado dentro de um HRProvider');
  }
  return context;
};