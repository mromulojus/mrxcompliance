import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Building2, Eye, TrendingUp, Activity } from 'lucide-react';
import { Dashboard } from '@/components/hr/Dashboard';
import { DenunciasCard } from '@/components/hr/DenunciasCard';
import { ColaboradorCard } from '@/components/hr/ColaboradorCard';
import { FiltrosColaboradores } from '@/components/hr/FiltrosColaboradores';
import { FormColaboradorCompleto } from '@/components/hr/FormColaboradorCompleto';
import { FormEmpresa } from '@/components/hr/FormEmpresa';
import { Logo } from '@/components/ui/logo';
import { Footer } from '@/components/ui/footer';
import { useHR } from '@/context/HRContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { colaboradoresFiltrados, dashboardStats } = useHR();
  const { empresas: empresasSupabase, loading: loadingSupabase } = useSupabaseData();
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const [colaboradorEditando, setColaboradorEditando] = useState<string | null>(null);
  const [showFormEmpresa, setShowFormEmpresa] = useState(false);

  const handleNovoColaborador = () => {
    setColaboradorEditando(null);
    setModalAberto(true);
  };

  const handleEditarColaborador = (id: string) => {
    setColaboradorEditando(id);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setColaboradorEditando(null);
  };

  const colaboradorParaEditar = colaboradorEditando 
    ? colaboradoresFiltrados.find(c => c.id === colaboradorEditando)
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold">MRx Compliance</h1>
                <p className="text-muted-foreground">Gestão de Colaboradores</p>
              </div>
            </div>
            
            <Button onClick={handleNovoColaborador} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Colaborador
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Visão Geral</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              <Dashboard />
            </div>
            <div>
              <DenunciasCard />
            </div>
          </div>
        </section>

        {/* Empresas Info com melhor visualização */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Empresas Cadastradas</h2>
              <Dialog open={showFormEmpresa} onOpenChange={setShowFormEmpresa}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <FormEmpresa 
                    onSalvar={() => setShowFormEmpresa(false)}
                    onCancelar={() => setShowFormEmpresa(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingSupabase ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Carregando empresas...</p>
              </div>
            ) : empresasSupabase.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
              </div>
            ) : (
              empresasSupabase.map((empresa) => {
              const colaboradoresEmpresa = colaboradoresFiltrados.filter(c => c.empresa === empresa.id);
              const colaboradoresAtivos = colaboradoresEmpresa.filter(c => c.status === 'ATIVO').length;
              const getComplianceRateFromAuditoria = (empresaId: string) => {
                try {
                  const data = localStorage.getItem(`auditoria-${empresaId}`);
                  if (!data) return 0;
                  const auditoria = JSON.parse(data) as { itens: any[] };
                  const documentos = auditoria.itens.filter((i: any) => i.documento && i.documento.trim() !== '');
                  const entregues = documentos.filter((i: any) => i.status === 'ENTREGUE').length;
                  if (documentos.length === 0) return 0;
                  return Math.round((entregues / documentos.length) * 100);
                } catch {
                  return 0;
                }
              };
              const complianceRate = getComplianceRateFromAuditoria(empresa.id);
              
              return (
                <Card key={empresa.id} className="transition-all hover:shadow-lg cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/empresa/${empresa.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{empresa.endereco}</p>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{colaboradoresEmpresa.length}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{colaboradoresAtivos}</div>
                        <div className="text-xs text-muted-foreground">Ativos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{complianceRate}%</div>
                        <div className="text-xs text-muted-foreground">Compliance</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Compliance</span>
                        <span>{complianceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${complianceRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Insights Automáticos */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Insights do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🎂</div>
                  <div>
                    <div className="font-semibold">Aniversariantes do Mês</div>
                    <div className="text-sm text-muted-foreground">
                      {dashboardStats.aniversariantes} colaboradores fazem aniversário este mês
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl">📈</div>
                  <div>
                    <div className="font-semibold">Taxa de Retenção</div>
                    <div className="text-sm text-muted-foreground">
                      {dashboardStats.complianceRate}% dos colaboradores estão ativos
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl">👥</div>
                  <div>
                    <div className="font-semibold">Força de Trabalho</div>
                    <div className="text-sm text-muted-foreground">
                      {dashboardStats.totalColaboradores} colaboradores distribuídos em {empresasSupabase.length} empresas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {dashboardStats.totalColaboradores}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Colaboradores</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ativos</span>
                    <span className="font-semibold text-green-600">{dashboardStats.colaboradoresAtivos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Empresas</span>
                    <span className="font-semibold">{empresasSupabase.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Compliance</span>
                    <span className="font-semibold text-blue-600">{dashboardStats.complianceRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filtros e Lista de Colaboradores */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Colaboradores ({colaboradoresFiltrados.length})
            </h2>
          </div>

          <div className="space-y-6">
            <FiltrosColaboradores />
            
            {colaboradoresFiltrados.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum colaborador encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há colaboradores que correspondam aos filtros selecionados.
                  </p>
                  <Button onClick={handleNovoColaborador}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Colaborador
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colaboradoresFiltrados.slice(0, 10).map((colaborador) => (
                  <ColaboradorCard
                    key={colaborador.id}
                    colaborador={colaborador}
                    onEdit={handleEditarColaborador}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal de Formulário */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {colaboradorEditando ? 'Editar Colaborador' : 'Novo Colaborador'}
            </DialogTitle>
          </DialogHeader>
          <FormColaboradorCompleto
            colaborador={colaboradorParaEditar}
            onSalvar={handleFecharModal}
            onCancelar={handleFecharModal}
          />
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Index;
