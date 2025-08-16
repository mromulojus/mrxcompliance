import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Users,
  Banknote,
  History,
  Download,
  Eye,
  Edit,
  TrendingUp,
  Image
} from 'lucide-react';
import { Colaborador, HistoricoColaborador } from '@/types/hr';
import { ExportPdf } from './ExportPdf';
import { AdicionarObservacao } from './AdicionarObservacao';
import { AdicionarObservacaoInline } from './AdicionarObservacaoInline';
import { Logo } from '@/components/ui/logo';
import { calcularRescisaoColaborador, calcularValorPrevisto } from '@/lib/rescisao';
import { supabase } from '@/integrations/supabase/client';

interface VisualizacaoColaboradorProps {
  colaborador: Colaborador;
  onClose: () => void;
  onEdit?: (id: string) => void;
}

function RescisaoContent({ colaborador }: { colaborador: Colaborador }) {
  const rescisao = calcularRescisaoColaborador(colaborador);
  const valorRescisao = 'totalEstimado' in rescisao ? parseFloat(rescisao.totalEstimado) : 0;
  const valorPrevisto = calcularValorPrevisto(valorRescisao);

  const formatarMoeda = (valor: string | number) => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if ('erro' in rescisao) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-600">{rescisao.erro}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Cálculo de Rescisão ({rescisao.tipo})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Meses Trabalhados</label>
              <p className="font-semibold">{rescisao.mesesTrabalhados}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Férias Proporcionais</label>
              <p className="font-semibold">{formatarMoeda(rescisao.feriasProporcionais)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">1/3 Férias</label>
              <p className="font-semibold">{formatarMoeda(rescisao.tercoFerias)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">13º Proporcional</label>
              <p className="font-semibold">{formatarMoeda(rescisao.decimoTerceiro)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Aviso Prévio</label>
              <p className="font-semibold">{formatarMoeda(rescisao.avisoPrevio)}</p>
            </div>
            {rescisao.fgts && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">FGTS</label>
                <p className="font-semibold">{formatarMoeda(rescisao.fgts)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multa FGTS (40%)</label>
              <p className="font-semibold">{formatarMoeda(rescisao.multaFgts)}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total Estimado:</span>
              <span className="text-lg font-bold text-red-600">
                {formatarMoeda(rescisao.totalEstimado)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Valor Previsto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Valor estimado real (40% - 70% da rescisão)
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {formatarMoeda(valorPrevisto)}
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Observações:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Este é um cálculo estimativo</li>
              <li>• Valores podem variar conforme acordo</li>
              <li>• Consulte um advogado trabalhista para casos específicos</li>
              <li>• O valor previsto considera variações típicas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VisualizacaoColaborador({ colaborador, onClose, onEdit }: VisualizacaoColaboradorProps) {
  const [activeTab, setActiveTab] = useState('pessoais');
  const [historico, setHistorico] = useState<HistoricoColaborador[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800';
      case 'INATIVO':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEMITIDO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleObservacaoAdicionada = (novaObservacao: any) => {
    setHistorico(prev => [novaObservacao, ...prev]);
  };

  useEffect(() => {
    const loadHistorico = async () => {
      const { data, error } = await supabase
        .from('historico_colaborador')
        .select('id, observacao, created_at, created_by, historico_anexos(nome, url, tipo)')
        .eq('colaborador_id', colaborador.id)
        .order('created_at', { ascending: false });
      if (!error) {
        const formatted: HistoricoColaborador[] = (data || []).map((h: any) => ({
          id: h.id,
          observacao: h.observacao,
          data: h.created_at,
          usuario: h.created_by,
          anexos: h.historico_anexos || [],
          created_at: h.created_at,
        }));
        setHistorico(formatted);
      }
    };
    loadHistorico();
  }, [colaborador.id]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header com foto e informações principais */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={colaborador.foto_perfil} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {colaborador.nome?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {colaborador.nome}
                </h1>
                <Badge className={getStatusColor(colaborador.status)}>
                  {colaborador.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{colaborador.cargo} - {colaborador.departamento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{colaborador.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{colaborador.telefone || colaborador.celular}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Admitido em {formatarData(colaborador.data_admissao)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <ExportPdf type="colaborador" data={colaborador} />
              {onEdit && (
                <Button onClick={() => onEdit(colaborador.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs com informações detalhadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pessoais">Pessoais</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="beneficios">Benefícios</TabsTrigger>
          <TabsTrigger value="dependentes">Dependentes</TabsTrigger>
          <TabsTrigger value="bancarios">Bancários</TabsTrigger>
          <TabsTrigger value="rescisao">Rescisão</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Informações Pessoais */}
        <TabsContent value="pessoais">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p className="font-semibold">{formatarData(colaborador.data_nascimento)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                    <p className="font-semibold">{colaborador.sexo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
                    <p className="font-semibold">{colaborador.estado_civil}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Escolaridade</label>
                    <p className="font-semibold">{colaborador.escolaridade}</p>
                  </div>
                </div>
                
                {colaborador.nome_mae && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome da Mãe</label>
                        <p className="font-semibold">{colaborador.nome_mae}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome do Pai</label>
                        <p className="font-semibold">{colaborador.nome_pai || 'Não informado'}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço Completo</label>
                  <p className="font-semibold">
                    {colaborador.endereco}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {colaborador.cidade}/{colaborador.estado}
                  </p>
                  <p className="text-sm text-muted-foreground">CEP: {colaborador.cep}</p>
                </div>

                {colaborador.contato_emergencia && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contato de Emergência</label>
                      <p className="font-semibold">{colaborador.contato_emergencia.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {colaborador.contato_emergencia.telefone} ({colaborador.contato_emergencia.parentesco})
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {colaborador.documentos && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPF</label>
                      <p className="font-semibold">{colaborador.documentos.cpf}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">RG</label>
                      <p className="font-semibold">
                        {colaborador.documentos.rg}
                        {colaborador.documentos.rg_orgao_emissor && ` - ${colaborador.documentos.rg_orgao_emissor}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CTPS</label>
                      <p className="font-semibold">
                        {colaborador.documentos.ctps}
                        {colaborador.documentos.ctps_serie && ` - Série ${colaborador.documentos.ctps_serie}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">PIS/PASEP</label>
                      <p className="font-semibold">{colaborador.documentos.pis_pasep}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Arquivados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {colaborador.documentos_arquivos?.length ? (
                    <div className="space-y-2">
                      {colaborador.documentos_arquivos.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{doc.nome}</p>
                            <p className="text-sm text-muted-foreground">{doc.tipo}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum documento arquivado
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Benefícios */}
        <TabsContent value="beneficios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Benefícios e Vantagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Alimentação</h3>
                  <div className="flex items-center justify-between">
                    <span>Vale Refeição</span>
                    <Badge variant={colaborador.beneficios?.vale_refeicao ? 'default' : 'secondary'}>
                      {colaborador.beneficios?.vale_refeicao ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {colaborador.beneficios?.valor_vale_refeicao && (
                    <p className="text-sm text-muted-foreground">
                      Valor: {formatarMoeda(colaborador.beneficios.valor_vale_refeicao)}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Transporte</h3>
                  <div className="flex items-center justify-between">
                    <span>Vale Transporte</span>
                    <Badge variant={colaborador.beneficios?.vale_transporte ? 'default' : 'secondary'}>
                      {colaborador.beneficios?.vale_transporte ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {colaborador.beneficios?.valor_vale_transporte && (
                    <p className="text-sm text-muted-foreground">
                      Valor: {formatarMoeda(colaborador.beneficios.valor_vale_transporte)}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Saúde</h3>
                  {colaborador.beneficios?.plano_saude && (
                    <div className="flex items-center justify-between">
                      <span>Plano de Saúde</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                  )}
                  {colaborador.beneficios?.plano_odontologico && (
                    <div className="flex items-center justify-between">
                      <span>Plano Odontológico</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dependentes */}
        <TabsContent value="dependentes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dependentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span>Tem filhos menores de 14 anos?</span>
                  <Badge variant={colaborador.dependentes?.tem_filhos_menores_14 ? 'default' : 'secondary'}>
                    {colaborador.dependentes?.tem_filhos_menores_14 ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </div>

              {colaborador.dependentes?.filhos?.length ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Filhos Dependentes</h3>
                  <div className="grid gap-4">
                    {colaborador.dependentes.filhos.map((filho, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nome</label>
                            <p className="font-semibold">{filho.nome}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                            <p className="font-semibold">{formatarData(filho.data_nascimento)}</p>
                          </div>
                          {filho.cpf && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">CPF</label>
                              <p className="font-semibold">{filho.cpf}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dependente cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rescisão */}
        <TabsContent value="rescisao">
          <RescisaoContent colaborador={colaborador} />
        </TabsContent>

        {/* Dados Bancários */}
        <TabsContent value="bancarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent>
              {colaborador.dados_bancarios ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Banco</label>
                      <p className="font-semibold">{colaborador.dados_bancarios.banco}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Agência</label>
                      <p className="font-semibold">{colaborador.dados_bancarios.agencia}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Conta</label>
                      <p className="font-semibold">
                        {colaborador.dados_bancarios.conta} ({colaborador.dados_bancarios.tipo_conta})
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Chave PIX</label>
                      <p className="font-semibold">{colaborador.dados_bancarios.pix || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Salário Base</label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatarMoeda(colaborador.salario_base)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Dados bancários não informados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico e Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nova Observação Inline */}
              <AdicionarObservacaoInline 
                colaboradorId={colaborador.id}
                onObservacaoAdicionada={handleObservacaoAdicionada}
              />

              {/* Histórico */}
              <div>
                <h4 className="font-semibold mb-3">Histórico</h4>
                <ScrollArea className="h-96">
                  {historico?.length ? (
                    <div className="space-y-4">
                      {historico.map((entrada, index) => (
                        <div key={index} className="p-4 border-l-4 border-primary/20 bg-muted/20 rounded-r-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{entrada.observacao}</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatarData(entrada.data || entrada.created_at)}
                            </span>
                          </div>
                          
                          {/* Anexos/Imagens */}
                          {entrada.anexos && entrada.anexos.length > 0 && (
                            <div className="mt-3 mb-3">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {entrada.anexos.map((anexo: any, anexoIndex: number) => (
                                  <div key={anexoIndex} className="relative">
                                    <img
                                      src={anexo.url}
                                      alt={anexo.nome}
                                      className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                      onClick={() => window.open(anexo.url, '_blank')}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
                                      <div className="flex items-center gap-1">
                                        <Image className="h-3 w-3" />
                                        <span className="truncate">{anexo.nome}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Por: {entrada.usuario || 'Sistema'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma observação registrada
                    </p>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}