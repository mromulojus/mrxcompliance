import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  id: string
  titulo: string
  descricao?: string
  data_evento: string
  data_fim?: string
  tipo_evento: string
  modulo_origem: string
  status?: string
  prioridade?: string
  cor_etiqueta?: string
  empresa_id: string
}

const generateUID = (eventId: string, empresaId: string): string => {
  return `${eventId}@${empresaId}.mrxcompliance.com`
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

const escapeText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

const getTipoEventoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    'task_deadline': 'Vencimento de Tarefa',
    'hearing': 'Audiência',
    'deadline': 'Prazo Legal',
    'meeting': 'Reunião',
    'court_event': 'Evento Judicial',
    'debt_due': 'Vencimento de Dívida',
    'protest': 'Protesto',
    'blacklist': 'Negativação',
    'birthday': 'Aniversário',
    'custom': 'Evento Personalizado'
  }
  return labels[tipo] || tipo
}

const getModuloLabel = (modulo: string): string => {
  const labels: Record<string, string> = {
    'tarefas': 'Tarefas',
    'processos': 'Processos Judiciais',
    'cobrancas': 'Cobranças',
    'hr': 'Recursos Humanos',
    'custom': 'Personalizado'
  }
  return labels[modulo] || modulo
}

const generateICalendar = (events: CalendarEvent[], empresaId: string | null): string => {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MRX Compliance//Calendar Events//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:MRX Compliance - Eventos${empresaId ? ' (Empresa)' : ' (Todas)'}`,
    'X-WR-CALDESC:Calendário unificado de eventos do sistema MRX Compliance',
    'X-WR-TIMEZONE:America/Sao_Paulo'
  ].join('\r\n')

  events.forEach(event => {
    const startDate = formatDate(event.data_evento)
    const endDate = event.data_fim ? formatDate(event.data_fim) : formatDate(new Date(new Date(event.data_evento).getTime() + 60 * 60 * 1000).toISOString())
    
    const tipoLabel = getTipoEventoLabel(event.tipo_evento)
    const moduloLabel = getModuloLabel(event.modulo_origem)
    const priority = event.prioridade === 'alta' ? '1' : event.prioridade === 'media' ? '5' : '9'
    
    let description = `Módulo: ${moduloLabel}`
    if (event.descricao) {
      description += `\\n\\nDescrição: ${escapeText(event.descricao)}`
    }
    description += `\\n\\nTipo: ${tipoLabel}`
    if (event.status) {
      description += `\\nStatus: ${event.status}`
    }
    if (event.prioridade) {
      description += `\\nPrioridade: ${event.prioridade}`
    }
    description += `\\n\\nSistema: MRX Compliance`

    ical += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${generateUID(event.id, event.empresa_id)}`,
      `DTSTAMP:${now}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeText(event.titulo)}`,
      `DESCRIPTION:${description}`,
      `CATEGORIES:${tipoLabel}`,
      `PRIORITY:${priority}`,
      event.status === 'concluido' ? 'STATUS:COMPLETED' : 'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'CLASS:PUBLIC',
      'END:VEVENT'
    ].join('\r\n')
  })

  ical += '\r\nEND:VCALENDAR'
  return ical
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const empresaId = url.searchParams.get('empresa_id')
    const modulos = url.searchParams.get('modulos')?.split(',')
    const incluirConcluidos = url.searchParams.get('incluir_concluidos') === 'true'

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build query
    let query = supabase
      .from('calendario_eventos')
      .select('*')
      .order('data_evento', { ascending: true })

    // Apply filters
    if (empresaId && empresaId !== 'all') {
      query = query.eq('empresa_id', empresaId)
    }

    if (modulos && modulos.length > 0) {
      query = query.in('modulo_origem', modulos)
    }

    if (!incluirConcluidos) {
      query = query.neq('status', 'concluido')
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response('Erro ao buscar eventos', { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    if (!events || events.length === 0) {
      // Return empty calendar if no events
      const emptyCalendar = generateICalendar([], empresaId)
      return new Response(emptyCalendar, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'attachment; filename="mrx-compliance-calendar.ics"',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }

    // Generate iCal content
    const icalContent = generateICalendar(events, empresaId)

    return new Response(icalContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mrx-compliance-calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response('Erro interno do servidor', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  }
})