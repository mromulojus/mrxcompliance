import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { CreateTaskInput, Task, TaskOriginModule, TaskPriority, TaskStatus } from '@/types/task';

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  originModule: z.custom<TaskOriginModule>(),
  empresaId: z.string().nullable().optional(),
  processoId: z.string().nullable().optional(),
  denunciaId: z.string().nullable().optional(),
  dividaId: z.string().nullable().optional(),
  responsavelUserId: z.string().nullable().optional(),
  status: z.custom<TaskStatus>().default('A_FAZER'),
  priority: z.custom<TaskPriority>().default('MEDIA'),
  dueDate: z.string().nullable().optional(),
});

type Props = {
  open: boolean;
  defaultValues?: Partial<Task> & Partial<CreateTaskInput>;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
};

export const TaskModal: React.FC<Props> = ({ open, defaultValues, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      originModule: (defaultValues?.originModule as any) ?? 'OUVIDORIA',
      empresaId: defaultValues?.empresaId ?? null,
      processoId: defaultValues?.processoId ?? null,
      denunciaId: defaultValues?.denunciaId ?? null,
      dividaId: defaultValues?.dividaId ?? null,
      responsavelUserId: defaultValues?.responsavelUserId ?? null,
      status: (defaultValues?.status as any) ?? 'A_FAZER',
      priority: (defaultValues?.priority as any) ?? 'MEDIA',
      dueDate: defaultValues?.dueDate ?? null,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title ?? '',
        description: defaultValues?.description ?? '',
        originModule: (defaultValues?.originModule as any) ?? 'OUVIDORIA',
        empresaId: defaultValues?.empresaId ?? null,
        processoId: defaultValues?.processoId ?? null,
        denunciaId: defaultValues?.denunciaId ?? null,
        dividaId: defaultValues?.dividaId ?? null,
        responsavelUserId: defaultValues?.responsavelUserId ?? null,
        status: (defaultValues?.status as any) ?? 'A_FAZER',
        priority: (defaultValues?.priority as any) ?? 'MEDIA',
        dueDate: defaultValues?.dueDate ?? null,
      });
    }
  }, [open]);

  const dueDate = watch('dueDate');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(data as CreateTaskInput);
            onClose();
          })}
          className="space-y-3"
        >
          <Input placeholder="Título" autoFocus {...register('title')} />
          <Textarea placeholder="Descrição" rows={4} {...register('description')} />
          <div className="grid grid-cols-2 gap-2">
            <Select onValueChange={(v) => setValue('originModule', v as any)} defaultValue={(defaultValues?.originModule as any) ?? 'OUVIDORIA'}>
              <SelectTrigger>
                <SelectValue placeholder="Módulo de origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUVIDORIA">Ouvidoria</SelectItem>
                <SelectItem value="AUDITORIA">Auditoria</SelectItem>
                <SelectItem value="COBRANCAS">Cobranças</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => setValue('priority', v as any)} defaultValue={(defaultValues?.priority as any) ?? 'MEDIA'}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="BAIXA">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select onValueChange={(v) => setValue('status', v as any)} defaultValue={(defaultValues?.status as any) ?? 'A_FAZER'}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A_FAZER">A Fazer</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="EM_REVISAO">Em Revisão</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              </SelectContent>
            </Select>
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(d) => setValue('dueDate', d ? format(d, 'yyyy-MM-dd') : null)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

