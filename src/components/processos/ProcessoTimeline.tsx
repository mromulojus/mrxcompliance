import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Plus, 
  AlertCircle, 
  FileText, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useProcessosData } from '@/hooks/useProcessosData';

interface ProcessoTimelineProps {
  processoId: string;
}

export function ProcessoTimeline({ processoId }: ProcessoTimelineProps) {
  const { historico, fetchHistorico } = useProcessosData();

  useEffect(() => {
    if (processoId) {
      fetchHistorico(processoId);
    }
  }, [processoId]);

  const getEventIcon = (tipoEvento: string) => {
    const iconMap: Record<string, any> = {
      'peticao': FileText,
      'decisao': AlertCircle,
      'audiencia': Calendar,
      'prazo': Clock,
      'comentario': MessageSquare,
      'default': Clock
    };
    
    const IconComponent = iconMap[tipoEvento.toLowerCase()] || iconMap.default;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEventColor = (tipoEvento: string, urgente: boolean) => {
    if (urgente) return 'bg-red-100 border-red-200 text-red-800';
    
    const colorMap: Record<string, string> = {
      'peticao': 'bg-blue-100 border-blue-200 text-blue-800',
      'decisao': 'bg-purple-100 border-purple-200 text-purple-800',
      'audiencia': 'bg-green-100 border-green-200 text-green-800',
      'prazo': 'bg-yellow-100 border-yellow-200 text-yellow-800',
      'comentario': 'bg-gray-100 border-gray-200 text-gray-800',
    };
    
    return colorMap[tipoEvento.toLowerCase()] || 'bg-gray-100 border-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Timeline do Processo</h3>
          <p className="text-sm text-muted-foreground">
            Histórico completo de eventos e movimentações
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Evento
        </Button>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {historico.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum histórico encontrado</h4>
              <p className="text-muted-foreground mb-4">
                Este processo ainda não possui eventos registrados
              </p>
              <Button variant="outline">
                Adicionar Primeiro Evento
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical da timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
              
              <div className="space-y-6">
                {historico.map((item, index) => (
                  <div key={item.id} className="relative flex gap-6">
                    {/* Ícone do evento */}
                    <div className={`
                      flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center bg-background z-10
                      ${getEventColor(item.tipo_evento, item.urgente)}
                    `}>
                      {getEventIcon(item.tipo_evento)}
                    </div>
                    
                    {/* Conteúdo do evento */}
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-primary/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {item.tipo_evento}
                                {item.urgente && (
                                  <Badge variant="destructive" className="text-xs">
                                    Urgente
                                  </Badge>
                                )}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(item.data_evento).toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm mb-3">{item.descricao}</p>
                          
                          {item.detalhes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                <strong>Detalhes:</strong> {item.detalhes}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                Registrado em {new Date(item.created_at).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm">
                                Anexar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar Timeline
        </Button>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Agendar Evento
        </Button>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Adicionar Comentário
        </Button>
      </div>
    </div>
  );
}