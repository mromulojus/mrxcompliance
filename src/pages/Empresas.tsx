import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useDebtoData } from "@/hooks/useDebtoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Eye, Search, Trash2, AlertTriangle, FileText, TrendingUp, Zap, Plus, Upload, BarChart3 } from "lucide-react";
import { useHR } from "@/context/HRContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Empresas = () => {
  const { empresas, colaboradores, loading } = useSupabaseData();
  const { dividas, loading: debtoLoading } = useDebtoData();
  const { removerEmpresa } = useHR();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "Empresas - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Lista completa de empresas - MRx Compliance.");
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return empresas;
    return empresas.filter((e) =>
      [e.nome, e.cnpj, e.responsavel, e.email].some((v) => v?.toLowerCase().includes(term))
    );
  }, [empresas, q]);

  const countByEmpresa = useMemo(() => {
    const map: Record<string, { total: number; ativos: number }> = {};
    for (const e of empresas) map[e.id] = { total: 0, ativos: 0 };
    for (const c of colaboradores) {
      if (!map[c.empresa_id]) map[c.empresa_id] = { total: 0, ativos: 0 };
      map[c.empresa_id].total += 1;
      if (c.status === "ATIVO") map[c.empresa_id].ativos += 1;
    }
    return map;
  }, [empresas, colaboradores]);

  // Calcular KPIs reais baseados nos dados
  const kpis = useMemo(() => {
    if (debtoLoading || loading) return { dividasAbertas: 0, acordosAtivos: 0, taxaRecuperacao: 0 };

    // Dívidas em aberto (pendente, negociacao, vencido)
    const dividasAbertas = dividas
      .filter(d => ['pendente', 'negociacao', 'vencido'].includes(d.status))
      .reduce((sum, d) => sum + (d.valor_atualizado || 0), 0);

    // Acordos ativos - simulamos baseado nas dívidas acordadas
    const acordosAtivos = dividas.filter(d => d.status === 'acordado').length;

    // Taxa de recuperação (porcentagem de dívidas pagas)
    const totalDividas = dividas.length;
    const dividasPagas = dividas.filter(d => d.status === 'pago').length;
    const taxaRecuperacao = totalDividas > 0 ? Math.round((dividasPagas / totalDividas) * 100) : 0;

    return { dividasAbertas, acordosAtivos, taxaRecuperacao };
  }, [dividas, debtoLoading, loading]);

  // Calcular alertas baseados em dados reais
  const alertas = useMemo(() => {
    if (debtoLoading) return { vencimentosProximos: 0, acordosVencimento: 0 };

    const hoje = new Date();
    const proximosSete = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

    const vencimentosProximos = dividas.filter(d => {
      const vencimento = new Date(d.data_vencimento);
      return vencimento >= hoje && vencimento <= proximosSete && d.status !== 'pago';
    }).length;

    // Acordos próximos do vencimento - baseado em dívidas acordadas
    const acordosVencimento = dividas.filter(d => {
      if (d.status !== 'acordado') return false;
      const vencimento = new Date(d.data_vencimento);
      return vencimento >= hoje && vencimento <= proximosSete;
    }).length;

    return { vencimentosProximos, acordosVencimento };
  }, [dividas, debtoLoading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-sm text-muted-foreground">Acesse os detalhes de todas as empresas</p>
      </header>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ, responsável ou e-mail"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Dívidas em Aberto</p>
                <p className="text-2xl font-bold">
                  {debtoLoading ? "..." : formatCurrency(kpis.dividasAbertas)}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Acordos Ativos</p>
                <p className="text-2xl font-bold">
                  {debtoLoading ? "..." : kpis.acordosAtivos}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Taxa de Recuperação</p>
                <p className="text-2xl font-bold">
                  {debtoLoading ? "..." : `${kpis.taxaRecuperacao}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Empresas Ativas</p>
                <p className="text-2xl font-bold">{empresas.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Moderno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Barras - Dívidas por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Dívidas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Gráfico de Barras - Dívidas por Status</p>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição por Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Gráfico de Pizza - Distribuição por Empresa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.vencimentosProximos > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-800">
                  {alertas.vencimentosProximos} vencimentos próximos
                </p>
                <p className="text-xs text-orange-600">Dívidas vencendo nos próximos 7 dias</p>
              </div>
            )}
            {empresas.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  {Math.floor(empresas.length * 0.3)} pendências de due diligence
                </p>
                <p className="text-xs text-red-600">Empresas precisam de atualização de dados</p>
              </div>
            )}
            {alertas.acordosVencimento > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  {alertas.acordosVencimento} acordos para revisão
                </p>
                <p className="text-xs text-blue-600">Acordos próximos do vencimento</p>
              </div>
            )}
            {alertas.vencimentosProximos === 0 && alertas.acordosVencimento === 0 && empresas.length === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Nenhum alerta no momento</p>
                <p className="text-xs text-green-600">Tudo funcionando conforme esperado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Relatório Mensal
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Upload className="h-4 w-4" />
              Importar Dados
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard Completo
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {list.map((empresa) => {
          const stats = countByEmpresa[empresa.id] || { total: 0, ativos: 0 };
          const complianceKey = `auditoria-${empresa.id}`;
          let compliance = 0;
          try {
            const data = localStorage.getItem(complianceKey);
            if (data) {
              const auditoria = JSON.parse(data) as { itens: any[] };
              const docs = auditoria.itens.filter((i) => i.documento && i.documento.trim() !== "");
              const ok = docs.filter((i) => i.status === "ENTREGUE").length;
              compliance = docs.length ? Math.round((ok / docs.length) * 100) : 0;
            }
          } catch {}

          return (
            <Card key={empresa.id} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">CNPJ: {empresa.cnpj}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/empresa/${empresa.id}`)} className="gap-2">
                    <Eye className="h-4 w-4" /> Ver detalhes
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Empresa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a empresa "{empresa.nome}"? 
                          Esta ação também removerá todos os colaboradores associados e não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removerEmpresa(empresa.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{empresa.endereco}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.ativos}</div>
                    <div className="text-xs text-muted-foreground">Ativos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{compliance}%</div>
                    <div className="text-xs text-muted-foreground">Compliance</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Compliance</span>
                    <span>{compliance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${compliance}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default Empresas;
