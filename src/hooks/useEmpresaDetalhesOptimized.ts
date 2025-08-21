import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Enhanced cache with TTL and compression
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class OptimizedCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new OptimizedCache();

export interface EmpresaDetalhesData {
  empresa: any;
  colaboradores: any[];
  loading: boolean;
  error: string | null;
}

export const useEmpresaDetalhesOptimized = (empresaId: string) => {
  const [empresa, setEmpresa] = useState<any>(null);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresa = useCallback(async (empresaId: string, useCache = true) => {
    const cacheKey = `empresa-${empresaId}`;
    
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setEmpresa(cached);
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        cache.set(cacheKey, data);
        setEmpresa(data);
      }
      return data;
    } catch (err) {
      console.error('Error fetching empresa:', err);
      throw err;
    }
  }, []);

  const fetchColaboradores = useCallback(async (empresaId: string, useCache = true) => {
    const cacheKey = `colaboradores-${empresaId}`;
    
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setColaboradores(cached);
        return cached;
      }
    }

    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('id, nome, email, cargo, departamento, status, data_admissao, salario_base, created_at')
        .eq('empresa_id', empresaId)
        .order('nome');

      if (error) throw error;
      
      const colaboradores = data || [];
      cache.set(cacheKey, colaboradores);
      setColaboradores(colaboradores);
      return colaboradores;
    } catch (err) {
      console.error('Error fetching colaboradores:', err);
      throw err;
    }
  }, []);

  const loadData = useCallback(async (empresaId: string, useCache = true) => {
    if (!empresaId) return;

    setLoading(true);
    setError(null);

    try {
      // Load data in parallel for better performance
      const [empresaData, colaboradoresData] = await Promise.all([
        fetchEmpresa(empresaId, useCache),
        fetchColaboradores(empresaId, useCache)
      ]);

      if (!empresaData) {
        setError('Empresa não encontrada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchEmpresa, fetchColaboradores]);

  const refresh = useCallback(() => {
    cache.invalidate(empresaId);
    loadData(empresaId, false);
  }, [empresaId, loadData]);

  // Prefetch function for hover effects
  const prefetch = useCallback((targetEmpresaId: string) => {
    if (targetEmpresaId && targetEmpresaId !== empresaId) {
      // Prefetch in background without setting state
      Promise.all([
        fetchEmpresa(targetEmpresaId, true),
        fetchColaboradores(targetEmpresaId, true)
      ]).catch(() => {
        // Silently fail for prefetch
      });
    }
  }, [empresaId, fetchEmpresa, fetchColaboradores]);

  useEffect(() => {
    loadData(empresaId);
  }, [empresaId, loadData]);

  return {
    empresa,
    colaboradores,
    loading,
    error,
    refresh,
    prefetch
  };
};