import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import type { ProcessoJudicial, Evento } from '@/types/processos';

interface ProcessoKPICardsProps {
  processos: ProcessoJudicial[];
  eventos: Evento[];
  empresaId: string;
}

export function ProcessoKPICards({ processos, eventos }: ProcessoKPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularEstatisticas = () => {
    const total = processos.length;
    const ativos = processos.filter(p => p.status === 'ativo').length;
    const suspensos = processos.filter(p => p.status === 'suspenso').length;
    const arquivados = processos.filter(p => p.status === 'arquivado').length;
    
    const valorTotal = processos.reduce((sum, p) => sum + (p.valor_causa || 0), 0);
    
    // Próximos eventos (próximos 7 dias)
    const hoje = new Date();
    const proximaSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    const proximosEventos = eventos.filter(e => {
      const dataEvento = new Date(e.data_inicio);
      return dataEvento >= hoje && dataEvento <= proximaSemana;
    }).length;

    // Eventos em atraso (vencidos)
    const eventosAtrasados = eventos.filter(e => {
      const dataEvento = new Date(e.data_inicio);
      return dataEvento < hoje && ['prazo', 'vencimento'].includes(e.tipo);
    }).length;

    // Tempo médio de tramitação (estimativa baseada na data de cadastro)
    const tempoMedio = processos.length > 0 
      ? processos.reduce((sum, p) => {
          const diasTramitacao = Math.floor((hoje.getTime() - new Date(p.data_cadastro).getTime()) / (1000 * 60 * 60 * 24));
          return sum + diasTramitacao;
        }, 0) / processos.length
      : 0;

    return {
      total,
      ativos,
      suspensos,
      arquivados,
      valorTotal,
      proximosEventos,
      eventosAtrasados,
      tempoMedio: Math.round(tempoMedio)
    };
  };

  const stats = calcularEstatisticas();

  const kpiCards = [
    {
      title: 'Total de Processos',
      value: stats.total.toString(),
      description: `${stats.ativos} ativos, ${stats.suspensos} suspensos`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Próximos Eventos',
      value: stats.proximosEventos.toString(),
      description: 'Próximos 7 dias',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Eventos Atrasados',
      value: stats.eventosAtrasados.toString(),
      description: 'Prazos vencidos',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Valor Total em Causa',
      value: formatCurrency(stats.valorTotal),
      description: 'Soma de todos os processos',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Tempo Médio',
      value: `${stats.tempoMedio} dias`,
      description: 'Tramitação média',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Taxa de Sucesso',
      value: '0%',
      description: 'Em desenvolvimento',
      icon: TrendingUp,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiCards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}