import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, AlertTriangle, Timer, Target } from "lucide-react";
import { Divida, Devedor } from "@/hooks/useDebtoData";

interface DebtoKPICardsProps {
  dividas: Divida[];
  devedores: Devedor[];
}

export function DebtoKPICards({ dividas, devedores }: DebtoKPICardsProps) {
  // Calcular métricas
  const totalDividas = dividas.length;
  const totalDevedores = devedores.length;
  
  const valorTotalOriginal = dividas.reduce((sum, d) => sum + d.valor_original, 0);
  const valorTotalAtualizado = dividas.reduce((sum, d) => sum + d.valor_atualizado, 0);
  
  const dividasPendentes = dividas.filter(d => d.status === 'pendente').length;
  const dividasPagas = dividas.filter(d => d.status === 'pago').length;
  const dividasNegociacao = dividas.filter(d => d.status === 'negociacao').length;
  const dividasJudiciais = dividas.filter(d => d.status === 'judicial').length;
  
  const dividasVencidas = dividas.filter(d => 
    new Date(d.data_vencimento) < new Date() && d.status !== 'pago'
  ).length;
  
  const dividasUrgentes = dividas.filter(d => d.urgency_score > 70).length;
  
  const taxaRecuperacao = totalDividas > 0 ? (dividasPagas / totalDividas) * 100 : 0;
  const eficienciaCobranca = valorTotalOriginal > 0 ? (valorTotalAtualizado / valorTotalOriginal) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const kpiCards = [
    {
      title: "Valor Total em Aberto",
      value: formatCurrency(valorTotalAtualizado),
      subtitle: `Original: ${formatCurrency(valorTotalOriginal)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: eficienciaCobranca > 100 ? `+${(eficienciaCobranca - 100).toFixed(1)}%` : null
    },
    {
      title: "Total de Devedores",
      value: totalDevedores.toString(),
      subtitle: `${totalDividas} dívidas ativas`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: null
    },
    {
      title: "Taxa de Recuperação",
      value: `${taxaRecuperacao.toFixed(1)}%`,
      subtitle: `${dividasPagas} dívidas quitadas`,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: taxaRecuperacao > 50 ? "Boa" : taxaRecuperacao > 25 ? "Regular" : "Baixa"
    },
    {
      title: "Dívidas Vencidas",
      value: dividasVencidas.toString(),
      subtitle: "Necessitam ação imediata",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: dividasVencidas > 0 ? "Atenção" : null
    },
    {
      title: "Em Negociação",
      value: dividasNegociacao.toString(),
      subtitle: "Potencial de acordo",
      icon: Timer,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      trend: null
    },
    {
      title: "Casos Urgentes",
      value: dividasUrgentes.toString(),
      subtitle: "Score > 70",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: dividasUrgentes > 0 ? "Priorizar" : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.subtitle}</div>
                {kpi.trend && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      kpi.trend.includes('+') || kpi.trend === 'Boa' 
                        ? 'bg-green-100 text-green-700' 
                        : kpi.trend === 'Atenção' || kpi.trend === 'Priorizar'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {kpi.trend}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}