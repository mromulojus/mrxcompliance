import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Devedor {
  id: string;
  empresa_id: string;
  nome: string;
  documento: string;
  tipo_pessoa: 'FISICA' | 'JURIDICA';
  endereco_completo?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefone_principal?: string;
  telefone_whatsapp?: string;
  telefones_outros?: string[];
  email_principal?: string;
  email_secundario?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  local_trabalho?: string;
  score_recuperabilidade: number;
  canal_preferencial: 'whatsapp' | 'telefone' | 'email' | 'sms';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Divida {
  id: string;
  devedor_id: string;
  empresa_id: string;
  numero_contrato?: string;
  numero_nf?: string;
  origem_divida: string;
  data_vencimento: string;
  valor_original: number;
  valor_multa: number;
  valor_juros: number;
  valor_correcao: number;
  valor_atualizado: number;
  status: 'pendente' | 'negociacao' | 'acordado' | 'pago' | 'judicial' | 'negativado' | 'protestado' | 'cancelado';
  estagio: 'vencimento_proximo' | 'vencido' | 'negociacao' | 'formal' | 'judicial';
  data_negativacao?: string;
  data_protesto?: string;
  urgency_score: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  responsavel: string;
  endereco: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface HistoricoCobranca {
  id: string;
  divida_id: string;
  devedor_id: string;
  tipo_acao: string;
  canal: string;
  resultado?: string;
  descricao: string;
  valor_negociado?: number;
  data_compromisso?: string;
  observacoes?: string;
  anexos?: string[];
  created_at: string;
  created_by: string;
}

export function useDebtoData() {
  const [devedores, setDevedores] = useState<Devedor[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [historico, setHistorico] = useState<HistoricoCobranca[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Erro ao carregar empresas');
    }
  };

  const fetchDevedores = async () => {
    try {
      const { data, error } = await supabase
        .from('devedores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevedores((data || []) as Devedor[]);
    } catch (error) {
      console.error('Erro ao buscar devedores:', error);
      toast.error('Erro ao carregar devedores');
    }
  };

  const fetchDividas = async () => {
    try {
      const { data, error } = await supabase
        .from('dividas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDividas((data || []) as Divida[]);
    } catch (error) {
      console.error('Erro ao buscar dívidas:', error);
      toast.error('Erro ao carregar dívidas');
    }
  };

  const fetchHistorico = async (dividaId?: string) => {
    try {
      let query = supabase
        .from('historico_cobrancas')
        .select('*')
        .order('created_at', { ascending: false });

      if (dividaId) {
        query = query.eq('divida_id', dividaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico');
    }
  };

  const adicionarDevedor = async (devedorData: Partial<Devedor>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('devedores')
        .insert(devedorData as any)
        .select()
        .single();

      if (error) throw error;
      
      setDevedores(prev => [data as Devedor, ...prev]);
      toast.success('Devedor cadastrado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar devedor:', error);
      toast.error('Erro ao cadastrar devedor');
      throw error;
    }
  };

  const adicionarDivida = async (dividaData: Partial<Divida>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('dividas')
        .insert(dividaData as any)
        .select()
        .single();

      if (error) throw error;
      
      setDividas(prev => [data as Divida, ...prev]);
      toast.success('Dívida cadastrada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
      toast.error('Erro ao cadastrar dívida');
      throw error;
    }
  };

  const adicionarHistorico = async (historicoData: Partial<HistoricoCobranca>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('historico_cobrancas')
        .insert({
          ...historicoData,
          created_by: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setHistorico(prev => [data, ...prev]);
      toast.success('Histórico adicionado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
      toast.error('Erro ao adicionar histórico');
      throw error;
    }
  };

  const atualizarDivida = async (dividaId: string, updates: Partial<Divida>) => {
    try {
      const { data, error } = await supabase
        .from('dividas')
        .update(updates)
        .eq('id', dividaId)
        .select()
        .single();

      if (error) throw error;
      
      setDividas(prev => prev.map(d => d.id === dividaId ? data : d));
      toast.success('Dívida atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar dívida:', error);
      toast.error('Erro ao atualizar dívida');
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEmpresas(),
          fetchDevedores(),
          fetchDividas()
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    devedores,
    dividas,
    empresas,
    historico,
    loading,
    fetchDevedores,
    fetchDividas,
    fetchHistorico,
    adicionarDevedor,
    adicionarDivida,
    adicionarHistorico,
    atualizarDivida
  };
}