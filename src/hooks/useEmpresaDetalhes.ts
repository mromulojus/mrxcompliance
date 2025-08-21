import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCache } from '@/context/CacheContext';
import type { Empresa, Colaborador } from '@/hooks/useSupabaseData';

type EmpresaDetalhesData = {
  empresa: Empresa | null;
  colaboradores: Colaborador[];
  loading: boolean;
  error: string | null;
};

export const useEmpresaDetalhes = (empresaId: string): EmpresaDetalhesData => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const cache = useCache();

  // Cache keys
  const empresaCacheKey = `empresa_${empresaId}`;
  const colaboradoresCacheKey = `colaboradores_${empresaId}`;

  const fetchEmpresa = async () => {
    try {
      // Check cache first
      const cachedEmpresa = cache.get<Empresa>(empresaCacheKey);
      if (cachedEmpresa) {
        setEmpresa(cachedEmpresa);
        return cachedEmpresa;
      }

      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no data found

      if (error) throw error;

      setEmpresa(data);
      
      // Cache the result for 10 minutes
      if (data) {
        cache.set(empresaCacheKey, data, 10 * 60 * 1000);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching empresa:', error);
      setError('Erro ao carregar dados da empresa');
      toast({
        title: "Erro ao carregar empresa",
        description: "Não foi possível carregar os dados da empresa.",
        variant: "destructive"
      });
      return null;
    }
  };

  const fetchColaboradores = async () => {
    try {
      // Check cache first
      const cachedColaboradores = cache.get<Colaborador[]>(colaboradoresCacheKey);
      if (cachedColaboradores) {
        setColaboradores(cachedColaboradores);
        return cachedColaboradores;
      }

      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nome');

      if (error) throw error;

      const colaboradoresData = (data as Colaborador[]) || [];
      setColaboradores(colaboradoresData);
      
      // Cache the result for 5 minutes
      cache.set(colaboradoresCacheKey, colaboradoresData, 5 * 60 * 1000);
      
      return colaboradoresData;
    } catch (error) {
      console.error('Error fetching colaboradores:', error);
      setError('Erro ao carregar colaboradores');
      toast({
        title: "Erro ao carregar colaboradores",
        description: "Não foi possível carregar a lista de colaboradores.",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load empresa and colaboradores in parallel for better performance
        const [empresaResult, colaboradoresResult] = await Promise.all([
          fetchEmpresa(),
          fetchColaboradores()
        ]);

        if (!isCancelled) {
          // Data is already set by the individual functions
          // This is just to ensure we don't set state after component unmount
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading empresa details:', error);
          setError('Erro ao carregar dados');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [empresaId]);

  // Function to refresh data and clear cache
  const refresh = async () => {
    cache.clear(empresaCacheKey);
    cache.clear(colaboradoresCacheKey);
    setLoading(true);
    setError(null);

    try {
      const [empresaResult, colaboradoresResult] = await Promise.all([
        fetchEmpresa(),
        fetchColaboradores()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  return {
    empresa,
    colaboradores,
    loading,
    error,
    refresh
  } as EmpresaDetalhesData & { refresh: () => Promise<void> };
};