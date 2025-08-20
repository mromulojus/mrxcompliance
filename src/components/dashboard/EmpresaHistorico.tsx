import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Simplified interface for demo purposes
interface EmpresaHistoricoRow {
  id: string;
  empresa_id: string;
  tipo: string;
  descricao: string;
  created_at: string;
  meta?: any;
}

interface EmpresaHistoricoProps {
  empresaId: string;
  className?: string;
}

const EmpresaHistorico: React.FC<EmpresaHistoricoProps> = ({ empresaId, className }) => {
  const [historico, setHistorico] = useState<EmpresaHistoricoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      // Temporariamente desabilitado - usando dados de exemplo
      // Em produção, esta funcionalidade seria conectada a uma view ou tabela real
      const sampleData: EmpresaHistoricoRow[] = [
        {
          id: '1',
          empresa_id: empresaId,
          tipo: 'Sistema',
          descricao: 'Histórico de empresa temporariamente indisponível',
          created_at: new Date().toISOString(),
        }
      ];
      
      setHistorico(sampleData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addToHistorico = async (tipo: string, descricao: string, meta?: any) => {
    try {
      // Temporariamente desabilitado - implementar quando a tabela existir
      console.log('Adicionando ao histórico:', { tipo, descricao, meta });
      toast({ title: "Funcionalidade em desenvolvimento", description: "Histórico será implementado em breve" });
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      toast({ title: "Erro ao salvar no histórico", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchHistorico();
    }
  }, [empresaId]);

  const formatTipo = (tipo: string) => {
    const tipos: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'colaborador': { label: 'Colaborador', variant: 'default' },
      'denuncia': { label: 'Denúncia', variant: 'destructive' },
      'sistema': { label: 'Sistema', variant: 'secondary' },
      'pagamento': { label: 'Pagamento', variant: 'outline' },
    };
    return tipos[tipo.toLowerCase()] || { label: tipo, variant: 'default' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Histórico da Empresa</CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Atualizado em {formatDate(lastUpdated.toISOString())}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistorico}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Nenhum registro encontrado
            </div>
          ) : (
            historico.map((item, index) => {
              const tipoFormatted = formatTipo(item.tipo);
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={tipoFormatted.variant}>
                        {tipoFormatted.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{item.descricao}</p>
                  {item.meta && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(item.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                  {index < historico.length - 1 && <Separator />}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmpresaHistorico;