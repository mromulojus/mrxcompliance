import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { useProcessosData } from '@/hooks/useProcessosData';
import { FormEvento } from './FormEvento';
import type { Evento } from '@/types/processos';

interface CalendarioEventosProps {
  empresaId: string;
}

export function CalendarioEventos({ empresaId }: CalendarioEventosProps) {
  const { eventos, fetchEventos } = useProcessosData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  useEffect(() => {
    if (empresaId) {
      fetchEventos({ empresa_id: empresaId });
    }
  }, [empresaId]);

  const getTipoColor = (tipo: string) => {
    const colors = {
      'audiencia': 'bg-red-100 text-red-800',
      'prazo': 'bg-yellow-100 text-yellow-800',
      'reuniao': 'bg-blue-100 text-blue-800',
      'vencimento': 'bg-orange-100 text-orange-800',
      'intimacao': 'bg-purple-100 text-purple-800',
      'peticao': 'bg-green-100 text-green-800',
      'decisao': 'bg-indigo-100 text-indigo-800',
      'outro': 'bg-gray-100 text-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEventosDoMes = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return eventos.filter(evento => {
      const eventoDate = new Date(evento.data_inicio);
      return eventoDate.getFullYear() === year && eventoDate.getMonth() === month;
    });
  };

  const getEventosDoDia = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventos.filter(evento => 
      evento.data_inicio.split('T')[0] === dateStr
    ).sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
  };

  const hasEventoNoDia = (date: Date) => {
    return getEventosDoDia(date).length > 0;
  };

  const eventosDoDia = getEventosDoDia(selectedDate);
  const proximosEventos = eventos
    .filter(e => new Date(e.data_inicio) >= new Date())
    .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Calendário de Eventos</h2>
          <p className="text-muted-foreground">
            Gerencie audiências, prazos e compromissos jurídicos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate.toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiers={{
                  hasEvento: (date) => hasEventoNoDia(date)
                }}
                modifiersStyles={{
                  hasEvento: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'white',
                    borderRadius: '50%'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Eventos do Dia Selecionado */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Eventos de {selectedDate.toLocaleDateString('pt-BR')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventosDoDia.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum evento agendado para este dia
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setShowForm(true)}
                  >
                    Agendar Evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventosDoDia.map((evento) => (
                    <Card 
                      key={evento.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedEvento(evento)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          {evento.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {evento.descricao}
                            </p>
                          )}
                        </div>
                        <Badge className={getTipoColor(evento.tipo)}>
                          {evento.tipo}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(evento.data_inicio).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {evento.data_fim && (
                            <span>
                              {' - '}
                              {new Date(evento.data_fim).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        
                        {evento.local && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {evento.local}
                          </div>
                        )}
                        
                        {evento.participantes && evento.participantes.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {evento.participantes.length} participante(s)
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Barra Lateral */}
        <div className="space-y-6">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {proximosEventos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum evento futuro agendado
                </p>
              ) : (
                <div className="space-y-3">
                  {proximosEventos.map((evento) => (
                    <div 
                      key={evento.id} 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEvento(evento)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{evento.titulo}</h5>
                        <Badge className={getTipoColor(evento.tipo)} variant="outline">
                          {evento.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(evento.data_inicio).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(evento.data_inicio).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {evento.local && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {evento.local}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo do Mês */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  getEventosDoMes(selectedDate).reduce((acc, evento) => {
                    acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([tipo, quantidade]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <Badge className={getTipoColor(tipo)} variant="outline">
                      {tipo}
                    </Badge>
                    <span className="font-medium">{quantidade}</span>
                  </div>
                ))}
                
                {getEventosDoMes(selectedDate).length === 0 && (
                  <p className="text-muted-foreground text-center py-2">
                    Nenhum evento neste mês
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal do Formulário */}
      {showForm && (
        <FormEvento
          empresaId={empresaId}
          dataInicial={selectedDate}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchEventos({ empresa_id: empresaId });
          }}
        />
      )}

      {/* Modal de Detalhes do Evento */}
      {selectedEvento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{selectedEvento.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className={getTipoColor(selectedEvento.tipo)}>
                  {selectedEvento.tipo}
                </Badge>
              </div>
              
              {selectedEvento.descricao && (
                <p className="text-sm">{selectedEvento.descricao}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(selectedEvento.data_inicio).toLocaleString('pt-BR')}
                    {selectedEvento.data_fim && (
                      <span>
                        {' até '}
                        {new Date(selectedEvento.data_fim).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </span>
                </div>
                
                {selectedEvento.local && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvento.local}</span>
                  </div>
                )}
                
                {selectedEvento.participantes && selectedEvento.participantes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{selectedEvento.participantes.join(', ')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEvento(null)}>
                  Fechar
                </Button>
                <Button variant="outline">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}