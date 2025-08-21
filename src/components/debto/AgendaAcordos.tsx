import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgendaAcordo {
  id: string;
  empresa_id: string;
  devedor_nome: string;
  parcela_numero: number;
  parcela_total: number;
  valor_parcela: number;
  data_vencimento: string;
  acordo_id?: string;
  divida_id?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  observacoes?: string;
}

interface AgendaAcordosProps {
  empresaId: string;
  className?: string;
}

const AgendaAcordos: React.FC<AgendaAcordosProps> = ({ empresaId, className }) => {
  const [acordos, setAcordos] = useState<AgendaAcordo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agenda_acordos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_vencimento', { ascending: true });

      if (error) {
        console.error('Erro ao carregar agenda:', error);
        toast({ title: "Erro ao carregar agenda", variant: "destructive" });
        return;
      }

      // Calcular dias de atraso e atualizar status se necessário
      const acordosComStatus = (data || []).map(acordo => {
        const hoje = new Date();
        const vencimento = new Date(acordo.data_vencimento);
        const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = acordo.status;
        if (status === 'pendente' && diasAtraso > 0) {
          status = 'atrasado';
        }
        
        return {
          ...acordo,
          status: status as 'pendente' | 'pago' | 'atrasado',
          diasAtraso
        };
      });

      setAcordos(acordosComStatus);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      toast({ title: "Erro ao carregar agenda", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchAgenda();
    }
  }, [empresaId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDiasAtraso = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasAtraso);
  };

  const getStatusBadge = (status: string, diasAtraso: number) => {
    if (status === 'pago') {
      return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
    }
    if (status === 'atrasado' || diasAtraso > 0) {
      return <Badge variant="destructive">-{diasAtraso} dias</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const acordosProximosVencimento = acordos.filter(acordo => {
    const diasAtraso = getDiasAtraso(acordo.data_vencimento);
    return acordo.status !== 'pago' && diasAtraso <= 30; // Próximos 30 dias ou em atraso
  }).slice(0, 10);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg font-semibold">Agenda - Próximos Acordos a Vencer</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAgenda}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : acordosProximosVencimento.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm">Nenhum acordo próximo ao vencimento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acordosProximosVencimento.map((acordo) => {
              const diasAtraso = getDiasAtraso(acordo.data_vencimento);
              return (
                <div key={acordo.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{acordo.devedor_nome}</h3>
                      {getStatusBadge(acordo.status, diasAtraso)}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{formatDate(acordo.data_vencimento)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Parcela {acordo.parcela_numero}/{acordo.parcela_total} - {formatCurrency(acordo.valor_parcela)}
                    </div>
                  </div>
                  
                  {acordo.observacoes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {acordo.observacoes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgendaAcordos;