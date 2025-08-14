import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  FileText,
  TrendingUp,
  Shield,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import { AuditoriaEmpresa as IAuditoriaEmpresa, ItemAuditoria, StatusAuditoria } from '@/types/auditoria';

interface ComplianceAuditDashboardProps {
  empresaId: string;
}

export function ComplianceAuditDashboard({ empresaId }: ComplianceAuditDashboardProps) {
  const [auditoriaData, setAuditoriaData] = useState<IAuditoriaEmpresa | null>(null);

  useEffect(() => {
    // Carregar dados reais da auditoria do localStorage
    const dados = localStorage.getItem(`auditoria-${empresaId}`);
    if (dados) {
      setAuditoriaData(JSON.parse(dados));
    }
  }, [empresaId]);

  // Calcular estatísticas reais baseadas nos dados de auditoria
  const calcularEstatisticas = () => {
    if (!auditoriaData?.itens) {
      return {
        total: 0,
        entregues: 0,
        solicitados: 0,
        naoSolicitados: 0,
        vencidos: 0,
        score: 0
      };
    }

    const itensValidos = auditoriaData.itens.filter(item => item.documento && item.documento.trim() !== '');
    const total = itensValidos.length;
    const entregues = itensValidos.filter(item => item.status === 'ENTREGUE').length;
    const solicitados = itensValidos.filter(item => item.status === 'SOLICITADO').length;
    const naoSolicitados = itensValidos.filter(item => item.status === 'NAO_SOLICITADO').length;
    
    // Verificar vencidos (itens solicitados com data_vencimento passada)
    const hoje = new Date();
    const vencidos = itensValidos.filter(item => {
      if (item.status === 'SOLICITADO' && item.data_vencimento) {
        return new Date(item.data_vencimento) < hoje;
      }
      return false;
    }).length;

    const score = total > 0 ? Math.round((entregues / total) * 100) : 0;

    return {
      total,
      entregues,
      solicitados,
      naoSolicitados,
      vencidos,
      score
    };
  };

  // Calcular conformidade por categoria
  const calcularConformidadePorCategoria = () => {
    if (!auditoriaData?.itens) return [];

    const categorias = new Map<string, { total: number; entregues: number }>();
    
    auditoriaData.itens.forEach(item => {
      if (item.categoria && item.categoria.trim() !== '' && item.documento && item.documento.trim() !== '') {
        if (!categorias.has(item.categoria)) {
          categorias.set(item.categoria, { total: 0, entregues: 0 });
        }
        const cat = categorias.get(item.categoria)!;
        cat.total++;
        if (item.status === 'ENTREGUE') {
          cat.entregues++;
        }
      }
    });

    return Array.from(categorias.entries()).map(([categoria, dados]) => ({
      categoria: categoria.replace(/^[IVX]+\.\s*/, ''), // Remove numeração romana
      score: dados.total > 0 ? Math.round((dados.entregues / dados.total) * 100) : 0,
      total: dados.total,
      conformes: dados.entregues
    }));
  };

  // Calcular próximos vencimentos
  const calcularProximosVencimentos = () => {
    if (!auditoriaData?.itens) return [];

    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    return auditoriaData.itens
      .filter(item => {
        if (item.status === 'SOLICITADO' && item.data_vencimento) {
          const vencimento = new Date(item.data_vencimento);
          return vencimento >= hoje && vencimento <= em30Dias;
        }
        return false;
      })
      .map(item => {
        const diasRestantes = Math.ceil((new Date(item.data_vencimento!).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return {
          item: item.documento,
          data: new Date(item.data_vencimento!).toLocaleDateString('pt-BR'),
          criticidade: diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'média' : 'baixa'
        };
      })
      .sort((a, b) => new Date(a.data.split('/').reverse().join('-')).getTime() - new Date(b.data.split('/').reverse().join('-')).getTime());
  };

  const stats = calcularEstatisticas();
  const conformidadePorCategoria = calcularConformidadePorCategoria();
  const proximosVencimentos = calcularProximosVencimentos();

  // Evolução simulada para o gráfico de linha (mantido para visualização)
  const evolucaoCompliance = [
    { mes: 'Jan', score: Math.max(0, stats.score - 10) },
    { mes: 'Fev', score: Math.max(0, stats.score - 8) },
    { mes: 'Mar', score: Math.max(0, stats.score - 5) },
    { mes: 'Abr', score: Math.max(0, stats.score - 3) },
    { mes: 'Mai', score: Math.max(0, stats.score - 1) },
    { mes: 'Jun', score: stats.score }
  ];

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
      case 'alta': return 'bg-red-100 text-red-700';
      case 'média': return 'bg-yellow-100 text-yellow-700';
      case 'baixa': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Compliance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.score)}`}>
              {stats.score}%
            </div>
            <Progress value={stats.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Conformes</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entregues}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.solicitados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.vencidos} vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.vencidos}</div>
            <p className="text-xs text-muted-foreground">
              Ação imediata necessária
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conformidade por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conformidade por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conformidadePorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução do Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução do Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={evolucaoCompliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis domain={[70, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhamento por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conformidadePorCategoria.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{categoria.categoria}</h4>
                  <p className="text-sm text-muted-foreground">
                    {categoria.conformes} de {categoria.total} documentos conformes
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(categoria.score)}`}>
                      {categoria.score}%
                    </div>
                    <Progress value={categoria.score} className="w-24" />
                  </div>
                  <Button variant="outline" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agenda de Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Atividades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Atividades (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximosVencimentos.length > 0 ? proximosVencimentos.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.item}</h4>
                    <p className="text-xs text-muted-foreground">{item.data}</p>
                  </div>
                  <Badge className={getCriticidadeColor(item.criticidade)}>
                    {item.criticidade}
                  </Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade com vencimento nos próximos 30 dias
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações Recomendadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ações Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-medium text-sm text-red-800">Crítico</h4>
                <p className="text-xs text-red-600">Renovar certificado ISO vencido</p>
                <Button size="sm" variant="destructive" className="mt-2">
                  Ação Imediata
                </Button>
              </div>
              
              <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                <h4 className="font-medium text-sm text-yellow-800">Atenção</h4>
                <p className="text-xs text-yellow-600">Atualizar documentos de segurança</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Programar
                </Button>
              </div>
              
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-medium text-sm text-blue-800">Melhoria</h4>
                <p className="text-xs text-blue-600">Implementar checklist digital</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Avaliar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Status Geral</h4>
              <p className="text-sm text-muted-foreground">
                A empresa apresenta um nível de compliance satisfatório com {stats.score}% 
                de conformidade geral. Foram identificados {stats.vencidos} itens 
                críticos que necessitam atenção imediata.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Principais Riscos</h4>
              <p className="text-sm text-muted-foreground">
                {stats.vencidos > 0 ? 
                  `${stats.vencidos} documentos vencidos necessitam atenção imediata. ` : 
                  'Nenhum documento vencido identificado. '}
                Recomenda-se implementar cronograma de 
                monitoramento automático para manter a conformidade.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Próximos Passos</h4>
              <p className="text-sm text-muted-foreground">
                {stats.vencidos > 0 ? 
                  `Priorizar a regularização dos ${stats.vencidos} documentos vencidos e ` : 
                  'Manter '}
                preparar para futuras auditorias com base nos {stats.solicitados} itens 
                em andamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}