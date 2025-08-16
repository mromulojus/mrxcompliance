import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface AuditEvent {
  id: string;
  title: string;
  type: "document" | "training" | "visit" | "meeting";
  date: Date;
  status: "scheduled" | "completed" | "overdue";
  responsible: string;
}

interface AuditEventsContextValue {
  events: AuditEvent[];
  addEvent: (event: Omit<AuditEvent, "id">) => void;
  updateEvent: (id: string, event: Omit<AuditEvent, "id">) => void;
  removeEvent: (id: string) => void;
  syncWithGoogleCalendar: () => Promise<void>;
}

const AuditEventsContext = createContext<AuditEventsContextValue | undefined>(
  undefined
);

const defaultEvents: AuditEvent[] = [
  {
    id: "1",
    title: "Vencimento ISO 9001",
    type: "document",
    date: new Date(2024, 1, 20),
    status: "scheduled",
    responsible: "João Silva",
  },
  {
    id: "2",
    title: "Treinamento LGPD",
    type: "training",
    date: new Date(2024, 1, 25),
    status: "scheduled",
    responsible: "Maria Santos",
  },
];

export function AuditEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("audit-events");
    if (stored) {
      try {
        const parsed: AuditEvent[] = JSON.parse(stored).map((e: any) => ({
          ...e,
          date: new Date(e.date),
        }));
        setEvents(parsed);
        return;
      } catch (error) {
        console.error("Failed to parse stored audit events", error);
      }
    }
    setEvents(defaultEvents);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "audit-events",
      JSON.stringify(events.map((e) => ({ ...e, date: e.date.toISOString() })))
    );
  }, [events]);

  const addEvent = (event: Omit<AuditEvent, "id">) => {
    const newEvent: AuditEvent = { ...event, id: crypto.randomUUID() };
    setEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (id: string, event: Omit<AuditEvent, "id">) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...event, id } : e)));
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const syncWithGoogleCalendar = async () => {
    try {
      // Exemplo de integração utilizando Google API Client
      const gapi = (window as any).gapi;
      if (!gapi) throw new Error("Google API client não carregado");

      await gapi.client.load("calendar", "v3");

      for (const event of events) {
        await gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: {
            summary: event.title,
            description: `Responsável: ${event.responsible}`,
            start: { date: event.date.toISOString().split("T")[0] },
            end: { date: event.date.toISOString().split("T")[0] },
          },
        });
      }
      toast.success("Eventos sincronizados com Google Calendar");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao sincronizar com Google Calendar");
    }
  };

  return (
    <AuditEventsContext.Provider
      value={{ events, addEvent, updateEvent, removeEvent, syncWithGoogleCalendar }}
    >
      {children}
    </AuditEventsContext.Provider>
  );
}

export function useAuditEvents() {
  const ctx = useContext(AuditEventsContext);
  if (!ctx) {
    throw new Error("useAuditEvents must be used within AuditEventsProvider");
  }
  return ctx;
}

