import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  List,
  Grid3X3,
  Filter,
  Check,
  X,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addHours, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProcessosData } from '@/hooks/useProcessosData';
import { FormEvento } from './FormEvento';
import { useCalendarioUnificado, TIPOS_EVENTO_LABELS, CORES_POR_TIPO, EventoUnificado } from '@/hooks/useCalendarioUnificado';
import { FiltrosCalendario } from '@/components/calendario/FiltrosCalendario';

interface CalendarioEventosProps {
  empresaId: string | null;
}

// Tipo helper para eventos mistos
type EventoMisto = EventoUnificado | {
  id: string;
  empresa_id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  tipo: string;
  local?: string;
  participantes?: string[];
  processo_id?: string;
  divida_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Campos mapeados para compatibilidade
  tipo_evento: string;
  data_evento: string;
  modulo_origem: string;
};

const CalendarioEventos: React.FC<CalendarioEventosProps> = ({ empresaId }) => {
  // Hooks do sistema unificado
  const {
    eventos: eventosUnificados,
    loading: loadingUnificado,
    filtros,
    estatisticas,
    aplicarFiltros,
    limparFiltros,
    marcarComoConcluido,
    getEventosDoDia,
    hasEventoNoDia
  } = useCalendarioUnificado();

  // Hooks antigos (para compatibilidade com eventos manuais)
  const { eventos: eventosLegado, fetchEventos, adicionarEvento } = useProcessosData();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<number>(9);
  const [showEventForm, setShowEventForm] = useState(false);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  // Aplicar filtros por empresa no sistema unificado
  React.useEffect(() => {
    if (empresaId && empresaId !== 'all') {
      aplicarFiltros({ ...filtros, empresa_id: empresaId });
    } else if (empresaId === 'all') {
      const filtrosSemEmpresa = { ...filtros };
      delete filtrosSemEmpresa.empresa_id;
      aplicarFiltros(filtrosSemEmpresa);
    }
  }, [empresaId]);

  // Filtrar eventos legados por empresa (para compatibilidade)
  const eventosFiltrados = useMemo(() => {
    if (!empresaId || empresaId === 'all') return eventosLegado;
    return eventosLegado.filter(evento => evento.empresa_id === empresaId);
  }, [eventosLegado, empresaId]);

  const getTipoColor = (tipo: string) => {
    const corInfo = CORES_POR_TIPO[tipo as keyof typeof CORES_POR_TIPO];
    if (corInfo) {
      return `${corInfo.bg} ${corInfo.text} border-current`;
    }
    
    // Fallback para tipos legados
    switch (tipo) {
      case 'audiencia':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'prazo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reuniao':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vencimento':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'intimacao':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'peticao':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'decisao':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função helper para verificar se é evento unificado
  const isEventoUnificado = (evento: EventoMisto): evento is EventoUnificado => {
    return 'tipo_evento' in evento && !('tipo' in evento);
  };

  // Funções adaptadas para eventos unificados
  const getEventosDoDiaUnificado = (date: Date): EventoMisto[] => {
    const eventosUnif = getEventosDoDia(date);
    const eventosLeg = eventosFiltrados
      .filter(evento => isSameDay(parseISO(evento.data_inicio), date))
      .map(e => ({
        ...e,
        tipo_evento: e.tipo,
        data_evento: e.data_inicio,
        modulo_origem: 'eventos'
      }));
    
    return [...eventosUnif, ...eventosLeg];
  };

  const hasEventoNoDiaUnificado = (date: Date) => {
    return hasEventoNoDia(date) || eventosFiltrados.some(evento => 
      isSameDay(parseISO(evento.data_inicio), date)
    );
  };

  const proximosEventos = useMemo(() => {
    const hoje = new Date();
    const eventosUnif = eventosUnificados
      .filter(evento => !isBefore(parseISO(evento.data_evento), hoje))
      .sort((a, b) => parseISO(a.data_evento).getTime() - parseISO(b.data_evento).getTime())
      .slice(0, 5);
    
    const eventosLeg = eventosFiltrados
      .filter(evento => !isBefore(parseISO(evento.data_inicio), hoje))
      .sort((a, b) => parseISO(a.data_inicio).getTime() - parseISO(b.data_inicio).getTime())
      .slice(0, 5)
      .map(e => ({
        ...e,
        tipo_evento: e.tipo,
        data_evento: e.data_inicio,
        modulo_origem: 'eventos'
      }));
    
    return [...eventosUnif, ...eventosLeg].slice(0, 5);
  }, [eventosUnificados, eventosFiltrados]);

  const weekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const handleCreateAt = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedTime(hour);
    setShowEventForm(true);
  };

  // Função helper para obter dados do evento de forma segura
  const getEventoData = (evento: EventoMisto) => ({
    id: evento.id,
    titulo: evento.titulo,
    descricao: evento.descricao,
    tipo: isEventoUnificado(evento) ? evento.tipo_evento : evento.tipo,
    tipoEvento: isEventoUnificado(evento) ? evento.tipo_evento : evento.tipo_evento,
    dataEvento: isEventoUnificado(evento) ? evento.data_evento : evento.data_evento,
    dataInicio: isEventoUnificado(evento) ? evento.data_evento : evento.data_inicio,
    dataFim: evento.data_fim,
    moduloOrigem: isEventoUnificado(evento) ? evento.modulo_origem : 'eventos',
    local: isEventoUnificado(evento) ? undefined : evento.local,
    participantes: isEventoUnificado(evento) ? undefined : evento.participantes,
    status: isEventoUnificado(evento) ? evento.status : 'pendente',
    prioridade: isEventoUnificado(evento) ? evento.prioridade : undefined,
    corEtiqueta: isEventoUnificado(evento) ? evento.cor_etiqueta : '#6B7280'
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário Unificado
            <Badge variant="secondary" className="ml-2">
              {eventosUnificados.length} eventos
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
              className="flex items-center gap-2"
            >
              {filtrosVisiveis ? <EyeOff className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              Filtros
            </Button>
            <Button 
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Evento
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Painel de Filtros Colapsível */}
          <Collapsible open={filtrosVisiveis} onOpenChange={setFiltrosVisiveis}>
            <CollapsibleContent className="mb-6">
              <FiltrosCalendario 
                filtros={filtros}
                onFiltrosChange={aplicarFiltros}
                onLimparFiltros={limparFiltros}
                estatisticas={estatisticas}
              />
            </CollapsibleContent>
          </Collapsible>

          <Tabs defaultValue="month" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="month" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Mês
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="day" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Dia
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
              <div className="xl:col-span-3">
                {/* Visualização Mensal */}
                <TabsContent value="month">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Calendar
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                      modifiers={{
                        hasEvents: (date) => hasEventoNoDiaUnificado(date)
                      }}
                      modifiersStyles={{
                        hasEvents: { 
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '50%',
                          fontWeight: 'bold'
                        }
                      }}
                    />

                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <h3 className="font-medium text-lg">
                          Eventos de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        </h3>
                        {getEventosDoDiaUnificado(selectedDate).length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            Nenhum evento neste dia
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {getEventosDoDiaUnificado(selectedDate).map((evento) => {
                              const eventoData = getEventoData(evento);
                              return (
                                <Card key={evento.id} className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge className={getTipoColor(eventoData.tipoEvento)}>
                                          {TIPOS_EVENTO_LABELS[eventoData.tipoEvento as keyof typeof TIPOS_EVENTO_LABELS] || eventoData.tipo}
                                        </Badge>
                                        <span className="font-medium">{eventoData.titulo}</span>
                                        {eventoData.moduloOrigem && (
                                          <Badge variant="outline" className="text-xs">
                                            {eventoData.moduloOrigem}
                                          </Badge>
                                        )}
                                      </div>
                                      {eventoData.descricao && (
                                        <p className="text-sm text-muted-foreground">{eventoData.descricao}</p>
                                      )}
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {format(parseISO(eventoData.dataEvento), 'HH:mm')}
                                          {eventoData.dataFim && (
                                            <span> - {format(parseISO(eventoData.dataFim), 'HH:mm')}</span>
                                          )}
                                        </div>
                                        {eventoData.local && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {eventoData.local}
                                          </div>
                                        )}
                                        {eventoData.participantes && eventoData.participantes.length > 0 && (
                                          <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {eventoData.participantes.length} participantes
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {eventoData.status === 'pendente' && isEventoUnificado(evento) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => marcarComoConcluido(evento.id)}
                                        className="ml-2"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Visualização Semanal */}
                <TabsContent value="week">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Visualização Semanal</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-8 gap-2 min-h-96">
                        <div className="text-xs font-medium text-muted-foreground">Hora</div>
                        {weekDays(selectedDate).map((day) => (
                          <div key={day.toISOString()} className="text-xs font-medium text-center">
                            {format(day, 'EEE dd', { locale: ptBR })}
                          </div>
                        ))}
                        
                        {Array.from({ length: 24 }, (_, hour) => (
                          <React.Fragment key={hour}>
                            <div className="text-xs text-muted-foreground py-2">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            {weekDays(selectedDate).map((day) => (
                              <div
                                key={`${day.toISOString()}-${hour}`}
                                className="min-h-8 border border-muted hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleCreateAt(day, hour)}
                              >
                                {/* Renderizar eventos do horário */}
                                {getEventosDoDiaUnificado(day)
                                  .filter(evento => {
                                    const eventoData = getEventoData(evento);
                                    const eventoHour = parseISO(eventoData.dataEvento).getHours();
                                    return eventoHour === hour;
                                  })
                                  .map(evento => {
                                    const eventoData = getEventoData(evento);
                                    return (
                                      <div
                                        key={evento.id}
                                        className="text-xs p-1 m-1 rounded truncate text-white"
                                        style={{ backgroundColor: eventoData.corEtiqueta }}
                                      >
                                        {eventoData.titulo}
                                      </div>
                                    );
                                  })
                                }
                              </div>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Visualização Diária */}
                <TabsContent value="day">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Array.from({ length: 24 }, (_, hour) => (
                          <div
                            key={hour}
                            className="flex items-center gap-4 p-2 border rounded hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleCreateAt(selectedDate, hour)}
                          >
                            <div className="w-16 text-sm font-mono">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="flex-1">
                              {getEventosDoDiaUnificado(selectedDate)
                                .filter(evento => {
                                  const eventoData = getEventoData(evento);
                                  const eventoHour = parseISO(eventoData.dataEvento).getHours();
                                  return eventoHour === hour;
                                })
                                .map(evento => {
                                  const eventoData = getEventoData(evento);
                                  return (
                                    <Badge
                                      key={evento.id}
                                      className={`mr-2 ${getTipoColor(eventoData.tipoEvento)}`}
                                    >
                                      {eventoData.titulo}
                                    </Badge>
                                  );
                                })
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Visualização de Lista */}
                <TabsContent value="list">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lista de Eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {eventosUnificados.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Nenhum evento encontrado
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {eventosUnificados
                            .sort((a, b) => parseISO(a.data_evento).getTime() - parseISO(b.data_evento).getTime())
                            .map((evento) => (
                              <Card key={evento.id} className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getTipoColor(evento.tipo_evento)}>
                                        {TIPOS_EVENTO_LABELS[evento.tipo_evento as keyof typeof TIPOS_EVENTO_LABELS]}
                                      </Badge>
                                      <h4 className="font-semibold">{evento.titulo}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {evento.modulo_origem}
                                      </Badge>
                                    </div>
                                    {evento.descricao && (
                                      <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        {format(parseISO(evento.data_evento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                      </div>
                                      {evento.prioridade && (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            evento.prioridade === 'alta' ? 'border-red-300 text-red-700' :
                                            evento.prioridade === 'media' ? 'border-yellow-300 text-yellow-700' :
                                            'border-green-300 text-green-700'
                                          }`}
                                        >
                                          {evento.prioridade}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {evento.status === 'pendente' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => marcarComoConcluido(evento.id)}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Concluir
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            ))
                          }
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              {/* Sidebar com próximos eventos */}
              <div className="xl:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Eventos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {proximosEventos.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nenhum evento próximo</p>
                      ) : (
                        proximosEventos.map((evento) => {
                          const eventoData = getEventoData(evento);
                          return (
                            <Card key={evento.id} className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={getTipoColor(eventoData.tipoEvento)}>
                                    {TIPOS_EVENTO_LABELS[eventoData.tipoEvento as keyof typeof TIPOS_EVENTO_LABELS] || eventoData.tipo}
                                  </Badge>
                                  <span className="font-medium text-sm">{eventoData.titulo}</span>
                                  {eventoData.moduloOrigem && (
                                    <Badge variant="outline" className="text-xs">
                                      {eventoData.moduloOrigem}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(parseISO(eventoData.dataEvento), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                  </div>
                                  {eventoData.prioridade && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        eventoData.prioridade === 'alta' ? 'border-red-300 text-red-700' :
                                        eventoData.prioridade === 'media' ? 'border-yellow-300 text-yellow-700' :
                                        'border-green-300 text-green-700'
                                      }`}
                                    >
                                      {eventoData.prioridade}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal do formulário de eventos */}
      {showEventForm && empresaId && (
        <FormEvento
          empresaId={empresaId}
          dataInicial={selectedDate}
          horaInicial={selectedTime.toString()}
          onClose={() => setShowEventForm(false)}
          onSuccess={() => {
            setShowEventForm(false);
            fetchEventos();
          }}
        />
      )}
    </div>
  );
};

export { CalendarioEventos };