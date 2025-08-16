import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CalendarEvent {
  id: string;
  divida_id: string | null;
  title: string;
  date: string;
  email: string | null;
  status: string | null;
  reminder_sent: boolean | null;
}

export function useCalendarEvents() {
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      setEventos((data || []) as CalendarEvent[]);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar eventos");
    }
  };

  const adicionarEvento = async (evento: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert(evento as any)
        .select()
        .single();
      if (error) throw error;
      setEventos((prev) => [...prev, data as CalendarEvent]);
      return data;
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      toast.error("Erro ao adicionar evento ao calendário");
      throw error;
    }
  };

  const atualizarEvento = async (dividaId: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updates as any)
        .eq("divida_id", dividaId)
        .select()
        .single();
      if (error) throw error;
      setEventos((prev) =>
        prev.map((ev) => (ev.divida_id === dividaId ? { ...ev, ...updates } : ev))
      );
      return data;
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      throw error;
    }
  };

  const enviarLembrete = async (evento: CalendarEvent) => {
    if (!evento.email) {
      toast.error("Evento sem e-mail associado");
      return;
    }
    try {
      await supabase.functions.invoke("send-reminder-email", {
        body: {
          to: evento.email,
          subject: evento.title,
          message: `Lembrete: sua dívida vence em ${new Date(evento.date).toLocaleDateString()}`,
        },
      });
      await atualizarEvento(evento.divida_id!, { reminder_sent: true });
      toast.success("Lembrete enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);
      toast.error("Erro ao enviar lembrete");
    }
  };

  return { eventos, fetchEventos, adicionarEvento, atualizarEvento, enviarLembrete };
}

