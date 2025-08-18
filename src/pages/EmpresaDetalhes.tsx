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
import { useAuth } from '@/context/AuthContext';
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
  const { can } = useAuth();
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
            {can('view:processos') && (
              <TabsTrigger value="processos" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Processos Judiciais
              </TabsTrigger>
            )}
            <TabsTrigger value="cobrancas" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cobranças
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Auditoria de Compliance
            </TabsTrigger>
            {can('view:denuncias') && (
              <TabsTrigger value="denuncias" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Denúncias
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <EmpresaDashboard empresaId={empresaId!} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Colaboradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-2xl font-bold">{colaboradoresAtivos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inativos</p>
                      <p className="text-2xl font-bold">{colaboradoresInativos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Demitidos</p>
                      <p className="text-2xl font-bold">{colaboradoresDemitidos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Painel de Avisos</CardTitle>
                </CardHeader>
                <CardContent>
                  <PainelAvisos empresaId={empresaId!} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="colaboradores" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar por nome, CPF, cargo ou departamento"
                  value={searchColaboradores}
                  onChange={e => setSearchColaboradores(e.target.value)}
                  className="w-full md:w-[400px]"
                />
              </div>
              <div className="flex gap-2">
                <Dialog open={showFormColaborador} onOpenChange={setShowFormColaborador}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                        setColaboradorEditando(null);
                        setShowFormColaborador(true);
                      }}>
                      <UserPlus className="mr-2 h-4 w-4" /> Novo Colaborador
                    </Button>
                  </DialogTrigger>
                  <FormColaboradorCompleto
                    open={showFormColaborador}
                    onOpenChange={setShowFormColaborador}
                    initialData={colaboradorEditando}
                    empresaId={empresaId!}
                  />
                </Dialog>
                <Dialog open={showImportColaboradores} onOpenChange={setShowImportColaboradores}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar
                    </Button>
                  </DialogTrigger>
                  <ImportarColaboradores open={showImportColaboradores} onOpenChange={setShowImportColaboradores} />
                </Dialog>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {colaboradoresFiltrados.map(colaborador => (
                <ColaboradorCard
                  key={colaborador.id}
                  colaborador={colaborador as any}
                  onEdit={(id) => {
                    const selec = colaboradoresEmpresa.find(c => c.id === id);
                    setColaboradorEditando(selec as any);
                    setShowFormColaborador(true);
                  }}
                  onView={(id) => {
                    const selec = colaboradoresEmpresa.find(c => c.id === id);
                    setColaboradorSelecionado(selec as any);
                    setShowVisualizacaoColaborador(true);
                  }}
                />
              ))}
            </div>
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

        {can('view:processos') && (
          <TabsContent value="processos" className="space-y-8">
            <ProcessosJudiciaisDashboard empresaId={empresaId!} />
          </TabsContent>
        )}

        {can('view:denuncias') && (
          <TabsContent value="denuncias" className="space-y-8">
            <DenunciasEmpresa empresaId={empresaId!} />
          </TabsContent>
        )}

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