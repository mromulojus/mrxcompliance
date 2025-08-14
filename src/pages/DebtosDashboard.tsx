import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, TrendingUp, AlertTriangle, DollarSign, Users } from "lucide-react";
import { DebtoKPICards } from "@/components/debto/DebtoKPICards";
import { DevedorCard } from "@/components/debto/DevedorCard";
import { DividaCard } from "@/components/debto/DividaCard";
import { DebtoFilters } from "@/components/debto/DebtoFilters";
import { FormDebtor } from "@/components/debto/FormDebtor";
import { FormDivida } from "@/components/debto/FormDivida";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useDebtoData } from "@/hooks/useDebtoData";

export default function DebtosDashboard() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isDebtorDialogOpen, setIsDebtorDialogOpen] = useState(false);
  const [isDividaDialogOpen, setIsDividaDialogOpen] = useState(false);

  const {
    devedores,
    dividas,
    empresas,
    loading,
    fetchDevedores,
    fetchDividas
  } = useDebtoData();

  const filteredDevedores = devedores.filter(devedor =>
    devedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    devedor.documento.includes(searchTerm)
  );

  const filteredDividas = dividas.filter(divida =>
    searchTerm === "" || 
    devedores.find(d => d.id === divida.devedor_id)?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Debto - Gestão de Cobranças
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema completo de cobrança terceirizada
            </p>
          </div>
          
          <div className="flex gap-2">
            {hasRole('administrador') && (
              <>
                <Dialog open={isDebtorDialogOpen} onOpenChange={setIsDebtorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
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
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
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

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:bg-card transition-colors"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-border/50 hover:bg-muted/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <DebtoFilters 
                empresas={empresas}
                selectedEmpresa={selectedEmpresa}
                onEmpresaChange={setSelectedEmpresa}
              />
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <DebtoKPICards dividas={dividas} devedores={devedores} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="devedores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Devedores
            </TabsTrigger>
            <TabsTrigger value="dividas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Dívidas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Debtors */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
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
                </CardContent>
              </Card>

              {/* Urgent Debts */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Dívidas Urgentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredDividas
                    .filter(divida => divida.urgency_score > 70)
                    .slice(0, 5)
                    .map((divida) => (
                      <DividaCard key={divida.id} divida={divida} compact />
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devedores" className="space-y-4">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDevedores.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum devedor encontrado</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando um novo devedor"}
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
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDividas.length === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma dívida encontrada</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? "Tente ajustar os filtros de busca" : "Comece cadastrando uma nova dívida"}
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Performance de Cobrança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Gráficos de performance em desenvolvimento
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>ROI por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Análise de ROI em desenvolvimento
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}