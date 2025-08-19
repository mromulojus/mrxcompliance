import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TaskFormData, UserProfile } from '@/types/tarefas';
import { Select as SelectPrimitive } from '@/components/ui/select';

const taskFormSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  modulo_origem: z.enum(['ouvidoria', 'auditoria', 'cobrancas', 'geral']),
  empresa_id: z.string().optional(),
  responsavel_id: z.string().optional(),
  status: z.enum(['a_fazer', 'em_andamento', 'em_revisao', 'concluido']),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  data_vencimento: z.string().optional(),
});

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  users: UserProfile[];
  empresas?: Array<{ id: string; nome: string }>
  defaultValues?: Partial<TaskFormData> & {
    denuncia_id?: string;
    divida_id?: string;
    processo_id?: string;
    colaborador_id?: string;
  };
  editData?: TaskFormData;
}

export function TaskFormModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  users,
  empresas = [],
  defaultValues,
  editData 
}: TaskFormModalProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      modulo_origem: 'geral',
      status: 'a_fazer',
      prioridade: 'media',
      ...defaultValues,
      ...editData,
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset(editData);
    } else if (defaultValues) {
      form.reset({
        titulo: '',
        descricao: '',
        modulo_origem: defaultValues.modulo_origem || 'geral',
        status: defaultValues.status || 'a_fazer',
        prioridade: 'media',
        empresa_id: defaultValues.empresa_id,
        responsavel_id: defaultValues.responsavel_id,
        data_vencimento: defaultValues.data_vencimento,
      });
    }
  }, [editData, defaultValues, form, open]);

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  // selectedUser removed as atribuição agora acontece após a criação

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editData ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Revisar relatório mensal, Implementar nova funcionalidade..." 
                      {...field} 
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhes da tarefa, objetivos e requisitos..."
                      className="resize-none min-h-[80px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Empresa, Module and Priority */}
            <FormField
              control={form.control}
              name="empresa_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Module and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modulo_origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o módulo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="geral">📋 Geral</SelectItem>
                        <SelectItem value="ouvidoria">📢 Ouvidoria</SelectItem>
                        <SelectItem value="auditoria">🔍 Auditoria</SelectItem>
                        <SelectItem value="cobrancas">💰 Cobranças</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">🟢 Baixa</SelectItem>
                        <SelectItem value="media">🟡 Média</SelectItem>
                        <SelectItem value="alta">🔴 Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="a_fazer">📋 A Fazer</SelectItem>
                        <SelectItem value="em_andamento">🔄 Em Andamento</SelectItem>
                        <SelectItem value="em_revisao">👀 Em Revisão</SelectItem>
                        <SelectItem value="concluido">✅ Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Due Date */}
            <FormField
              control={form.control}
              name="data_vencimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sem seleção de responsável neste formulário */}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" className="min-w-[100px]">
                {editData ? 'Atualizar' : 'Criar'} Tarefa
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}