import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { format } from "date-fns";

const Calendario = () => {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const { eventos, fetchEventos, enviarLembrete } = useCalendarEvents();

  useEffect(() => {
    fetchEventos();
  }, []);

  const eventosDoDia = eventos.filter(
    (ev) => ev.date === format(dataSelecionada, "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Vencimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={dataSelecionada}
            onSelect={(date) => date && setDataSelecionada(date)}
            className="rounded-md border pointer-events-auto"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eventos do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {eventosDoDia.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum evento para esta data.
            </p>
          ) : (
            <div className="space-y-2">
              {eventosDoDia.map((ev: CalendarEvent) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{ev.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ev.date), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => enviarLembrete(ev)}>
                    Enviar Lembrete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendario;

