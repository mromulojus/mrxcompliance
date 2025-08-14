import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { DevedorCard } from "@/components/debto/DevedorCard";
import { DividaCard } from "@/components/debto/DividaCard";
import { FormDebtor } from "@/components/debto/FormDebtor";
import { FormDivida } from "@/components/debto/FormDivida";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useDebtoData } from "@/hooks/useDebtoData";
import { useAuth } from "@/context/AuthContext";

interface DebtoEmpresaProps {
  empresaId: string;
}

export function DebtoEmpresa({ empresaId }: DebtoEmpresaProps) {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isDebtorDialogOpen, setIsDebtorDialogOpen] = useState(false);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);

  const {
    devedores,
    dividas,
    loading,
    fetchDevedores,
    fetchDividas
  } = useDebtoData();

  // Filtrar dados por empresa
  const devedoresEmpresa = useMemo(() => 
    devedores.filter(devedor => devedor.empresa_id === empresaId),
    [devedores, empresaId]
  );

  const dividasEmpresa = useMemo(() => 
    dividas.filter(divida => divida.empresa_id === empresaId),
    [dividas, empresaId]
  );

  const filteredDevedores = devedoresEmpresa.filter(devedor =>
    devedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    devedor.documento.includes(searchTerm)
  );

  const filteredDividas = dividasEmpresa.filter(divida =>
    searchTerm === "" || 
    devedoresEmpresa.find(d => d.id === divida.devedor_id)?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPIs específicos da empresa
  const kpis = useMemo(() => {
    const totalDevedores = devedoresEmpresa.length;
    const totalDividas = dividasEmpresa.length;
    const valorTotalOriginal = dividasEmpresa.reduce((sum, d) => sum + (d.valor_original || 0), 0);
    const valorTotalAtualizado = dividasEmpresa.reduce((sum, d) => sum + (d.valor_atualizado || 0), 0);
    const dividasPendentes = dividasEmpresa.filter(d => d.status === 'pendente').length;
    const dividasVencidas = dividasEmpresa.filter(d => d.estagio === 'vencido').length;
    const dividasUrgentes = dividasEmpresa.filter(d => (d.urgency_score || 0) > 70).length;

    return {
      totalDevedores,
      totalDividas,
      valorTotalOriginal,
      valorTotalAtualizado,
      dividasPendentes,
      dividasVencidas,
      dividasUrgentes
    };
  }, [devedoresEmpresa, dividasEmpresa]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Cobranças</h2>
          <p className="text-muted-foreground">
            Controle de devedores e dívidas da empresa
          </p>
        </div>
        
        <div className="flex gap-2">
          {hasRole('administrador') && (
            <>
              <Dialog open={isDebtorDialogOpen} onOpenChange={setIsDebtorDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Devedor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <FormDebtor 
                    onSuccess={() => {
                      setIsDebtorDialogOpen(false);
                      fetchDevedores();
                    }}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isDividaDialogOpen} onOpenChange={setIsDividaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Dívida
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <FormDivida 
                    onSuccess={() => {
                      setIsDividaDialogOpen(false);
                      fetchDividas();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalDevedores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dívidas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalDividas}</div>
            <Badge variant="outline" className="mt-1">
              {kpis.dividasPendentes} pendentes
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(kpis.valorTotalAtualizado)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Orig: {formatCurrency(kpis.valorTotalOriginal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{kpis.dividasUrgentes}</div>
            <Badge variant="destructive" className="mt-1">
              {kpis.dividasVencidas} vencidas
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nome, CPF/CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs de conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="devedores">Devedores ({kpis.totalDevedores})</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas ({kpis.totalDividas})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Devedores Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Devedores Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredDevedores.slice(0, 5).map((devedor) => (
                  <DevedorCard key={devedor.id} devedor={devedor} compact />
                ))}
                {filteredDevedores.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum devedor cadastrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Dívidas Urgentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Dívidas Urgentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredDividas
                  .filter(divida => (divida.urgency_score || 0) > 70)
                  .slice(0, 5)
                  .map((divida) => (
                    <DividaCard key={divida.id} divida={divida} compact />
                  ))}
                {filteredDividas.filter(d => (d.urgency_score || 0) > 70).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma dívida urgente
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devedores" className="space-y-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredDevedores.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum devedor encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "Tente ajustar a busca" : "Comece cadastrando um novo devedor"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevedores.map((devedor) => (
                <DevedorCard 
                  key={devedor.id} 
                  devedor={devedor}
                  onUpdate={fetchDevedores}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dividas" className="space-y-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredDividas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma dívida encontrada</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "Tente ajustar a busca" : "Comece cadastrando uma nova dívida"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDividas.map((divida) => (
                <DividaCard 
                  key={divida.id} 
                  divida={divida}
                  onUpdate={fetchDividas}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}