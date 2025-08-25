import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarioEventos } from '@/components/processos/CalendarioEventos';
import { useHR } from '@/context/HRContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserPermissions } from '@/hooks/useUserPermissions';

const Calendario: React.FC = () => {
  const { empresas: hrEmpresas, empresaSelecionada, selecionarEmpresa } = useHR();
  const { profile, hasRole } = useUserPermissions();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies directly if HR context doesn't have them
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        setLoading(true);
        
        // If HR context has companies, use them
        if (hrEmpresas.length > 0) {
          setEmpresas(hrEmpresas);
          setLoading(false);
          return;
        }

        // Otherwise, fetch directly
        const { data, error: fetchError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');

        if (fetchError) {
          console.error('Error fetching empresas:', fetchError);
          setError('Erro ao carregar empresas. Verifique suas permissões.');
        } else {
          setEmpresas(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Erro inesperado ao carregar empresas.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [hrEmpresas]);

  const effectiveEmpresaId = useMemo(() => {
    if (empresaSelecionada) return empresaSelecionada;
    return empresas.length > 0 ? empresas[0].id : null;
  }, [empresaSelecionada, empresas]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendário Unificado de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          Carregando...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendário Unificado de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          {!hasRole('administrador') && (
            <p className="text-muted-foreground mt-2">
              Entre em contato com o administrador para ter acesso às empresas.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!effectiveEmpresaId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendário Unificado de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRole('administrador') ? (
            <p>Nenhuma empresa cadastrada. Cadastre uma empresa para usar o calendário.</p>
          ) : (
            <p>Você não tem acesso a nenhuma empresa. Entre em contato com o administrador.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <Select
              value={effectiveEmpresaId}
              onValueChange={(value) => selecionarEmpresa(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <CalendarioEventos empresaId={effectiveEmpresaId} empresas={empresas} />
    </div>
  );
};

export default Calendario;