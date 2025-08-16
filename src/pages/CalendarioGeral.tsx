import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { auditEvents } from "@/components/audit/AuditDashboard";
import { useHR } from "@/context/HRContext";
import { useDebtoData } from "@/hooks/useDebtoData";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  module: "audit" | "divida" | "denuncia";
  link: string;
}

export default function CalendarioGeral() {
  const navigate = useNavigate();
  const { denuncias } = useHR();
  const { dividas } = useDebtoData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const events: CalendarEvent[] = useMemo(() => {
    const audit = auditEvents.map((e) => ({
      id: `audit-${e.id}`,
      title: e.title,
      date: e.date,
      module: "audit" as const,
      link: "/dashboard",
    }));

    const debts = dividas.map((d) => ({
      id: `divida-${d.id}`,
      title: `Dívida ${d.origem_divida}`,
      date: new Date(d.data_vencimento),
      module: "divida" as const,
      link: `/devedor/${d.devedor_id}`,
    }));

    const reports = denuncias.map((d) => ({
      id: `denuncia-${d.id}`,
      title: `Denúncia ${d.protocolo}`,
      date: new Date(d.createdAt),
      module: "denuncia" as const,
      link: `/denuncias/dashboard`,
    }));

    return [...audit, ...debts, ...reports];
  }, [dividas, denuncias]);

  const modifiers = useMemo(
    () => ({ highlight: events.map((e) => e.date) }),
    [events]
  );

  const filteredEvents = events.filter((e) => {
    const sameDay = selectedDate
      ? e.date.toDateString() === selectedDate.toDateString()
      : true;
    const moduleMatch = moduleFilter === "all" || e.module === moduleFilter;
    return sameDay && moduleMatch;
  });

  const moduleLabels: Record<CalendarEvent["module"], string> = {
    audit: "Auditoria",
    divida: "Dívida",
    denuncia: "Denúncia",
  };

  const moduleBadgeStyles: Record<CalendarEvent["module"], string> = {
    audit: "bg-blue-100 text-blue-800",
    divida: "bg-red-100 text-red-800",
    denuncia: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Calendário Geral</CardTitle>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os módulos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="audit">Auditoria</SelectItem>
              <SelectItem value="divida">Dívidas</SelectItem>
              <SelectItem value="denuncia">Denúncias</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersClassNames={{ highlight: "bg-primary text-primary-foreground" }}
            className="rounded-md border"
          />
          <div className="flex-1 space-y-2">
            {filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum evento para esta data.
              </p>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(event.link)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 flex items-center justify-between"
                >
                  <span>{event.title}</span>
                  <Badge className={moduleBadgeStyles[event.module]}>
                    {moduleLabels[event.module]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

