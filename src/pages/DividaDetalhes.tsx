import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  Edit,
  Download,
  CheckCircle
} from "lucide-react";
import { useDebtoData, Divida } from "@/hooks/useDebtoData";
import { EmpresaTag } from "@/components/debto/EmpresaTag";
import { EtiquetasDisplay } from "@/components/debto/EtiquetasDisplay";
import { AcordoManager } from "@/components/debto/AcordoManager";
import { HistoricoCobrancasAvancado } from "@/components/debto/HistoricoCobrancasAvancado";
import { toast } from "sonner";

export default function DividaDetalhes() {
  const { dividaId } = useParams();
  const navigate = useNavigate();
  const { dividas, devedores, loading, atualizarDivida } = useDebtoData();
  const [divida, setDivida] = useState<Divida | null>(null);
  const [devedor, setDevedor] = useState<any>(null);

  useEffect(() => {
    if (dividaId && dividas.length > 0) {
      const encontrada = dividas.find(d => d.id === dividaId);
      setDivida(encontrada || null);
    }
  }, [dividaId, dividas]);

  useEffect(() => {
    if (divida && devedores.length > 0) {
      const devedorEncontrado = devedores.find(d => d.id === divida.devedor_id);
      setDevedor(devedorEncontrado || null);
    }
  }, [divida, devedores]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      case 'negociacao': return 'bg-blue-100 text-blue-700';
      case 'acordado': return 'bg-green-100 text-green-700';
      case 'pago': return 'bg-green-100 text-green-700';
      case 'judicial': return 'bg-red-100 text-red-700';
      case 'negativado': return 'bg-orange-100 text-orange-700';
      case 'protestado': return 'bg-red-100 text-red-700';
      case 'cancelado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calcularDiasAtraso = () => {
    if (!divida) return 0;
    const hoje = new Date();
    const vencimento = new Date(divida.data_vencimento);
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasAtraso);
  };

  const handleBaixarDivida = async () => {
    if (!divida) return;
    
    try {
      await atualizarDivida(divida.id, { status: 'pago' });
      toast.success('Dívida baixada com sucesso!');
      // Recarregar dados
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao baixar dívida');
    }
  };

  const handleVoltarEmpresa = () => {
    if (divida?.empresa_id) {
      navigate(`/empresa/${divida.empresa_id}`);
    } else {
      navigate('/debto');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!divida) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Dívida não encontrada</h2>
        <Button onClick={() => navigate('/debto')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const diasAtraso = calcularDiasAtraso();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleVoltarEmpresa}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{divida.origem_divida}</h1>
            <div className="flex items-center gap-2 mt-2">
              <EmpresaTag empresaId={divida.empresa_id} />
              <Badge className={getStatusColor(divida.status)}>
                {divida.status}
              </Badge>
              {devedor && (
                <Badge variant="outline">
                  {devedor.nome}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.open(`/divida/${divida.id}/editar`, '_blank')}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </Button>
          {divida.status !== 'pago' && (
            <Button onClick={handleBaixarDivida}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Baixar Dívida
            </Button>
          )}
        </div>
      </div>

      {/* Etiquetas */}
      {divida.etiquetas && divida.etiquetas.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Etiquetas</h3>
          <EtiquetasDisplay etiquetaIds={divida.etiquetas} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valor Original</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(divida.valor_original)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valor Atualizado</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(divida.valor_atualizado)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="text-lg font-bold text-orange-600">{formatDate(divida.data_vencimento)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Dias Atraso</p>
                <p className="text-xl font-bold text-red-600">
                  {diasAtraso > 0 ? `${diasAtraso} dias` : 'Em dia'}
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
          <TabsTrigger value="acordo">Acordo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações da Dívida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informações da Dívida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Original</p>
                    <p className="font-medium">{formatCurrency(divida.valor_original)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Atualizado</p>
                    <p className="font-bold text-primary">{formatCurrency(divida.valor_atualizado)}</p>
                  </div>
                </div>

                {(divida.numero_contrato || divida.numero_nf) && (
                  <div className="space-y-2 pt-2 border-t">
                    {divida.numero_contrato && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nº Contrato</p>
                        <p className="font-medium">{divida.numero_contrato}</p>
                      </div>
                    )}
                    {divida.numero_nf && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nº Nota Fiscal</p>
                        <p className="font-medium">{divida.numero_nf}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Estágio</p>
                  <Badge variant="outline" className="mt-1">
                    {divida.estagio.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Devedor */}
            {devedor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Devedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{devedor.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-medium">{devedor.documento}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <Badge variant="outline">
                      {devedor.tipo_pessoa === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/devedor/${devedor.id}`)}
                    className="w-full"
                  >
                    Ver Detalhes do Devedor
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="acordo" className="space-y-6">
          <AcordoManager 
            dividaId={divida.id} 
            valorOriginal={divida.valor_original}
            onAcordoCriado={() => {
              toast.success('Acordo criado e registrado no histórico!');
              window.location.reload();
            }}
          />
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <HistoricoCobrancasAvancado 
            dividaId={divida.id} 
            devedorId={divida.devedor_id}
          />
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos da Dívida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sistema de documentos em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}