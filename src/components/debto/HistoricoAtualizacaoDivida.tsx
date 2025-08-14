import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  FileText,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HistoricoItem {
  id: string;
  divida_id: string;
  valor_original: number;
  valor_atualizado: number;
  valor_multa: number;
  valor_juros: number;
  valor_correcao: number;
  data_calculo: string;
  dias_atraso: number;
  created_at: string;
}

interface HistoricoAtualizacaoDividaProps {
  devedorId: string;
}

export function HistoricoAtualizacaoDivida({ devedorId }: HistoricoAtualizacaoDividaProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      
      // Buscar histórico de atualizações das dívidas do devedor
      const { data: dividas } = await supabase
        .from('dividas')
        .select('id')
        .eq('devedor_id', devedorId);

      if (!dividas || dividas.length === 0) {
        setHistorico([]);
        return;
      }

      const dividaIds = dividas.map(d => d.id);

      // Simular histórico de atualizações (na prática, isso seria uma tabela específica)
      // Por enquanto, vamos criar dados baseados nas dívidas existentes
      const { data: dividasCompletas } = await supabase
        .from('dividas')
        .select('*')
        .in('id', dividaIds)
        .order('updated_at', { ascending: false });

      if (dividasCompletas) {
        const historicoSimulado = dividasCompletas.map(divida => ({
          id: divida.id + '_hist',
          divida_id: divida.id,
          valor_original: divida.valor_original,
          valor_atualizado: divida.valor_atualizado,
          valor_multa: divida.valor_multa || 0,
          valor_juros: divida.valor_juros || 0,
          valor_correcao: divida.valor_correcao || 0,
          data_calculo: divida.updated_at,
          dias_atraso: calcularDiasAtraso(divida.data_vencimento),
          created_at: divida.updated_at
        }));

        setHistorico(historicoSimulado);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de atualizações');
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasAtraso = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    return Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const atualizarValores = async () => {
    try {
      setLoading(true);
      
      // Executar função de atualização de valores
      const { error } = await supabase.rpc('atualizar_valores_dividas');
      
      if (error) throw error;
      
      toast.success('Valores atualizados com sucesso!');
      await fetchHistorico();
    } catch (error) {
      console.error('Erro ao atualizar valores:', error);
      toast.error('Erro ao atualizar valores das dívidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, [devedorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico de Atualização de Valores</h3>
        <Button onClick={atualizarValores} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Valores
        </Button>
      </div>

      {historico.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum histórico encontrado</h3>
            <p className="text-muted-foreground">
              Não há registros de atualizações para as dívidas deste devedor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {historico.map((item) => (
            <Card key={item.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Atualização de Valores
                  </CardTitle>
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(item.data_calculo)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Original</p>
                    <p className="font-medium">{formatCurrency(item.valor_original)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Atualizado</p>
                    <p className="font-bold text-primary">{formatCurrency(item.valor_atualizado)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Multa</p>
                    <p className="font-medium text-red-600">{formatCurrency(item.valor_multa)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Juros</p>
                    <p className="font-medium text-orange-600">{formatCurrency(item.valor_juros)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Correção Monetária</p>
                    <p className="font-medium text-blue-600">{formatCurrency(item.valor_correcao)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dias em Atraso</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className={`font-medium ${item.dias_atraso > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.dias_atraso} dias
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Atualização Automática</span>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Sistema
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}