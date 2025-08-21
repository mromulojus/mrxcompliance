import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Types from the database
export type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  responsavel: string;
  email: string;
  telefone: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type HistoricoColaborador = {
  id: string;
  observacao: string;
  created_at: string;
  created_by: string;
  profiles?: {
    full_name: string | null;
  };
};

export type Colaborador = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  empresa_id: string;
  status: 'ATIVO' | 'INATIVO' | 'DEMITIDO' | 'PROCESSO_SELETIVO';
  tipo_contrato: 'CLT' | 'PJ' | 'PF';
  data_admissao: string;
  data_nascimento: string;
  sexo: 'MASCULINO' | 'FEMININO';
  salario_base: number;
  telefone?: string;
  celular?: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  estado_civil: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'UNIAO_ESTAVEL';
  escolaridade: 'FUNDAMENTAL' | 'MEDIO' | 'SUPERIOR' | 'POS_GRADUACAO' | 'MESTRADO' | 'DOUTORADO';
  nome_mae: string;
  nome_pai?: string;
  contato_emergencia_nome: string;
  contato_emergencia_telefone: string;
  contato_emergencia_parentesco: string;
  cpf: string;
  rg: string;
  rg_orgao_emissor: string;
  ctps?: string;
  ctps_serie?: string;
  pis_pasep?: string;
  titulo_eleitor?: string;
  reservista?: string;
  vale_transporte: boolean;
  vale_refeicao: boolean;
  valor_vale_transporte: number;
  valor_vale_refeicao: number;
  plano_saude: boolean;
  plano_odontologico: boolean;
  tem_filhos_menores_14: boolean;
  quantidade_filhos: number;
  filhos: any;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: 'CORRENTE' | 'POUPANCA';
  pix?: string;
  foto_perfil?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  historico_colaborador?: HistoricoColaborador[];
};

export type Denuncia = {
  id: string;
  protocolo: string;
  empresa_id: string;
  identificado: boolean;
  nome?: string;
  email?: string;
  relacao: 'COLABORADOR' | 'EX_COLABORADOR' | 'FORNECEDOR' | 'CLIENTE' | 'OUTRO';
  tipo: 'DISCRIMINACAO' | 'ASSEDIO_MORAL' | 'CORRUPCAO' | 'VIOLACAO_TRABALHISTA' | 'OUTRO';
  setor?: string;
  conhecimento_fato: 'OUVI_FALAR' | 'DOCUMENTO' | 'COLEGA_TRABALHO' | 'OUTRO';
  envolvidos_cientes: boolean;
  descricao: string;
  evidencias_descricao?: string;
  sugestao?: string;
  anexos?: string[];
  status: 'RECEBIDO' | 'EM_ANALISE' | 'INVESTIGACAO' | 'CONCLUIDO';
  created_at: string;
  updated_at: string;
  comentarios_denuncia?: ComentarioDenuncia[];
};

export type ComentarioDenuncia = {
  id: string;
  denuncia_id: string;
  autor: string;
  mensagem: string;
  anexos?: string[];
  created_at: string;
  updated_at: string;
};

export const useSupabaseData = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data functions
  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Error fetching empresas:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar a lista de empresas.",
        variant: "destructive"
      });
    }
  };

  const fetchColaboradores = async () => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setColaboradores((data as any) || []);
    } catch (error) {
      console.error('Error fetching colaboradores:', error);
      toast({
        title: "Erro ao carregar colaboradores",
        description: "Não foi possível carregar a lista de colaboradores.",
        variant: "destructive"
      });
    }
  };

    const fetchDenuncias = async () => {
      try {
        const { data, error } = await supabase
          .from('denuncias')
          .select('*, comentarios_denuncia(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDenuncias((data || []) as any);
      } catch (error) {
        console.error('Error fetching denuncias:', error);
        toast({
          title: "Erro ao carregar denúncias",
          description: "Não foi possível carregar a lista de denúncias.",
          variant: "destructive"
        });
      }
    };

  // CRUD operations for empresas
  const adicionarEmpresa = async (empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([empresa])
        .select()
        .single();

      if (error) throw error;

      setEmpresas(prev => [...prev, data]);
      toast({
        title: "Empresa criada",
        description: `Empresa ${empresa.nome} foi criada com sucesso.`
      });
      
      return data;
    } catch (error) {
      console.error('Error adding empresa:', error);
      toast({
        title: "Erro ao criar empresa",
        description: "Não foi possível criar a empresa.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const editarEmpresa = async (id: string, empresa: Partial<Empresa>) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(empresa)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEmpresas(prev => prev.map(e => e.id === id ? data : e));
      toast({
        title: "Empresa atualizada",
        description: "Empresa foi atualizada com sucesso."
      });
      
      return data;
    } catch (error) {
      console.error('Error updating empresa:', error);
      toast({
        title: "Erro ao atualizar empresa",
        description: "Não foi possível atualizar a empresa.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removerEmpresa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmpresas(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Empresa removida",
        description: "Empresa foi removida com sucesso."
      });
    } catch (error) {
      console.error('Error deleting empresa:', error);
      toast({
        title: "Erro ao remover empresa",
        description: "Não foi possível remover a empresa.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // CRUD operations for colaboradores
  const adicionarColaborador = async (colaborador: Omit<Colaborador, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .insert([colaborador])
        .select()
        .single();

      if (error) throw error;

      setColaboradores(prev => [...prev, data]);
      toast({
        title: "Colaborador criado",
        description: `Colaborador ${colaborador.nome} foi criado com sucesso.`
      });
      
      return data;
    } catch (error) {
      console.error('Error adding colaborador:', error);
      toast({
        title: "Erro ao criar colaborador",
        description: "Não foi possível criar o colaborador.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const editarColaborador = async (id: string, colaborador: Partial<Colaborador>) => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .update(colaborador)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setColaboradores(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Colaborador atualizado",
        description: "Colaborador foi atualizado com sucesso."
      });
      
      return data;
    } catch (error) {
      console.error('Error updating colaborador:', error);
      toast({
        title: "Erro ao atualizar colaborador",
        description: "Não foi possível atualizar o colaborador.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removerColaborador = async (id: string) => {
    try {
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setColaboradores(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Colaborador removido",
        description: "Colaborador foi removido com sucesso."
      });
    } catch (error) {
      console.error('Error deleting colaborador:', error);
      toast({
        title: "Erro ao remover colaborador",
        description: "Não foi possível remover o colaborador.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Initialize data
  useEffect(() => {
    Promise.all([
      fetchEmpresas(),
      fetchColaboradores(),
      fetchDenuncias()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  return {
    empresas,
    colaboradores,
    denuncias,
    loading,
    
    // CRUD operations
    adicionarEmpresa,
    editarEmpresa,
    removerEmpresa,
    
    adicionarColaborador,
    editarColaborador,
    removerColaborador,
    
    // Refresh functions
    refetchEmpresas: fetchEmpresas,
    refetchColaboradores: fetchColaboradores,
    refetchDenuncias: fetchDenuncias
  };
};