import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Calendar, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

export default function ConsultaDenuncia() {
  const [protocolo, setProtocolo] = useState('');
  const [denunciaEncontrada, setDenunciaEncontrada] = useState<any>(null);
  const [pesquisado, setPesquisado] = useState(false);

  const statusLabels = {
    RECEBIDO: 'Recebida',
    EM_ANALISE: 'Em Análise',
    INVESTIGACAO: 'Em Investigação',
    CONCLUIDO: 'Concluída'
  };

  const statusColors = {
    RECEBIDO: 'bg-red-100 text-red-800',
    EM_ANALISE: 'bg-yellow-100 text-yellow-800',
    INVESTIGACAO: 'bg-blue-100 text-blue-800',
    CONCLUIDO: 'bg-green-100 text-green-800'
  };

  const handlePesquisar = async () => {
    if (!protocolo.trim()) return;

    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('protocolo, status, created_at, updated_at')
        .eq('protocolo', protocolo.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setDenunciaEncontrada(null);
      } else {
        setDenunciaEncontrada({
          protocolo: (data as any).protocolo,
          status: (data as any).status,
          createdAt: (data as any).created_at,
          updatedAt: (data as any).updated_at,
          comentarios: [] as any[],
        });
      }
    } catch (e) {
      console.error('Erro ao buscar denúncia por protocolo:', e);
      setDenunciaEncontrada(null);
    } finally {
      setPesquisado(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePesquisar();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-16 flex items-center justify-center">
              <img 
                src="/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png" 
                alt="MRxCompliance Logo" 
                className="h-16 w-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Consultar Denúncia</CardTitle>
            <p className="text-muted-foreground">
              Digite o protocolo da sua denúncia para acompanhar o andamento
            </p>
          </CardHeader>
        </Card>

        {/* Formulário de Pesquisa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar por Protocolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="protocolo">Protocolo da Denúncia</Label>
              <div className="flex gap-2">
                <Input
                  id="protocolo"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: MRX-123456-ABCD"
                  className="font-mono"
                />
                <Button onClick={handlePesquisar} disabled={!protocolo.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Pesquisar
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• O protocolo foi fornecido quando você registrou a denúncia</p>
              <p>• Formato: MRX-XXXXXX-XXXX</p>
              <p>• A pesquisa é case-sensitive</p>
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Pesquisa */}
        {pesquisado && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Pesquisa</CardTitle>
            </CardHeader>
            <CardContent>
              {denunciaEncontrada ? (
                <div className="space-y-6">
                  {/* Status Atual */}
                  <div className="text-center">
                    <Badge className={`${statusColors[denunciaEncontrada.status]} text-lg px-4 py-2`}>
                      {statusLabels[denunciaEncontrada.status]}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Status atual da denúncia {denunciaEncontrada.protocolo}
                    </p>
                  </div>

                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Protocolo:</Label>
                      <div className="font-mono text-lg bg-muted p-2 rounded">
                        {denunciaEncontrada.protocolo}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Registro:</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(new Date(denunciaEncontrada.createdAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Última Atualização:</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(new Date(denunciaEncontrada.updatedAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Timeline de Status */}
                  <div className="space-y-3">
                    <Label>Progresso da Denúncia:</Label>
                    <div className="space-y-2">
                      {[
                        { status: 'RECEBIDO', label: 'Denúncia Recebida', ativo: true },
                        { status: 'EM_ANALISE', label: 'Em Análise', ativo: ['EM_ANALISE', 'INVESTIGACAO', 'CONCLUIDO'].includes(denunciaEncontrada.status) },
                        { status: 'INVESTIGACAO', label: 'Em Investigação', ativo: ['INVESTIGACAO', 'CONCLUIDO'].includes(denunciaEncontrada.status) },
                        { status: 'CONCLUIDO', label: 'Concluída', ativo: denunciaEncontrada.status === 'CONCLUIDO' }
                      ].map((etapa, index) => (
                        <div key={etapa.status} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${
                            etapa.ativo ? 'bg-primary' : 'bg-muted'
                          } ${denunciaEncontrada.status === etapa.status ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                          <span className={etapa.ativo ? 'font-medium' : 'text-muted-foreground'}>
                            {etapa.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comentários Públicos */}
                  {denunciaEncontrada.comentarios.length > 0 && (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Atualizações ({denunciaEncontrada.comentarios.length})
                      </Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {denunciaEncontrada.comentarios.map((comentario: any) => (
                          <div key={comentario.id} className="bg-muted p-3 rounded text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{comentario.autor}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comentario.createdAt), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            </div>
                            <p>{comentario.mensagem}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Próximos Passos */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Próximos Passos:</h4>
                    <div className="text-sm text-blue-800">
                      {denunciaEncontrada.status === 'RECEBIDO' && (
                        <p>Sua denúncia foi recebida e será analisada em breve. Você receberá atualizações conforme o progresso.</p>
                      )}
                      {denunciaEncontrada.status === 'EM_ANALISE' && (
                        <p>Sua denúncia está sendo analisada pela equipe responsável. Informações adicionais podem ser solicitadas.</p>
                      )}
                      {denunciaEncontrada.status === 'INVESTIGACAO' && (
                        <p>Uma investigação formal foi iniciada. O processo seguirá os protocolos internos da empresa.</p>
                      )}
                      {denunciaEncontrada.status === 'CONCLUIDO' && (
                        <p>A investigação foi concluída. As medidas cabíveis foram tomadas conforme as políticas da empresa.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Denúncia não encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Não foi possível encontrar uma denúncia com o protocolo "{protocolo}".
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Verifique se o protocolo foi digitado corretamente</p>
                    <p>• Certifique-se de incluir os hífens (MRX-XXXXXX-XXXX)</p>
                    <p>• O protocolo é sensível a maiúsculas e minúsculas</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}