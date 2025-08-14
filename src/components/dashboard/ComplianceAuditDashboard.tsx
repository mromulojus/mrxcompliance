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

interface ComplianceAuditDashboardProps {
  empresaId: string;
}

export function ComplianceAuditDashboard({ empresaId }: ComplianceAuditDashboardProps) {
  // Dados simulados de compliance
  const complianceData = {
    score: 85,
    documentosTotal: 156,
    documentosConformes: 132,
    documentosPendentes: 18,
    documentosVencidos: 6,
    proximasAuditorias: 3,
    alertasCriticos: 2,
    melhorias: 8
  };

  // Dados para gráficos
  const conformidadePorCategoria = [
    { categoria: 'Trabalhista', score: 92, total: 45, conformes: 41 },
    { categoria: 'Fiscal', score: 78, total: 38, conformes: 30 },
    { categoria: 'Ambiental', score: 85, total: 28, conformes: 24 },
    { categoria: 'Segurança', score: 90, total: 25, conformes: 23 },
    { categoria: 'Qualidade', score: 82, total: 20, conformes: 16 }
  ];

  const evolucaoCompliance = [
    { mes: 'Jan', score: 78 },
    { mes: 'Fev', score: 80 },
    { mes: 'Mar', score: 82 },
    { mes: 'Abr', score: 85 },
    { mes: 'Mai', score: 83 },
    { mes: 'Jun', score: 85 }
  ];

  const proximas30Dias = [
    { item: 'Auditoria ISO 9001', data: '2025-01-25', criticidade: 'alta' },
    { item: 'Renovação AVCB', data: '2025-02-10', criticidade: 'média' },
    { item: 'Relatório RAIS', data: '2025-02-15', criticidade: 'alta' },
    { item: 'Inspeção CIPA', data: '2025-02-20', criticidade: 'baixa' }
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
            <div className={`text-2xl font-bold ${getScoreColor(complianceData.score)}`}>
              {complianceData.score}%
            </div>
            <Progress value={complianceData.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Conformes</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.documentosConformes}</div>
            <p className="text-xs text-muted-foreground">
              de {complianceData.documentosTotal} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceData.documentosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              {complianceData.documentosVencidos} vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceData.alertasCriticos}</div>
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
              {proximas30Dias.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.item}</h4>
                    <p className="text-xs text-muted-foreground">{item.data}</p>
                  </div>
                  <Badge className={getCriticidadeColor(item.criticidade)}>
                    {item.criticidade}
                  </Badge>
                </div>
              ))}
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
                A empresa apresenta um nível de compliance satisfatório com {complianceData.score}% 
                de conformidade geral. Foram identificados {complianceData.alertasCriticos} itens 
                críticos que necessitam atenção imediata.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Principais Riscos</h4>
              <p className="text-sm text-muted-foreground">
                Documentos vencidos na área fiscal e necessidade de renovação 
                de certificações. Recomenda-se implementar cronograma de 
                monitoramento automático.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Próximos Passos</h4>
              <p className="text-sm text-muted-foreground">
                Priorizar a regularização dos {complianceData.documentosVencidos} 
                documentos vencidos e preparar para as {complianceData.proximasAuditorias} 
                auditorias programadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}