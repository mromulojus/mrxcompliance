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
import type { Department } from '@/types/departments';
import { EmpresaSelectModal } from '@/components/empresas/EmpresaSelectModal';
import { Label } from '@/components/ui/label';
import { Paperclip } from 'lucide-react';

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [primaryDepartmentId, setPrimaryDepartmentId] = useState<string | undefined>(undefined);
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<{ id: string; nome: string } | null>(null);
  const [anexoArquivos, setAnexoArquivos] = useState<File[]>([]);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);

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
    const loadDepartments = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      // Busca departamentos acessíveis ao usuário (todas empresas onde tem acesso)
      const { data } = await supabase.rpc('my_departments');
      const unique: Record<string, Department> = {};
      (data || []).forEach((d: any) => {
        unique[d.department_id] = {
          id: d.department_id,
          company_id: d.company_id,
          module_id: d.module_id,
          name: d.name,
          slug: d.slug,
          color: d.color,
          business_unit: d.business_unit,
          is_active: d.is_active,
        };
      });
      const list = Object.values(unique);
      setDepartments(list);
      if (!primaryDepartmentId && list.length > 0) {
        setPrimaryDepartmentId(list[0].id);
        setSelectedDepartments([list[0].id]);
      }
    };
    void loadDepartments();

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
    onSubmit({
      ...data,
      empresa_id: empresaId,
      ...contextData,
      anexos: anexosPaths.length ? anexosPaths : undefined,
      department_ids: selectedDepartments,
      primary_department_id: primaryDepartmentId,
    });
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setAnexoArquivos([]);
  };

  const selectedUser = users.find(user => user.user_id === form.watch('responsavel_id'));

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

            {/* Responsible and Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsavel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted border border-dashed flex items-center justify-center">
                              <span className="text-xs">?</span>
                            </div>
                            <span>Não atribuído</span>
                          </div>
                        </SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            <div className="flex items-center gap-2">
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
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            {/* Departments selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Departamentos (mín. 1)</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => {
                    const selected = selectedDepartments.includes(dept.id);
                    return (
                      <Button
                        key={dept.id}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        className="h-8 px-3"
                        onClick={() => {
                          setSelectedDepartments((prev) => {
                            const exists = prev.includes(dept.id);
                            const next = exists ? prev.filter(id => id !== dept.id) : [...prev, dept.id];
                            if (!exists && !primaryDepartmentId) setPrimaryDepartmentId(dept.id);
                            if (exists && primaryDepartmentId === dept.id) setPrimaryDepartmentId(next[0]);
                            return next;
                          });
                        }}
                        style={{ backgroundColor: selected ? undefined : undefined }}
                      >
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: dept.color || '#9ca3af' }} />
                        {dept.name}
                      </Button>
                    );
                  })}
                </div>
              </FormItem>
              <FormItem>
                <FormLabel>Departamento Principal</FormLabel>
                <Select value={primaryDepartmentId} onValueChange={setPrimaryDepartmentId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o principal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedDepartments.map((id) => {
                      const dept = departments.find(d => d.id === id);
                      if (!dept) return null;
                      return (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </div>

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