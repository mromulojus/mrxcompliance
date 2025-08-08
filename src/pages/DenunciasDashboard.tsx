import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHR } from '@/context/HRContext';
import { Denuncia, DenunciaStatus } from '@/types/denuncia';
import { AlertTriangle, MessageSquare, Calendar, User, ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function DenunciasDashboard() {
  const { denuncias, empresas, atualizarStatus, adicionarComentario } = useHR();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [novoStatus, setNovoStatus] = useState<DenunciaStatus>('RECEBIDO');
  const [activeTab, setActiveTab] = useState('nao-tratadas');

  const denunciasNaoTratadas = denuncias.filter(d => d.status === 'RECEBIDO');
  const denunciasEmAndamento = denuncias.filter(d => ['EM_ANALISE', 'INVESTIGACAO'].includes(d.status));
  const denunciasConcluidas = denuncias.filter(d => d.status === 'CONCLUIDO');

  const statusLabels = {
    RECEBIDO: 'Recebidas',
    EM_ANALISE: 'Em Análise',
    INVESTIGACAO: 'Em Investigação',
    CONCLUIDO: 'Concluídas'
  };

  const statusColors = {
    RECEBIDO: 'bg-red-100 text-red-800',
    EM_ANALISE: 'bg-yellow-100 text-yellow-800',
    INVESTIGACAO: 'bg-blue-100 text-blue-800',
    CONCLUIDO: 'bg-green-100 text-green-800'
  };

  const tipoLabels = {
    DISCRIMINACAO: 'Discriminação',
    ASSEDIO_MORAL: 'Assédio Moral',
    CORRUPCAO: 'Corrupção',
    VIOLACAO_TRABALHISTA: 'Violação Trabalhista',
    OUTRO: 'Outro'
  };

  const handleAtualizarStatus = () => {
    if (!selectedDenuncia) return;
    
    atualizarStatus(selectedDenuncia.id, novoStatus);
    setSelectedDenuncia({ ...selectedDenuncia, status: novoStatus });
    
    toast({
      title: 'Status atualizado',
      description: `Denúncia ${selectedDenuncia.protocolo} foi marcada como ${statusLabels[novoStatus].toLowerCase()}.`
    });
  };

  const handleAdicionarComentario = () => {
    if (!selectedDenuncia || !novoComentario.trim()) return;
    
    adicionarComentario(selectedDenuncia.id, 'Administrador', novoComentario);
    setNovoComentario('');
    
    const updatedDenuncia = { 
      ...selectedDenuncia, 
      comentarios: [...selectedDenuncia.comentarios, {
        id: Date.now().toString(),
        denunciaId: selectedDenuncia.id,
        autor: 'Administrador',
        mensagem: novoComentario,
        createdAt: new Date().toISOString()
      }]
    };
    setSelectedDenuncia(updatedDenuncia);
    
    toast({
      title: 'Comentário adicionado',
      description: 'Seu comentário foi registrado na denúncia.'
    });
  };

  const getEmpresaNome = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nome : 'Empresa não encontrada';
  };

  const renderDenunciasList = (denunciasLista: Denuncia[], titulo: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {titulo} ({denunciasLista.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {denunciasLista.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma denúncia nesta categoria
          </p>
        ) : (
          <div className="space-y-4">
            {denunciasLista.map((denuncia) => (
              <div key={denuncia.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {denuncia.protocolo}
                    </code>
                    <Badge className={statusColors[denuncia.status]}>
                      {statusLabels[denuncia.status]}
                    </Badge>
                    <Badge variant="outline">
                      {tipoLabels[denuncia.tipo]}
                    </Badge>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedDenuncia(denuncia)}>
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Denúncia {selectedDenuncia?.protocolo}</DialogTitle>
                      </DialogHeader>
                      {selectedDenuncia && (
                        <div className="space-y-4">
                          {/* Informações Básicas */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Empresa:</label>
                              <p>{getEmpresaNome(selectedDenuncia.empresaId)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Tipo:</label>
                              <p>{tipoLabels[selectedDenuncia.tipo]}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status:</label>
                              <Badge className={statusColors[selectedDenuncia.status]}>
                                {statusLabels[selectedDenuncia.status]}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Data:</label>
                              <p>{formatDistanceToNow(new Date(selectedDenuncia.createdAt), { addSuffix: true, locale: ptBR })}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Identificado:</label>
                              <p>{selectedDenuncia.identificado ? `Sim - ${selectedDenuncia.nome}` : 'Anônimo'}</p>
                            </div>
                            {selectedDenuncia.setor && (
                              <div>
                                <label className="text-sm font-medium">Setor:</label>
                                <p>{selectedDenuncia.setor}</p>
                              </div>
                            )}
                          </div>

                          {/* Descrição */}
                          <div>
                            <label className="text-sm font-medium">Descrição:</label>
                            <p className="text-sm bg-muted p-3 rounded mt-1">{selectedDenuncia.descricao}</p>
                          </div>

                          {selectedDenuncia.evidenciasDescricao && (
                            <div>
                              <label className="text-sm font-medium">Evidências:</label>
                              <p className="text-sm bg-muted p-3 rounded mt-1">{selectedDenuncia.evidenciasDescricao}</p>
                            </div>
                          )}

                          {selectedDenuncia.sugestao && (
                            <div>
                              <label className="text-sm font-medium">Sugestão:</label>
                              <p className="text-sm bg-muted p-3 rounded mt-1">{selectedDenuncia.sugestao}</p>
                            </div>
                          )}

                          {/* Atualizar Status */}
                          <Separator />
                          <div className="space-y-3">
                            <label className="text-sm font-medium">Atualizar Status:</label>
                            <div className="flex gap-2">
                              <Select value={novoStatus} onValueChange={(value) => setNovoStatus(value as DenunciaStatus)}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="RECEBIDO">Recebido</SelectItem>
                                  <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                                  <SelectItem value="INVESTIGACAO">Em Investigação</SelectItem>
                                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button onClick={handleAtualizarStatus}>
                                Atualizar
                              </Button>
                            </div>
                          </div>

                          {/* Adicionar Comentário */}
                          <div className="space-y-3">
                            <label className="text-sm font-medium">Adicionar Comentário:</label>
                            <Textarea
                              value={novoComentario}
                              onChange={(e) => setNovoComentario(e.target.value)}
                              placeholder="Digite seu comentário..."
                              rows={3}
                            />
                            <Button onClick={handleAdicionarComentario} disabled={!novoComentario.trim()}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Adicionar Comentário
                            </Button>
                          </div>

                          {/* Histórico de Comentários */}
                          {selectedDenuncia.comentarios.length > 0 && (
                            <div className="space-y-3">
                              <Separator />
                              <label className="text-sm font-medium">Histórico de Comentários:</label>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedDenuncia.comentarios.map((comentario) => (
                                  <div key={comentario.id} className="bg-muted p-3 rounded text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="h-3 w-3" />
                                      <span className="font-medium">{comentario.autor}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comentario.createdAt), { addSuffix: true, locale: ptBR })}
                                      </span>
                                    </div>
                                    <p>{comentario.mensagem}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Empresa:</strong> {getEmpresaNome(denuncia.empresaId)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(denuncia.createdAt), { addSuffix: true, locale: ptBR })}
                  </div>
                  {denuncia.identificado && denuncia.nome && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {denuncia.nome}
                    </div>
                  )}
                  {denuncia.comentarios.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {denuncia.comentarios.length} comentário(s)
                    </div>
                  )}
                </div>
                
                <p className="text-sm line-clamp-2">{denuncia.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Dashboard de Denúncias</h1>
                <p className="text-muted-foreground">Gerencie todas as denúncias do sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Denúncias</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{denuncias.length}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Não Tratadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{denunciasNaoTratadas.length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Em Andamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{denunciasEmAndamento.length}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Concluídas</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{denunciasConcluidas.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Denúncias */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nao-tratadas">Não Tratadas ({denunciasNaoTratadas.length})</TabsTrigger>
            <TabsTrigger value="andamento">Em Andamento ({denunciasEmAndamento.length})</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas ({denunciasConcluidas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="nao-tratadas" className="space-y-6">
            {renderDenunciasList(denunciasNaoTratadas, 'Denúncias Não Tratadas')}
          </TabsContent>

          <TabsContent value="andamento" className="space-y-6">
            {renderDenunciasList(denunciasEmAndamento, 'Denúncias em Andamento')}
          </TabsContent>

          <TabsContent value="concluidas" className="space-y-6">
            {renderDenunciasList(denunciasConcluidas, 'Denúncias Concluídas')}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}