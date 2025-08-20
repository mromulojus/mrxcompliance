import React, { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { EmpresaSelectModal } from '@/components/empresas/EmpresaSelectModal';
import { Label } from '@/components/ui/label';
import { Paperclip } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const taskFormSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  modulo_origem: z.enum(['ouvidoria', 'auditoria', 'cobrancas', 'geral', 'vendas', 'juridico', 'compliance']),
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
  defaultValues?: Partial<TaskFormData> & {
    denuncia_id?: string;
    divida_id?: string;
    processo_id?: string;
    colaborador_id?: string;
  };
  editData?: TaskFormData;
  /** Campos de contexto adicionais que serão mesclados no submit (ex.: board_id, column_id) */
  contextData?: Partial<TaskFormData>;
}

export function TaskFormModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  users,
  defaultValues,
  editData,
  contextData
}: TaskFormModalProps) {
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<{ id: string; nome: string } | null>(null);
  const [anexoArquivos, setAnexoArquivos] = useState<File[]>([]);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);

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
      if ((editData as any)?.empresa_id) {
        setSelectedEmpresa({ id: (editData as any).empresa_id as string, nome: 'Empresa selecionada' });
      } else {
        setSelectedEmpresa(null);
      }
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
      if (defaultValues.empresa_id) {
        setSelectedEmpresa({ id: defaultValues.empresa_id, nome: 'Empresa selecionada' });
      } else {
        setSelectedEmpresa(null);
      }
    }
    // preset multi-select from single if provided
    const single = (editData?.responsavel_id || defaultValues?.responsavel_id);
    setSelectedResponsaveis(single && single !== 'none' ? [single] : []);
  }, [editData, defaultValues, form, open]);

  const uploadAnexos = async (files: File[], empresaId?: string): Promise<string[]> => {
    const paths: string[] = [];
    if (!files || files.length === 0) return paths;
    const folderRoot = empresaId ? `empresa_${empresaId}` : 'sem_empresa';
    setUploadingAnexos(true);
    try {
      for (const file of files) {
        const safe = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const path = `${folderRoot}/${Date.now()}_${safe}`;
        const { data: up, error } = await supabase.storage
          .from('tarefas-anexos')
          .upload(path, file, { cacheControl: '3600' });
        if (error) throw error;
        paths.push(up.path);
      }
    } finally {
      setUploadingAnexos(false);
    }
    return paths;
  };

  const handleSubmit = async (data: TaskFormData) => {
    const empresaId = selectedEmpresa?.id || data.empresa_id;
    const anexosPaths = await uploadAnexos(anexoArquivos, empresaId);
    const payload: TaskFormData = {
      ...data,
      empresa_id: empresaId,
      ...contextData,
      anexos: anexosPaths.length ? anexosPaths : undefined,
    } as any;
    if (selectedResponsaveis.length > 0) {
      // prefer multi; keep primary as first for backward compat
      (payload as any).responsavel_id = selectedResponsaveis[0];
    } else if (data.responsavel_id === 'none') {
      (payload as any).responsavel_id = undefined;
    }
    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setAnexoArquivos([]);
    setSelectedResponsaveis([]);
  };

  const primarySelectedId = selectedResponsaveis[0] || form.watch('responsavel_id');
  const selectedUser = users.find(user => user.user_id === primarySelectedId);

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
                        <SelectItem value="geral">📋 Administrativo</SelectItem>
                        <SelectItem value="ouvidoria">📢 Ouvidoria</SelectItem>
                        <SelectItem value="auditoria">🔍 Compliance</SelectItem>
                        <SelectItem value="cobrancas">💰 Cobranças</SelectItem>
                        <SelectItem value="vendas">🚀 Vendas</SelectItem>
                        <SelectItem value="juridico">⚖️ Jurídico</SelectItem>
                        <SelectItem value="compliance">✅ Compliance</SelectItem>
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

            {/* Empresa vinculada */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="empresa_id"
                render={() => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={selectedEmpresa ? `${selectedEmpresa.nome} (${selectedEmpresa.id})` : ''}
                        placeholder="Nenhuma empresa vinculada"
                      />
                      <Button type="button" variant="outline" onClick={() => setEmpresaModalOpen(true)}>
                        Selecionar
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Responsible (multi) and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Responsáveis</FormLabel>
                <div className="max-h-40 overflow-auto rounded border p-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedResponsaveis.length === 0}
                      onCheckedChange={(v) => {
                        if (v) setSelectedResponsaveis([]);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">Não atribuído</span>
                  </div>
                  {users.map((user) => {
                    const checked = selectedResponsaveis.includes(user.user_id);
                    return (
                      <div key={user.user_id} className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const isChecked = Boolean(v);
                            setSelectedResponsaveis((prev) => {
                              if (isChecked) return Array.from(new Set([...prev, user.user_id]));
                              return prev.filter((id) => id !== user.user_id);
                            });
                          }}
                        />
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {user.full_name
                              ?.split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 
                             user.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.full_name || user.username}</span>
                      </div>
                    );
                  })}
                </div>
                {selectedResponsaveis.length > 0 && (
                  <p className="text-xs text-muted-foreground">Principal: {users.find(u => u.user_id === selectedResponsaveis[0])?.full_name || users.find(u => u.user_id === selectedResponsaveis[0])?.username}</p>
                )}
              </div>

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

            {/* Anexos */}
            <div className="space-y-2">
              <Label>Anexos</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => document.getElementById('tarefa-anexos-input')?.click()}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  {uploadingAnexos ? 'Enviando...' : 'Selecionar arquivos'}
                </Button>
                <input
                  id="tarefa-anexos-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setAnexoArquivos(Array.from(e.target.files || []))}
                />
                {anexoArquivos.length > 0 && (
                  <span className="text-sm text-muted-foreground">{anexoArquivos.length} arquivo(s) selecionado(s)</span>
                )}
              </div>
            </div>

            {/* Department selection removed from task creation */}

            {/* Selected User Preview */}
            {selectedUser && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-sm font-medium mb-2">Responsável selecionado:</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedUser.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {selectedUser.full_name
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 
                       selectedUser.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedUser.full_name || selectedUser.username}</p>
                    <Badge variant="secondary" className="text-xs">
                      {selectedUser.username}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" className="min-w-[100px]" disabled={uploadingAnexos}>
                {editData ? 'Atualizar' : 'Criar'} Tarefa
              </Button>
            </div>
          </form>
        </Form>

        {/* Modal de seleção de empresa */}
        <EmpresaSelectModal
          open={empresaModalOpen}
          onOpenChange={(o) => setEmpresaModalOpen(o)}
          selectedEmpresaId={selectedEmpresa?.id}
          onSelect={(empresa) => {
            if (empresa) {
              setSelectedEmpresa({ id: empresa.id, nome: empresa.nome });
              form.setValue('empresa_id', empresa.id);
            } else {
              setSelectedEmpresa(null);
              form.setValue('empresa_id', undefined as any);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}