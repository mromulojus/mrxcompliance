import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  FileText,
  MessageCircle,
  TrendingUp,
  Clock,
  DollarSign,
  Plus
} from "lucide-react";
import { useDebtoData, Devedor, Divida } from "@/hooks/useDebtoData";
import { DividaCard } from "@/components/debto/DividaCard";
import { FormDivida } from "@/components/debto/FormDivida";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HistoricoAtualizacaoDivida } from "@/components/debto/HistoricoAtualizacaoDivida";

export default function DevedorDetalhes() {
  const { devedorId } = useParams();
  const navigate = useNavigate();
  const { devedores, dividas, loading } = useDebtoData();
  const [devedor, setDevedor] = useState<Devedor | null>(null);
  const [dividasDevedor, setDividasDevedor] = useState<Divida[]>([]);

  useEffect(() => {
    if (devedorId && devedores.length > 0) {
      const encontrado = devedores.find(d => d.id === devedorId);
      setDevedor(encontrado || null);
    }
  }, [devedorId, devedores]);

  useEffect(() => {
    if (devedorId && dividas.length > 0) {
      const dividasEncontradas = dividas.filter(d => d.devedor_id === devedorId);
      setDividasDevedor(dividasEncontradas);
    }
  }, [devedorId, dividas]);

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const calcularEstatisticas = () => {
    const total = dividasDevedor.reduce((acc, d) => acc + d.valor_atualizado, 0);
    const pendentes = dividasDevedor.filter(d => d.status === 'pendente' || d.estagio === 'vencido');
    const maisAntiga = dividasDevedor
      .filter(d => new Date(d.data_vencimento) < new Date())
      .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0];

    const diasVencimento = maisAntiga ? 
      Math.floor((new Date().getTime() - new Date(maisAntiga.data_vencimento).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      totalDividas: total,
      quantidadeDividas: dividasDevedor.length,
      dividasPendentes: pendentes.length,
      diasMaisAntiga: diasVencimento
    };
  };

  const stats = calcularEstatisticas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!devedor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Devedor não encontrado</h2>
        <Button onClick={() => navigate('/debto')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/debto')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                {getInitials(devedor.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{devedor.nome}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {devedor.tipo_pessoa === 'FISICA' ? 'CPF' : 'CNPJ'}
                </Badge>
                <span className="text-muted-foreground">{devedor.documento}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getScoreColor(devedor.score_recuperabilidade)}>
            Score: {devedor.score_recuperabilidade}/100
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Dívida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Dívida</DialogTitle>
              </DialogHeader>
              <FormDivida onSuccess={() => window.location.reload()} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total em Dívidas</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalDividas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Quantidade</p>
                <p className="text-xl font-bold text-blue-600">{stats.quantidadeDividas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-orange-600">{stats.dividasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Dias Vencida</p>
                <p className="text-xl font-bold text-red-600">
                  {stats.diasMaisAntiga > 0 ? `${stats.diasMaisAntiga} dias` : 'Em dia'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="detalhes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas ({dividasDevedor.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico Atualização</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devedor.telefone_principal && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{formatPhone(devedor.telefone_principal)}</span>
                  </div>
                )}
                
                {devedor.telefone_whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span>{formatPhone(devedor.telefone_whatsapp)}</span>
                  </div>
                )}
                
                {devedor.email_principal && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{devedor.email_principal}</span>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Canal Preferencial</p>
                  <Badge variant="outline" className="capitalize">
                    {devedor.canal_preferencial}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devedor.cidade && (
                  <div>
                    <p className="font-medium">{devedor.cidade}, {devedor.estado}</p>
                    {devedor.cep && (
                      <p className="text-sm text-muted-foreground">CEP: {devedor.cep}</p>
                    )}
                  </div>
                )}
                
                {devedor.endereco_completo && (
                  <p className="text-sm">{devedor.endereco_completo}</p>
                )}
                
                {devedor.local_trabalho && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{devedor.local_trabalho}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          {devedor.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{devedor.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dividas" className="space-y-6">
          {dividasDevedor.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dividasDevedor.map((divida) => (
                <DividaCard key={divida.id} divida={divida} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma dívida encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Este devedor ainda não possui dívidas cadastradas.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeira Dívida
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nova Dívida</DialogTitle>
                    </DialogHeader>
                    <FormDivida onSuccess={() => window.location.reload()} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comentarios">
          <Card>
            <CardHeader>
              <CardTitle>Comentários do Devedor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Área livre para anotações manuais sobre o devedor
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  className="w-full min-h-[120px] p-3 border rounded-md resize-y"
                  placeholder="Digite seus comentários sobre o devedor..."
                  defaultValue={devedor.observacoes || ""}
                />
                <Button size="sm">
                  Salvar Comentários
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}