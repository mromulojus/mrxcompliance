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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useProcessosData } from '@/hooks/useProcessosData';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import type { ProcessoStatus } from '@/types/processos';

const formSchema = z.object({
  numero_processo: z.string().min(1, 'Número do processo é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  acao: z.string().min(1, 'Ação é obrigatória'),
  autor: z.string().min(1, 'Autor é obrigatório'),
  reu: z.string().min(1, 'Réu é obrigatório'),
  status: z.enum(['ativo', 'suspenso', 'arquivado', 'transitado_julgado', 'baixado']),
  juizo: z.string().optional(),
  vara: z.string().optional(),
  tribunal: z.string().optional(),
  link_tribunal: z.string().url('URL inválida').optional().or(z.literal('')),
  reu_contratado: z.string().optional(),
  parte_contraria: z.string().optional(),
  advogado_responsavel: z.string().optional(),
  valor_causa: z.string().optional(),
  valor_origem: z.string().optional(),
  valor_compra: z.string().optional(),
  valor_pensao: z.string().optional(),
  data_distribuicao: z.date().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormProcessoProps {
  empresaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FormProcesso({ empresaId, onClose, onSuccess }: FormProcessoProps) {
  const { adicionarProcesso } = useProcessosData();
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'ativo',
      numero_processo: '',
      titulo: '',
      acao: '',
      autor: '',
      reu: '',
    },
  });

  const parseNumericValue = (value: string) => {
    if (!value) return undefined;
    const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(numericValue) ? undefined : numericValue;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const processo = {
        empresa_id: empresaId,
        numero_processo: data.numero_processo,
        titulo: data.titulo,
        acao: data.acao,
        autor: data.autor,
        reu: data.reu,
        status: data.status as ProcessoStatus,
        juizo: data.juizo || undefined,
        vara: data.vara || undefined,
        tribunal: data.tribunal || undefined,
        link_tribunal: data.link_tribunal || undefined,
        reu_contratado: data.reu_contratado || undefined,
        parte_contraria: data.parte_contraria || undefined,
        advogado_responsavel: data.advogado_responsavel || undefined,
        valor_causa: parseNumericValue(data.valor_causa || ''),
        valor_origem: parseNumericValue(data.valor_origem || ''),
        valor_compra: parseNumericValue(data.valor_compra || ''),
        valor_pensao: parseNumericValue(data.valor_pensao || ''),
        data_distribuicao: data.data_distribuicao?.toISOString().split('T')[0],
        data_cadastro: new Date().toISOString().split('T')[0],
        observacoes: data.observacoes || undefined,
        created_by: user.id,
      };

      const result = await adicionarProcesso(processo);
      
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar processo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Processo Judicial</DialogTitle>
          <DialogDescription>
            Cadastre um novo processo judicial no sistema
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero_processo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Processo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1234567-89.2023.8.26.0100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="suspenso">Suspenso</SelectItem>
                        <SelectItem value="arquivado">Arquivado</SelectItem>
                        <SelectItem value="transitado_julgado">Transitado em Julgado</SelectItem>
                        <SelectItem value="baixado">Baixado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Processo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ação de Cobrança - Empresa ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ação *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ação de Cobrança, Execução, Embargos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partes do Processo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="autor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do autor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do réu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reu_contratado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réu Contratado</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do réu contratado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parte_contraria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parte Contrária</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da parte contrária" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informações Jurisdicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="juizo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Juízo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1ª Vara Cível" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vara"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vara</FormLabel>
                    <FormControl>
                      <Input placeholder="Vara específica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tribunal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tribunal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: TJSP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="link_tribunal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Tribunal</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advogado_responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advogado Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do advogado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="valor_causa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Causa</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor na Origem</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_compra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor na Compra</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_pensao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Pensão</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Data de Distribuição */}
            <FormField
              control={form.control}
              name="data_distribuicao"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Distribuição</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre o processo..."
                      className="min-h-[100px]"
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
                {loading ? 'Criando...' : 'Criar Processo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}