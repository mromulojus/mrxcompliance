import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Clock, 
  DollarSign,
  Calendar,
  MessageSquare,
  Upload,
  Eye,
  Edit,
  AlertCircle
} from 'lucide-react';
import { useProcessosData } from '@/hooks/useProcessosData';
import { ProcessoTimeline } from './ProcessoTimeline';
import { ProcessoDocumentos } from './ProcessoDocumentos';
import { ProcessoValores } from './ProcessoValores';
import type { ProcessoJudicial } from '@/types/processos';

interface ProcessoDetalhesProps {
  processo: ProcessoJudicial;
  onBack: () => void;
}

export function ProcessoDetalhes({ processo, onBack }: ProcessoDetalhesProps) {
  const { 
    historico, 
    documentos, 
    valores, 
    fetchHistorico, 
    fetchDocumentos, 
    fetchValores,
    eventos,
    fetchEventos
  } = useProcessosData();

  const [activeTab, setActiveTab] = useState('resumo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProcessoData = async () => {
      setLoading(true);
      await Promise.all([
        fetchHistorico(processo.id),
        fetchDocumentos(processo.id),
        fetchValores(processo.id),
        fetchEventos({ processo_id: processo.id })
      ]);
      setLoading(false);
    };

    loadProcessoData();
  }, [processo.id]);

  const getStatusColor = (status: string) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'suspenso': 'bg-yellow-100 text-yellow-800',
      'arquivado': 'bg-gray-100 text-gray-800',
      'transitado_julgado': 'bg-blue-100 text-blue-800',
      'baixado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularTotais = () => {
    const honorarios = valores.filter(v => v.tipo === 'honorario').reduce((sum, v) => sum + v.valor, 0);
    const despesas = valores.filter(v => v.tipo === 'despesa').reduce((sum, v) => sum + v.valor, 0);
    const valoresProcesso = valores.filter(v => v.tipo === 'valor_processo').reduce((sum, v) => sum + v.valor, 0);
    
    return { honorarios, despesas, valoresProcesso };
  };

  const totais = calcularTotais();
  const proximosEventos = eventos.filter(e => new Date(e.data_inicio) >= new Date()).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{processo.autor} x {processo.reu}</h1>
              <p className="text-muted-foreground">{processo.numero_processo}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(processo.status)}>
                {processo.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="valores">Valores</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do Processo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dados do Processo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ação</label>
                        <p className="font-medium">{processo.acao}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Número</label>
                        <p className="font-medium">{processo.numero_processo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Juízo</label>
                        <p className="font-medium">{processo.juizo || 'Não informado'}</p>
                      </div>
                      {processo.link_tribunal && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Link Tribunal</label>
                          <Button variant="link" className="p-0 h-auto" asChild>
                            <a href={processo.link_tribunal} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                              Acessar <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Réu Contratado</label>
                        <p className="font-medium">{processo.reu_contratado || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Parte Contrária</label>
                        <p className="font-medium">{processo.parte_contraria || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Situação</label>
                        <p className="font-medium">{processo.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cadastrado em</label>
                        <p className="font-medium">{new Date(processo.data_cadastro).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Autor</label>
                      <p className="font-medium">{processo.autor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Réu</label>
                      <p className="font-medium">{processo.reu}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Últimos Históricos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Últimos Históricos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historico.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum histórico encontrado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {historico.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0">
                            {item.urgente ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{item.tipo_evento}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Valores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Valores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Na Origem</p>
                      <p className="font-bold">{formatCurrency(processo.valor_origem)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Na Compra</p>
                      <p className="font-bold">{formatCurrency(processo.valor_compra)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Pensão</p>
                      <p className="font-bold">{formatCurrency(processo.valor_pensao)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Valor da Causa</p>
                      <p className="font-bold">{formatCurrency(processo.valor_causa)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      Este processo {totais.valoresProcesso > 0 ? 'gera valores a receber' : 'gera valores a pagar'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barra Lateral */}
            <div className="space-y-6">
              {/* Próximas Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proximosEventos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma atividade agendada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {proximosEventos.map((evento) => (
                        <div key={evento.id} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">{evento.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(evento.data_inicio).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full mb-3 gap-2">
                    <Upload className="h-4 w-4" />
                    Adicionar Documento
                  </Button>
                  
                  <div className="space-y-2">
                    {documentos.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{doc.nome_documento}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Honorários */}
              <Card>
                <CardHeader>
                  <CardTitle>Honorários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(totais.honorarios)}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>

              {/* Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle>Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(totais.despesas)}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historico">
          <ProcessoTimeline processoId={processo.id} />
        </TabsContent>

        <TabsContent value="documentos">
          <ProcessoDocumentos processoId={processo.id} />
        </TabsContent>

        <TabsContent value="valores">
          <ProcessoValores processoId={processo.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}