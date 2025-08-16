import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useProcessosData } from '@/hooks/useProcessosData';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import type { EventoTipo } from '@/types/processos';

const formSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['audiencia', 'prazo', 'reuniao', 'vencimento', 'intimacao', 'peticao', 'decisao', 'outro']),
  data_inicio: z.date({ required_error: 'Data de início é obrigatória' }),
  hora_inicio: z.string().min(1, 'Hora de início é obrigatória'),
  data_fim: z.date().optional(),
  hora_fim: z.string().optional(),
  local: z.string().optional(),
  participantes: z.string().optional(),
  processo_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormEventoProps {
  empresaId: string;
  dataInicial?: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export function FormEvento({ empresaId, dataInicial, onClose, onSuccess }: FormEventoProps) {
  const { adicionarEvento } = useProcessosData();
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: 'outro',
      data_inicio: dataInicial || new Date(),
      hora_inicio: '09:00',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Combinar data e hora para data_inicio
      const [horaInicio, minutoInicio] = data.hora_inicio.split(':').map(Number);
      const dataInicio = new Date(data.data_inicio);
      dataInicio.setHours(horaInicio, minutoInicio, 0, 0);

      // Combinar data e hora para data_fim (se fornecida)
      let dataFim: Date | undefined;
      if (data.data_fim && data.hora_fim) {
        const [horaFim, minutoFim] = data.hora_fim.split(':').map(Number);
        dataFim = new Date(data.data_fim);
        dataFim.setHours(horaFim, minutoFim, 0, 0);
      }

      // Processar participantes
      const participantes = data.participantes 
        ? data.participantes.split(',').map(p => p.trim()).filter(p => p)
        : undefined;

      const evento = {
        empresa_id: empresaId,
        titulo: data.titulo,
        descricao: data.descricao || undefined,
        tipo: data.tipo as EventoTipo,
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim?.toISOString(),
        local: data.local || undefined,
        participantes,
        processo_id: data.processo_id || undefined,
        created_by: user.id,
      };

      const result = await adicionarEvento(evento);
      
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const tiposEvento = [
    { value: 'audiencia', label: 'Audiência' },
    { value: 'prazo', label: 'Prazo' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'vencimento', label: 'Vencimento' },
    { value: 'intimacao', label: 'Intimação' },
    { value: 'peticao', label: 'Petição' },
    { value: 'decisao', label: 'Decisão' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
          <DialogDescription>
            Agende um novo evento no calendário jurídico
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Audiência de Conciliação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposEvento.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição detalhada do evento..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data e Hora de Início */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="time" 
                          {...field}
                          className="pl-10"
                        />
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Data e Hora de Fim (Opcional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_fim"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Término (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const dataInicio = form.getValues('data_inicio');
                            return date < dataInicio || date < new Date("1900-01-01");
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Término (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="time" 
                          {...field}
                          className="pl-10"
                        />
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Local e Participantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fórum Central, Sala 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participantes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Dr. João, Dra. Maria (separados por vírgula)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Processo Relacionado */}
            <FormField
              control={form.control}
              name="processo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processo Relacionado (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ID do processo (será implementado seleção)"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Evento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}