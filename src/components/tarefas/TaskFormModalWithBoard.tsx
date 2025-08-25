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
import { Label } from '@/components/ui/label';
import { Paperclip, Circle, Plus, X, Building2, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { EmpresaSelectModal } from '@/components/empresas/EmpresaSelectModal';

const taskFormSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  board_id: z.string().min(1, 'Quadro é obrigatório'),
  column_id: z.string().min(1, 'Coluna é obrigatória'),
  empresa_id: z.string().optional().or(z.literal('')),
  responsavel_id: z.string().optional(),
  status: z.enum(['a_fazer', 'em_andamento', 'em_revisao', 'concluido']),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  data_vencimento: z.string().optional().or(z.literal('')),
});

type TaskFormData = z.infer<typeof taskFormSchema> & {
  responsavel_ids?: string[];
  checklist?: Array<{ id: number; text: string; completed: boolean }>;
  anexos?: string[];
};

interface UserProfile {
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_active: boolean;
}

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onUpdate?: (id: string, data: Partial<any>) => Promise<void>;
  users: UserProfile[];
  defaultValues?: Partial<TaskFormData> & {
    denuncia_id?: string;
    divida_id?: string;
    processo_id?: string;
    colaborador_id?: string;
  };
  editData?: any;
  contextData?: {
    board_id?: string;
    column_id?: string;
    empresa_id?: string;
  };
}

export default function TaskFormModalWithBoard({
  open,
  onOpenChange,
  onSubmit,
  onUpdate,
  users,
  defaultValues,
  editData,
  contextData
}: TaskFormModalProps) {
  const { boards, columns, fetchColumns } = useTaskBoards();
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<{ id: string; nome: string } | null>(null);
  const [anexoArquivos, setAnexoArquivos] = useState<File[]>([]);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);
  const [initialChecklist, setInitialChecklist] = useState<string[]>(['']);
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      board_id: contextData?.board_id || '',
      column_id: contextData?.column_id || '',
      status: 'a_fazer',
      prioridade: 'media',
      ...defaultValues,
      ...editData,
    },
  });

  // Watch board_id changes to update columns
  const watchedBoardId = form.watch('board_id');
  useEffect(() => {
    if (watchedBoardId) {
      fetchColumns(watchedBoardId);
      // Reset column selection when board changes
      form.setValue('column_id', '');
    }
  }, [watchedBoardId, fetchColumns, form]);

  useEffect(() => {
    if (editData) {
      form.reset(editData);
      if (editData?.empresa_id) {
        setSelectedEmpresa({ id: editData.empresa_id, nome: 'Empresa selecionada' });
      }
    } else if (defaultValues) {
      form.reset({
        titulo: '',
        descricao: '',
        board_id: contextData?.board_id || defaultValues.board_id || '',
        column_id: contextData?.column_id || defaultValues.column_id || '',
        status: defaultValues.status || 'a_fazer',
        prioridade: 'media',
        empresa_id: contextData?.empresa_id || defaultValues.empresa_id || '',
        responsavel_id: defaultValues.responsavel_id,
        data_vencimento: defaultValues.data_vencimento || '',
      });
      if (defaultValues.empresa_id || contextData?.empresa_id) {
        const empresaId = contextData?.empresa_id || defaultValues.empresa_id;
        setSelectedEmpresa({ id: empresaId!, nome: 'Empresa selecionada' });
      }
    }
    
    const single = (editData?.responsavel_id || defaultValues?.responsavel_id);
    setSelectedResponsaveis(single && single !== 'none' ? [single] : []);
  }, [editData, defaultValues, contextData, form, open]);

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

  const addChecklistItem = () => {
    setInitialChecklist(prev => [...prev, '']);
  };

  const removeChecklistItem = (index: number) => {
    setInitialChecklist(prev => prev.filter((_, i) => i !== index));
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const generateEmpresasChecklist = () => {
    try {
      const empresasTemplate = empresas.map(empresa => `${empresa.nome}`);
      
      if (initialChecklist.some(item => item.trim() !== '')) {
        const confirmReplace = window.confirm('O checklist já possui itens. Deseja substituí-los pelo modelo de empresas?');
        if (!confirmReplace) return;
      }
      
      setInitialChecklist([...empresasTemplate, '']);
    } catch (error) {
      console.error('Erro ao gerar checklist de empresas:', error);
    }
  };

  useEffect(() => {
    if (open && empresas.length === 0) {
      fetchEmpresas();
    }
  }, [open, empresas.length]);

  const handleSubmit = async (data: TaskFormData) => {
    try {
      const empresaId = selectedEmpresa?.id || data.empresa_id;
      const anexosPaths = await uploadAnexos(anexoArquivos, empresaId);
      
      // Prepare checklist data - with better error handling
      let finalDescription = data.descricao || '';
      try {
        const validChecklistItems = initialChecklist.filter(item => item && item.trim() !== '');
        if (validChecklistItems.length > 0) {
          const checklistData = validChecklistItems.map((text, index) => ({
            id: Date.now() + index,
            text: text.trim(),
            completed: false
          }));
          finalDescription += `checklist:${JSON.stringify(checklistData)}`;
        }
      } catch (error) {
        console.error('Erro ao processar checklist:', error);
        // Continue without checklist if there's an error
      }

      // Prepare responsavel IDs - support multiple assignees
      const responsavelIds = selectedResponsaveis.length > 0 
        ? selectedResponsaveis
        : (data.responsavel_id ? [data.responsavel_id] : []);

      // Derive module from board name for compatibility
      const selectedBoard = boards.find(b => b.id === data.board_id);
      let modulo_origem = 'geral';
      if (selectedBoard) {
        const boardName = selectedBoard.name.toLowerCase();
        if (boardName.includes('vendas')) modulo_origem = 'vendas';
        else if (boardName.includes('compliance')) modulo_origem = 'compliance';
        else if (boardName.includes('juridico')) modulo_origem = 'juridico';
        else if (boardName.includes('ouvidoria')) modulo_origem = 'ouvidoria';
        else if (boardName.includes('cobrança') || boardName.includes('debto')) modulo_origem = 'cobrancas';
      }

      const payload: TaskFormData & { responsavel_ids?: string[]; modulo_origem?: string } = {
        ...data,
        descricao: finalDescription,
        empresa_id: empresaId,
        responsavel_id: responsavelIds[0] || data.responsavel_id,
        responsavel_ids: responsavelIds,
        modulo_origem, // For backward compatibility
        anexos: anexosPaths.length ? anexosPaths : undefined,
      };

      // Handle editing vs creating
      if (editData?.id && onUpdate) {
        await onUpdate(editData.id, payload);
      } else {
        await onSubmit(payload);
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao processar tarefa:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setAnexoArquivos([]);
    setSelectedResponsaveis([]);
    setInitialChecklist(['']);
  };

  const primarySelectedId = selectedResponsaveis[0] || form.watch('responsavel_id');
  const selectedUser = users.find(user => user.user_id === primarySelectedId);
  const selectedBoard = boards.find(b => b.id === form.watch('board_id'));
  const selectedColumn = columns.find(c => c.id === form.watch('column_id'));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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

            {/* Board and Column Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="board_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quadro *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quadro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: board.background_color }}
                              />
                              {board.name}
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
                name="column_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coluna *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!watchedBoardId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchedBoardId ? "Selecione a coluna" : "Primeiro selecione um quadro"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Breadcrumb Preview */}
            {selectedBoard && selectedColumn && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedBoard.background_color }}
                />
                <span className="font-medium text-sm">{selectedBoard.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selectedColumn.name}</span>
              </div>
            )}

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

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="em_andamento">⚡ Em Andamento</SelectItem>
                        <SelectItem value="em_revisao">👀 Em Revisão</SelectItem>
                        <SelectItem value="concluido">✅ Concluído</SelectItem>
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
                        value={selectedEmpresa ? `${selectedEmpresa.nome}` : ''}
                        placeholder="Nenhuma empresa vinculada"
                      />
                      <Button type="button" variant="outline" onClick={() => setEmpresaModalOpen(true)}>
                        Selecionar
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Responsáveis */}
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
                  <span className="text-sm text-muted-foreground">Nenhum responsável</span>
                </div>
                {users.filter(u => u.is_active).map((user) => (
                  <div key={user.user_id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedResponsaveis.includes(user.user_id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedResponsaveis(prev => [...prev, user.user_id]);
                        } else {
                          setSelectedResponsaveis(prev => prev.filter(id => id !== user.user_id));
                        }
                      }}
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.full_name || user.username}</span>
                  </div>
                ))}
              </div>
              {selectedUser && (
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedUser.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {selectedUser.full_name?.charAt(0) || selectedUser.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedUser.full_name || selectedUser.username}</p>
                    <p className="text-xs text-muted-foreground">Responsável principal</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={uploadingAnexos}
                className="bg-primary hover:bg-primary/90"
              >
                {uploadingAnexos ? 'Carregando...' : editData ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </Form>

        <EmpresaSelectModal
          open={empresaModalOpen}
          onOpenChange={setEmpresaModalOpen}
          onSelect={(empresa) => {
            setSelectedEmpresa(empresa);
            form.setValue('empresa_id', empresa.id);
            setEmpresaModalOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
