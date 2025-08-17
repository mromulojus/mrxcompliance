import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Building2, TrendingUp, PieChart, BarChart3, DollarSign, UserPlus, FileSpreadsheet, FileText, CheckSquare, AlertTriangle, Search, LayoutDashboard, Scale, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useHR } from '@/context/HRContext';
import { ColaboradorCard } from '@/components/hr/ColaboradorCard';
import { FormColaboradorCompleto } from '@/components/hr/FormColaboradorCompleto';
import { ImportarColaboradores } from '@/components/hr/ImportarColaboradores';
import { VisualizacaoColaborador } from '@/components/hr/VisualizacaoColaborador';
import { AuditoriaEmpresa } from '@/components/hr/AuditoriaEmpresa';
import { DenunciasEmpresa } from '@/components/hr/DenunciasEmpresa';
import { DebtoEmpresa } from '@/components/debto/DebtoEmpresa';
import { ProcessosJudiciaisDashboard } from '@/components/processos/ProcessosJudiciaisDashboard';
import { ExportPdf } from '@/components/hr/ExportPdf';
import { PainelAvisos } from '@/components/hr/PainelAvisos';
import { Logo } from '@/components/ui/logo';
import { Footer } from '@/components/ui/footer';
import { calcularTotalRescisaoEmpresa } from '@/lib/rescisao';
import { EmpresaDashboard } from '@/components/dashboard/EmpresaDashboard';
import { ComplianceAuditDashboard } from '@/components/dashboard/ComplianceAuditDashboard';
export default function EmpresaDetalhes() {
  const {
    empresaId
  } = useParams();
  const navigate = useNavigate();
  const {
    empresas,
    colaboradores
  } = useSupabaseData();
  const { colaboradores: colaboradoresHR } = useHR();
  const [showFormColaborador, setShowFormColaborador] = useState(false);
  const [showImportColaboradores, setShowImportColaboradores] = useState(false);
  const [showVisualizacaoColaborador, setShowVisualizacaoColaborador] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<any>(null);
  const [colaboradorEditando, setColaboradorEditando] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchColaboradores, setSearchColaboradores] = useState('');
  const { toast } = useToast();
  const empresa = empresas.find(e => e.id === empresaId);
  // Usar apenas colaboradores do Supabase para evitar duplicação
  const colaboradoresEmpresa = colaboradores.filter(c => c.empresa_id === empresaId);
  
  // Filtrar colaboradores pela busca
  const colaboradoresFiltrados = colaboradoresEmpresa.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchColaboradores.toLowerCase()) ||
    colaborador.cpf.toLowerCase().includes(searchColaboradores.toLowerCase()) ||
    colaborador.cargo.toLowerCase().includes(searchColaboradores.toLowerCase()) ||
    colaborador.departamento.toLowerCase().includes(searchColaboradores.toLowerCase())
  );
  if (!empresa) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
          <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
        </div>
      </div>;
  }

  // Análises da empresa
  const colaboradoresAtivos = colaboradoresEmpresa.filter(c => c.status === 'ATIVO').length;
  const colaboradoresInativos = colaboradoresEmpresa.filter(c => c.status === 'INATIVO').length;
  const colaboradoresDemitidos = colaboradoresEmpresa.filter(c => c.status === 'DEMITIDO').length;
  const distribuicaoGenero = {
    feminino: colaboradoresEmpresa.filter(c => c.sexo === 'FEMININO').length,
    masculino: colaboradoresEmpresa.filter(c => c.sexo === 'MASCULINO').length
  };

  // Simulação de dados de raça (em produção, viria dos dados dos colaboradores)
  const distribuicaoRacaGenero = {
    mulheresNegras: Math.floor(colaboradoresEmpresa.filter(c => c.sexo === 'FEMININO').length * 0.3),
    mulheresNaoNegras: colaboradoresEmpresa.filter(c => c.sexo === 'FEMININO').length - Math.floor(colaboradoresEmpresa.filter(c => c.sexo === 'FEMININO').length * 0.3),
    homensNegros: Math.floor(colaboradoresEmpresa.filter(c => c.sexo === 'MASCULINO').length * 0.4),
    homensNaoNegros: colaboradoresEmpresa.filter(c => c.sexo === 'MASCULINO').length - Math.floor(colaboradoresEmpresa.filter(c => c.sexo === 'MASCULINO').length * 0.4)
  };
  const distribuicaoRaca = {
    'BRANCA': Math.floor(colaboradoresEmpresa.length * 0.4),
    'PARDA': Math.floor(colaboradoresEmpresa.length * 0.35),
    'PRETA': Math.floor(colaboradoresEmpresa.length * 0.15),
    'AMARELA': Math.floor(colaboradoresEmpresa.length * 0.05),
    'INDIGENA': Math.floor(colaboradoresEmpresa.length * 0.02),
    'NÃO_INFORMADO': colaboradoresEmpresa.length - Math.floor(colaboradoresEmpresa.length * 0.97)
  };
  const distribuicaoEstadoCivil = colaboradoresEmpresa.reduce((acc, c) => {
    acc[c.estado_civil || 'NÃO_INFORMADO'] = (acc[c.estado_civil || 'NÃO_INFORMADO'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const distribuicaoEscolaridade = colaboradoresEmpresa.reduce((acc, c) => {
    acc[c.escolaridade || 'NÃO_INFORMADO'] = (acc[c.escolaridade || 'NÃO_INFORMADO'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Cálculo do valor de rescisão geral
  const { totalRescisao: valorRescisaoGeral, totalPrevisto: valorPrevistoGeral } = calcularTotalRescisaoEmpresa(colaboradoresEmpresa as any);
  
  const departamentos = colaboradoresEmpresa.reduce((acc, c) => {
    acc[c.departamento] = (acc[c.departamento] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const salarioMedio = colaboradoresEmpresa.reduce((sum, c) => sum + Number(c.salario_base), 0) / colaboradoresEmpresa.length || 0;
  const salarioMaior = Math.max(...colaboradoresEmpresa.map(c => Number(c.salario_base)), 0);
  const salarioMenor = Math.min(...colaboradoresEmpresa.map(c => Number(c.salario_base)), 0);
  const getComplianceRateFromAuditoria = (empresaId: string) => {
    try {
      const data = localStorage.getItem(`auditoria-${empresaId}`);
      if (!data) return 0;
      const auditoria = JSON.parse(data) as {
        itens: any[];
      };
      const documentos = auditoria.itens.filter(i => i.documento && i.documento.trim() !== '');
      const entregues = documentos.filter(i => i.status === 'ENTREGUE').length;
      if (documentos.length === 0) return 0;
      return Math.round(entregues / documentos.length * 100);
    } catch {
      return 0;
    }
  };
  const complianceRate = getComplianceRateFromAuditoria(empresa.id);

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${description} copiado para a área de transferência.`,
      });
    });
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Logo className="text-primary" size="lg" />
                <div>
                  <h1 className="text-2xl font-bold">{empresa.nome}</h1>
                  <p className="text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm bg-muted px-3 py-1 rounded font-mono text-muted-foreground">
                      ID: {empresa.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard(empresa.id, "ID da empresa")}
                      title="Copiar ID da empresa"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Temporariamente comentado: <ExportPdf type="empresa" data={empresa} colaboradores={colaboradoresEmpresa} /> */}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Tabs de Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="colaboradores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores & Analytics
            </TabsTrigger>
            <TabsTrigger value="processos" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Processos Judiciais
            </TabsTrigger>
            <TabsTrigger value="cobrancas" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cobranças
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Auditoria de Compliance
            </TabsTrigger>
            <TabsTrigger value="denuncias" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Denúncias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <EmpresaDashboard empresaId={empresa.id} />
          </TabsContent>

          <TabsContent value="colaboradores" className="space-y-8">
        {/* Painel de Avisos */}
        <PainelAvisos empresaId={empresa.id} />
        
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar colaboradores por nome, CPF, cargo ou departamento..."
            value={searchColaboradores}
            onChange={(e) => setSearchColaboradores(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{colaboradoresEmpresa.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Compliance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foregreen" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceRate}%</div>
              <Progress value={complianceRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salário Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salarioMedio.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(departamentos).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Valores de Rescisão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Rescisão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {valorRescisaoGeral.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Custo estimado para demitir todos os colaboradores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimativa de Acordo Previsto</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {valorPrevistoGeral.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor estimado real (40% - 70% da rescisão)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Análises Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ativos</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{colaboradoresAtivos}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{
                        width: `${colaboradoresAtivos / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inativos</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">{colaboradoresInativos}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{
                        width: `${colaboradoresInativos / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Demitidos</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">{colaboradoresDemitidos}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{
                        width: `${colaboradoresDemitidos / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Gênero */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Distribuição por Gênero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Feminino</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">{distribuicaoGenero.feminino}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{
                        width: `${distribuicaoGenero.feminino / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(distribuicaoGenero.feminino / colaboradoresEmpresa.length * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Masculino</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{distribuicaoGenero.masculino}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{
                        width: `${distribuicaoGenero.masculino / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(distribuicaoGenero.masculino / colaboradoresEmpresa.length * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição Raça e Gênero */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Diversidade: Raça e Gênero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Mulheres Negras</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-100 text-pink-800">{distribuicaoRacaGenero.mulheresNegras}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{
                        width: `${distribuicaoRacaGenero.mulheresNegras / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(distribuicaoRacaGenero.mulheresNegras / colaboradoresEmpresa.length * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mulheres Não Negras</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">{distribuicaoRacaGenero.mulheresNaoNegras}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{
                        width: `${distribuicaoRacaGenero.mulheresNaoNegras / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(distribuicaoRacaGenero.mulheresNaoNegras / colaboradoresEmpresa.length * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Homens Negros</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-100 text-cyan-800">{distribuicaoRacaGenero.homensNegros}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{
                        width: `${distribuicaoRacaGenero.homensNegros / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(distribuicaoRacaGenero.homensNegros / colaboradoresEmpresa.length * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Homens Não Negros</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{distribuicaoRacaGenero.homensNaoNegros}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{
                        width: `${distribuicaoRacaGenero.homensNaoNegros / colaboradoresEmpresa.length * 100}%`
                      }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {Math.round(distribuicaoRacaGenero.homensNaoNegros / colaboradoresEmpresa.length * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Raça */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribuição Racial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(distribuicaoRaca).map(([raca, count]) => {
                const c = Number(count) || 0;
                return (
                  <div key={raca} className="flex justify-between items-center">
                    <span className="text-sm">{raca.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c}</Badge>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{
                          width: `${c / colaboradoresEmpresa.length * 100}%`
                        }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round(c / colaboradoresEmpresa.length * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Distribuição por Estado Civil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estado Civil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(distribuicaoEstadoCivil as Record<string, number>).map(([estado, count]) => {
                const c = Number(count) || 0;
                return (
                  <div key={estado} className="flex justify-between items-center">
                    <span className="text-sm">{estado.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c}</Badge>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{
                          width: `${c / colaboradoresEmpresa.length * 100}%`
                        }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round(c / colaboradoresEmpresa.length * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Distribuição por Escolaridade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Escolaridade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(distribuicaoEscolaridade as Record<string, number>).map(([escolaridade, count]) => {
                const c = Number(count) || 0;
                return (
                  <div key={escolaridade} className="flex justify-between items-center">
                    <span className="text-sm">{escolaridade.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c}</Badge>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{
                          width: `${c / colaboradoresEmpresa.length * 100}%`
                        }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round(c / colaboradoresEmpresa.length * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Departamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Colaboradores por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(departamentos as Record<string, number>).map(([dept, count]) => {
                const c = Number(count) || 0;
                return (
                  <div key={dept} className="flex justify-between items-center">
                    <span className="text-sm">{dept}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c}</Badge>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{
                          width: `${c / colaboradoresEmpresa.length * 100}%`
                        }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Análise Salarial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Análise Salarial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Maior Salário:</span>
                <span className="font-semibold">
                  {salarioMaior.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Menor Salário:</span>
                <span className="font-semibold">
                  {salarioMenor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Salário Médio:</span>
                <span className="font-semibold">
                  {salarioMedio.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Colaboradores */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Colaboradores da Empresa ({colaboradoresEmpresa.length})
            </h2>
            <div className="flex gap-2">
              <Dialog open={showImportColaboradores} onOpenChange={setShowImportColaboradores}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Importar CSV
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <ImportarColaboradores onClose={() => setShowImportColaboradores(false)} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={showFormColaborador} onOpenChange={setShowFormColaborador}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Adicionar Colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <FormColaboradorCompleto 
                    colaborador={colaboradorEditando} 
                    empresaId={empresaId} 
                    onSalvar={() => {
                      setShowFormColaborador(false);
                      setColaboradorEditando(null);
                    }} 
                    onCancelar={() => {
                      setShowFormColaborador(false);
                      setColaboradorEditando(null);
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {colaboradoresEmpresa.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum colaborador encontrado</h3>
                <p className="text-muted-foreground">Esta empresa ainda não possui colaboradores cadastrados.</p>
              </CardContent>
            </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colaboradoresEmpresa.map((c: any) => (
                <ColaboradorCard 
                  key={c.id} 
                  colaborador={{
                    ...c,
                    empresa: c.empresa_id,
                    contato_emergencia: {
                      nome: c.contato_emergencia_nome || '',
                      telefone: c.contato_emergencia_telefone || '',
                      parentesco: c.contato_emergencia_parentesco || ''
                    },
                    documentos: {
                      cpf: c.cpf || '',
                      rg: c.rg || '',
                      rg_orgao_emissor: c.rg_orgao_emissor || '',
                      ctps: c.ctps || '',
                      ctps_serie: c.ctps_serie || '',
                      pis_pasep: c.pis_pasep || '',
                      titulo_eleitor: c.titulo_eleitor || '',
                      reservista: c.reservista || ''
                    },
                    beneficios: {
                      vale_transporte: c.vale_transporte || false,
                      vale_refeicao: c.vale_refeicao || false,
                      valor_vale_transporte: Number(c.valor_vale_transporte) || 0,
                      valor_vale_refeicao: Number(c.valor_vale_refeicao) || 0,
                      plano_saude: c.plano_saude || false,
                      plano_odontologico: c.plano_odontologico || false
                    },
                    dependentes: {
                      tem_filhos_menores_14: c.tem_filhos_menores_14 || false,
                      quantidade_filhos: c.quantidade_filhos || 0,
                      filhos: Array.isArray(c.filhos) ? c.filhos : []
                    },
                    dados_bancarios: {
                      banco: c.banco || '',
                      agencia: c.agencia || '',
                      conta: c.conta || '',
                      tipo_conta: c.tipo_conta || 'CORRENTE',
                      pix: c.pix || ''
                    },
                    documentos_arquivos: [],
                    historico: [],
                    auditoria: {
                      created_at: c.created_at,
                      updated_at: c.updated_at,
                      created_by: c.created_by || ''
                    }
                  }} 
                  onEdit={(id) => {
                    const c = colaboradoresEmpresa.find(col => col.id === id);
                    if (c) {
                      const colaborador = {
                        ...c,
                        empresa: c.empresa_id,
                        contato_emergencia: {
                          nome: c.contato_emergencia_nome || '',
                          telefone: c.contato_emergencia_telefone || '',
                          parentesco: c.contato_emergencia_parentesco || ''
                        },
                        documentos: {
                          cpf: c.cpf || '',
                          rg: c.rg || '',
                          rg_orgao_emissor: c.rg_orgao_emissor || '',
                          ctps: c.ctps || '',
                          ctps_serie: c.ctps_serie || '',
                          pis_pasep: c.pis_pasep || '',
                          titulo_eleitor: c.titulo_eleitor || '',
                          reservista: c.reservista || ''
                        },
                        beneficios: {
                          vale_transporte: c.vale_transporte || false,
                          vale_refeicao: c.vale_refeicao || false,
                          valor_vale_transporte: Number(c.valor_vale_transporte) || 0,
                          valor_vale_refeicao: Number(c.valor_vale_refeicao) || 0,
                          plano_saude: c.plano_saude || false,
                          plano_odontologico: c.plano_odontologico || false
                        },
                        dependentes: {
                          tem_filhos_menores_14: c.tem_filhos_menores_14 || false,
                          quantidade_filhos: c.quantidade_filhos || 0,
                          filhos: Array.isArray(c.filhos) ? c.filhos : []
                        },
                        dados_bancarios: {
                          banco: c.banco || '',
                          agencia: c.agencia || '',
                          conta: c.conta || '',
                          tipo_conta: c.tipo_conta || 'CORRENTE',
                          pix: c.pix || ''
                        },
                        documentos_arquivos: [],
                        historico: [],
                        auditoria: {
                          created_at: c.created_at,
                          updated_at: c.updated_at,
                          created_by: c.created_by || ''
                        }
                      };
                      setColaboradorEditando(colaborador);
                      setShowFormColaborador(true);
                    }
                  }}
                  onView={(id) => {
                    const colaborador = colaboradoresEmpresa.find(col => col.id === id);
                    if (colaborador) {
                      setColaboradorSelecionado(colaborador);
                      setShowVisualizacaoColaborador(true);
                    }
                  }}
                />
              ))}
            </div>}
        </section>

        </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="gerenciar">Gerenciar Auditoria</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6">
                <ComplianceAuditDashboard empresaId={empresaId!} />
              </TabsContent>
              
              <TabsContent value="gerenciar" className="space-y-6">
                <AuditoriaEmpresa 
                  empresaId={empresaId!} 
                  nomeEmpresa={empresa?.nome || ''} 
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

        <TabsContent value="cobrancas" className="space-y-8">
          <DebtoEmpresa empresaId={empresaId!} />
        </TabsContent>

        <TabsContent value="processos" className="space-y-8">
          <ProcessosJudiciaisDashboard empresaId={empresaId!} />
        </TabsContent>

        <TabsContent value="denuncias" className="space-y-8">
          <DenunciasEmpresa empresaId={empresaId!} />
        </TabsContent>

        </Tabs>
      </main>

      {/* Modal de Visualização do Colaborador */}
      <Dialog open={showVisualizacaoColaborador} onOpenChange={setShowVisualizacaoColaborador}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
          {colaboradorSelecionado && <VisualizacaoColaborador colaborador={colaboradorSelecionado} onClose={() => setShowVisualizacaoColaborador(false)} onEdit={id => {
          setColaboradorEditando(colaboradorSelecionado);
          setShowVisualizacaoColaborador(false);
          setShowFormColaborador(true);
        }} />}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>;
}