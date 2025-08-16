import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  CheckSquare,
  Building2,
  BarChart3,
  PieChart 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDebtoData } from "@/hooks/useDebtoData";

interface EmpresaDashboardProps {
  empresaId: string;
}

export function EmpresaDashboard({ empresaId }: EmpresaDashboardProps) {
  const { colaboradores, denuncias } = useSupabaseData();
  const { devedores, dividas } = useDebtoData();

  // Dados dos colaboradores
  const colaboradoresEmpresa = colaboradores.filter(c => c.empresa_id === empresaId);
  const colaboradoresAtivos = colaboradoresEmpresa.filter(c => c.status === 'ATIVO').length;
  const totalColaboradores = colaboradoresEmpresa.length;

  // Dados de cobranças
  const devedoresEmpresa = devedores.filter(d => d.empresa_id === empresaId);
  const dividasEmpresa = dividas.filter(d => d.empresa_id === empresaId);
  const valorTotalDividas = dividasEmpresa.reduce((sum, d) => sum + d.valor_atualizado, 0);
  const dividasVencidas = dividasEmpresa.filter(d => d.estagio === 'vencido').length;

  // Dados de denúncias
  const denunciasEmpresa = denuncias.filter(d => d.empresa_id === empresaId);
  const denunciasAbertas = denunciasEmpresa.filter(d => d.status === 'RECEBIDO' || d.status === 'EM_ANALISE').length;

  // Compliance rate baseado em dados reais da auditoria
  const getComplianceRate = () => {
    const auditData = localStorage.getItem(`auditoria-${empresaId}`);
    if (!auditData) return 0;
    
    try {
      const data = JSON.parse(auditData);
      if (!data.itens || !Array.isArray(data.itens)) return 0;
      
      const itensValidos = data.itens.filter(item => item.documento && item.documento.trim() !== '');
      const total = itensValidos.length;
      const entregues = itensValidos.filter(item => item.status === 'ENTREGUE').length;
      
      return total > 0 ? Math.round((entregues / total) * 100) : 0;
    } catch {
      return 0;
    }
  };
  
  const complianceRate = getComplianceRate();

  // Dados para gráficos
  const statusData = [
    { name: 'Ativos', value: colaboradoresAtivos, color: '#10b981' },
    { name: 'Inativos', value: colaboradoresEmpresa.filter(c => c.status === 'INATIVO').length, color: '#f59e0b' },
    { name: 'Demitidos', value: colaboradoresEmpresa.filter(c => c.status === 'DEMITIDO').length, color: '#ef4444' }
  ];

  const departamentosData = colaboradoresEmpresa.reduce((acc, c) => {
    const dept = c.departamento || 'Não Informado';
    const existing = acc.find(item => item.name === dept);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: dept, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).slice(0, 5);

  const cobrancasStatusData = [
    { name: 'Pendente', value: dividasEmpresa.filter(d => d.status === 'pendente').length },
    { name: 'Vencido', value: dividasEmpresa.filter(d => d.estagio === 'vencido').length },
    { name: 'Negociação', value: dividasEmpresa.filter(d => d.status === 'negociacao').length },
    { name: 'Acordado', value: dividasEmpresa.filter(d => d.status === 'acordado').length }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColaboradores}</div>
            <p className="text-xs text-muted-foreground">
              {colaboradoresAtivos} ativos ({Math.round((colaboradoresAtivos / totalColaboradores) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Cobranças</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(valorTotalDividas)}</div>
            <p className="text-xs text-muted-foreground">
              {dividasVencidas} dívidas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceRate}%</div>
            <Progress value={complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denúncias Abertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{denunciasAbertas}</div>
            <p className="text-xs text-muted-foreground">
              {denunciasEmpresa.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Colaboradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status dos Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart data={statusData}>
                <Pie 
                  data={statusData} 
                  dataKey="value" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Colaboradores']} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colaboradores por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Colaboradores por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departamentosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status das Cobranças */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Status das Cobranças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cobrancasStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maiores Dívidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Maiores Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dividasEmpresa
              .sort((a, b) => b.valor_atualizado - a.valor_atualizado)
              .slice(0, 5)
              .map((divida, index) => {
                const devedor = devedoresEmpresa.find(d => d.id === divida.devedor_id);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{devedor?.nome || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">
                        Venc: {new Date(divida.data_vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCurrency(divida.valor_atualizado)}</div>
                      <Badge variant={divida.estagio === 'vencido' ? 'destructive' : 'outline'} className="text-xs">
                        {divida.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            {dividasEmpresa.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma dívida cadastrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recursos Humanos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Taxa de Rotatividade</span>
              <span className="text-sm font-medium">8.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tempo Médio Empresa</span>
              <span className="text-sm font-medium">2.3 anos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Salário Médio</span>
              <span className="text-sm font-medium">R$ 3.200</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cobranças</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Taxa de Recuperação</span>
              <span className="text-sm font-medium">65%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tempo Médio Cobrança</span>
              <span className="text-sm font-medium">45 dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Acordos Ativos</span>
              <span className="text-sm font-medium">12</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceRate < 80 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                <span className="font-medium text-red-800">Compliance Baixo:</span>
                <span className="text-red-600"> Revisar documentação pendente</span>
              </div>
            )}
            {denunciasAbertas > 0 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <span className="font-medium text-yellow-800">Denúncias Abertas:</span>
                <span className="text-yellow-600"> {denunciasAbertas} casos precisam de análise</span>
              </div>
            )}
            {dividasVencidas > 0 && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                <span className="font-medium text-orange-800">Dívidas Vencidas:</span>
                <span className="text-orange-600"> {dividasVencidas} cobranças atrasadas</span>
              </div>
            )}
            {complianceRate >= 80 && denunciasAbertas === 0 && dividasVencidas === 0 && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="font-medium text-green-800">Status OK:</span>
                <span className="text-green-600"> Manter monitoramento regular</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}