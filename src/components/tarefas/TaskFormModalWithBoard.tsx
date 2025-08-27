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
import { useToast } from '@/hooks/use-toast';

const taskFormSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  board_id: z.string().min(1, 'Quadro é obrigatório'),
  column_id: z.string().min(1, 'Coluna é obrigatória'),
  empresa_id: z.string().optional().nullable().or(z.literal('')),
  responsavel_id: z.string().optional(),
  status: z.enum(['a_fazer', 'em_andamento', 'em_revisao', 'concluido']),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  data_vencimento: z.string().optional().nullable().or(z.literal('')),
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
  const { toast } = useToast();
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<{ id: string; nome: string } | null>(null);
  const [anexoArquivos, setAnexoArquivos] = useState<File[]>([]);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);
  const [preDefinedFields, setPreDefinedFields] = useState<{[key: string]: string}>({});
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

  // Função para gerar campos pré-definidos do quadro VENDAS
  const getVendasFields = () => {
    return {
      'numero_processo': 'Número do Processo',
      'data_audiencia': 'Data da Audiência', 
      'valor_causa': 'Valor da Causa',
      'objeto_acao': 'Objeto da Ação',
      'advogado_empresa': 'Advogado da Empresa',
      'nome_fantasia_razao_social': 'Nome Fantasia e Razão Social',
      'cnpj': 'CNPJ',
      'telefone_principal_empresa': 'Telefone Principal da Empresa',
      'segmento_atuacao': 'Segmento de Atuação',
      'porte_estimado': 'Porte Estimado',
      'nome_socio_decisor': 'Nome do Sócio/Decisor',
      'cargo': 'Cargo',
      'telefone_direto_whatsapp': 'Telefone Direto / WhatsApp',
      'email_decisor': 'E-mail do Decisor'
    };
  };

  useEffect(() => {
    // Fix editData handling - check if it's actually a valid object
    if (editData && typeof editData === 'object' && editData.id && !editData._type) {
      console.log('TaskFormModalWithBoard - Setting up editData:', editData);
      form.reset(editData);
      if (editData?.empresa_id) {
        setSelectedEmpresa({ id: editData.empresa_id, nome: 'Empresa selecionada' });
      }
      // Parse existing predefined fields from description if editing
      if (editData?.descricao) {
        const match = editData.descricao.match(/predefined_fields:({.*?})/);
        if (match) {
          try {
            setPreDefinedFields(JSON.parse(match[1]));
          } catch (e) {
            console.error('Error parsing predefined fields:', e);
          }
        }
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

  // Auto-populate predefined fields for VENDAS board
  useEffect(() => {
    const currentBoardId = form.watch('board_id');
    const selectedBoard = boards.find(b => b.id === currentBoardId);
    
    // Improved detection for VENDAS board
    const isVendasBoard = selectedBoard?.name.toLowerCase().includes('vendas') || 
                         selectedBoard?.name.toLowerCase().includes('growth') ||
                         selectedBoard?.id === '3e5fa6e7-2975-4bad-aec7-94dff85bd112';
    
    if (isVendasBoard) {
      // Initialize predefined fields for both create and edit
      const vendasFields = getVendasFields();
      const emptyFields: {[key: string]: string} = {};
      Object.keys(vendasFields).forEach(key => {
        emptyFields[key] = '';
      });
      
      // If editing, try to parse existing predefined fields from description
      if (editData?.descricao) {
        const match = editData.descricao.match(/predefined_fields:(\{.*?\})/);
        if (match) {
          try {
            const savedFields = JSON.parse(match[1]);
            Object.keys(emptyFields).forEach(key => {
              if (savedFields[key]) {
                emptyFields[key] = savedFields[key];
              }
            });
          } catch (e) {
            console.error('Error parsing saved predefined fields:', e);
          }
        }
      }
      
      setPreDefinedFields(emptyFields);
    } else {
      // Clear predefined fields if not VENDAS board
      setPreDefinedFields({});
    }
  }, [form.watch('board_id'), boards, editData]);

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

  useEffect(() => {
    if (open && empresas.length === 0) {
      fetchEmpresas();
    }
  }, [open, empresas.length]);

  const handleSubmit = async (data: TaskFormData) => {
    console.log('TaskFormModalWithBoard - handleSubmit called', { 
      data, 
      editData: editData?.id, 
      hasOnUpdate: !!onUpdate,
      hasOnSubmit: !!onSubmit 
    });
    
    try {
      // CRITICAL: Verify user authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erro de Autenticação',
          description: 'Você precisa estar logado para realizar esta ação. Redirecionando...',
          variant: 'destructive',
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
        return;
      }

      console.log('TaskFormModalWithBoard - User authenticated:', user.id);

      // Fix empresa_id handling - get from selectedEmpresa, board, or data
      let empresaId = selectedEmpresa?.id || data.empresa_id;
      
      // If no empresa_id, try to get from the selected board
      if (!empresaId || empresaId === '') {
        const selectedBoard = boards.find(b => b.id === data.board_id);
        if (selectedBoard?.empresa_id) {
          empresaId = selectedBoard.empresa_id;
          console.log('TaskFormModalWithBoard - Using board empresa_id:', empresaId);
        }
      }
      
      // Convert empty string to null to avoid UUID validation errors
      if (empresaId === '') {
        empresaId = null;
      }

      console.log('TaskFormModalWithBoard - Final empresa_id:', empresaId);
      
      const anexosPaths = await uploadAnexos(anexoArquivos, empresaId);
      
      // Prepare predefined fields data
      let finalDescription = data.descricao || '';
      if (Object.keys(preDefinedFields).length > 0) {
        const hasContent = Object.values(preDefinedFields).some(value => value.trim() !== '');
        if (hasContent) {
          finalDescription += `\n\npredefined_fields:${JSON.stringify(preDefinedFields)}`;
        }
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

      // Sanitize data to avoid null values and validate required fields
      const payload: TaskFormData & { responsavel_ids?: string[]; modulo_origem?: string } = {
        ...data,
        titulo: data.titulo?.trim() || '',
        descricao: finalDescription || '',
        empresa_id: empresaId,
        responsavel_id: responsavelIds[0] || data.responsavel_id || null,
        responsavel_ids: responsavelIds,
        modulo_origem,
        anexos: anexosPaths.length ? anexosPaths : undefined,
        data_vencimento: data.data_vencimento || null,
        board_id: data.board_id || contextData?.board_id,
        column_id: data.column_id || contextData?.column_id,
        prioridade: data.prioridade || 'media',
        status: data.status || 'a_fazer',
      };

      // Validate required fields
      if (!payload.titulo.trim()) {
        toast({
          title: 'Erro',
          description: 'Título é obrigatório',
          variant: 'destructive',
        });
        return;
      }
      if (!payload.board_id) {
        toast({
          title: 'Erro',
          description: 'Board ID é obrigatório',
          variant: 'destructive',
        });
        return;
      }
      if (!payload.column_id) {
        toast({
          title: 'Erro',
          description: 'Column ID é obrigatório',
          variant: 'destructive',
        });
        return;
      }

      console.log('TaskFormModalWithBoard - prepared payload:', payload);
      
      // Handle editing vs creating - fix editData validation
      const isEditing = editData && typeof editData === 'object' && editData.id && !editData._type;
      if (isEditing && onUpdate) {
        console.log('TaskFormModalWithBoard - calling onUpdate with:', editData.id, payload);
        await onUpdate(editData.id, payload);
        console.log('TaskFormModalWithBoard - onUpdate completed successfully');
      } else {
        console.log('TaskFormModalWithBoard - calling onSubmit with:', payload);
        await onSubmit(payload);
        console.log('TaskFormModalWithBoard - onSubmit completed successfully');
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao processar tarefa:', error);
      throw error; // Re-throw to prevent handleClose from being called on error
    }
  };

  const handleClose = () => {
    // Verificar se há dados preenchidos antes de fechar
    const formValues = form.getValues();
    const hasData = formValues.titulo || formValues.descricao || anexoArquivos.length > 0 || selectedResponsaveis.length > 0;
    
    if (hasData && !editData) {
      // Confirmar se o usuário quer descartar as alterações
      const shouldClose = window.confirm('Você tem alterações não salvas. Deseja descartar e fechar?');
      if (!shouldClose) return;
    }
    
    onOpenChange(false);
    // Só limpar os dados se não for edição ou se confirmou descarte
    if (!editData || hasData) {
      form.reset();
      setAnexoArquivos([]);
      setSelectedResponsaveis([]);
      setPreDefinedFields({});
    }
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
            <form 
              onSubmit={(e) => {
                console.log('Form onSubmit triggered', { 
                  isValid: form.formState.isValid,
                  errors: form.formState.errors,
                  values: form.getValues()
                });
                form.handleSubmit(handleSubmit)(e);
              }} 
              className="space-y-6"
            >
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

            {/* Campos Pré-definidos para VENDAS */}
            {Object.keys(preDefinedFields).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-semibold">Campos de Qualificação</FormLabel>
                  <Badge variant="secondary" className="text-xs">
                    Template {selectedBoard?.name}
                  </Badge>
                </div>
                <div className="max-h-80 overflow-y-auto border rounded-lg bg-card">
                  <div className="p-4 space-y-6">
                    {/* Dados do Processo */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h4 className="font-semibold text-sm">Dados do Processo</h4>
                      </div>
                      <div className="space-y-3 pl-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Número do Processo</Label>
                            <Input
                              placeholder="Ex: 0000634-13.2025.5.10.0811"
                              value={preDefinedFields['numero_processo'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                numero_processo: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Data da Audiência</Label>
                            <Input
                              type="date"
                              value={preDefinedFields['data_audiencia'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                data_audiencia: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Valor da Causa</Label>
                          <Input
                            placeholder="Ex: R$ 24.569,56"
                            value={preDefinedFields['valor_causa'] || ''}
                            onChange={(e) => setPreDefinedFields(prev => ({
                              ...prev,
                              valor_causa: e.target.value
                            }))}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Objeto da Ação</Label>
                          <Input
                            placeholder="Ex: Reconhecimento de Relação de Emprego"
                            value={preDefinedFields['objeto_acao'] || ''}
                            onChange={(e) => setPreDefinedFields(prev => ({
                              ...prev,
                              objeto_acao: e.target.value
                            }))}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Advogado da Empresa</Label>
                          <Input
                            placeholder="Informar se já tem advogado constituído"
                            value={preDefinedFields['advogado_empresa'] || ''}
                            onChange={(e) => setPreDefinedFields(prev => ({
                              ...prev,
                              advogado_empresa: e.target.value
                            }))}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dados da Empresa */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h4 className="font-semibold text-sm">Dados da Empresa</h4>
                      </div>
                      <div className="space-y-3 pl-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Nome Fantasia e Razão Social</Label>
                          <Input
                            placeholder="Ex: D R Construções Ltda"
                            value={preDefinedFields['nome_fantasia_razao_social'] || ''}
                            onChange={(e) => setPreDefinedFields(prev => ({
                              ...prev,
                              nome_fantasia_razao_social: e.target.value
                            }))}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">CNPJ</Label>
                            <Input
                              placeholder="Ex: 36.263.148/0001-66"
                              value={preDefinedFields['cnpj'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                cnpj: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Telefone Principal</Label>
                            <Input
                              placeholder="Ex: (63) 99223-7538"
                              value={preDefinedFields['telefone_principal_empresa'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                telefone_principal_empresa: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Segmento de Atuação</Label>
                            <Input
                              placeholder="Ex: CONSTRUÇÃO"
                              value={preDefinedFields['segmento_atuacao'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                segmento_atuacao: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Porte Estimado</Label>
                            <Input
                              placeholder="Nº de colaboradores"
                              value={preDefinedFields['porte_estimado'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                porte_estimado: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dados do Contato */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <h4 className="font-semibold text-sm">Dados do Contato</h4>
                      </div>
                      <div className="space-y-3 pl-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Nome do Sócio/Decisor</Label>
                            <Input
                              placeholder="Ex: DENIS REGO FIGUEREDO"
                              value={preDefinedFields['nome_socio_decisor'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                nome_socio_decisor: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Cargo</Label>
                            <Input
                              placeholder="Ex: SÓCIO"
                              value={preDefinedFields['cargo'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                cargo: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Telefone Direto / WhatsApp</Label>
                            <Input
                              placeholder="Ex: (63) 99223-7538"
                              value={preDefinedFields['telefone_direto_whatsapp'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                telefone_direto_whatsapp: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">E-mail do Decisor</Label>
                            <Input
                              type="email"
                              placeholder="email@empresa.com"
                              value={preDefinedFields['email_decisor'] || ''}
                              onChange={(e) => setPreDefinedFields(prev => ({
                                ...prev,
                                email_decisor: e.target.value
                              }))}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anexos */}
            <div className="space-y-2">
              <FormLabel>Anexos</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAnexoArquivos(files);
                  }}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </div>
              {anexoArquivos.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {anexoArquivos.length} arquivo(s) selecionado(s)
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  console.log('Cancel button clicked');
                  handleClose();
                }} 
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={uploadingAnexos}
                className="bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  console.log('Submit button clicked', { 
                    editData: editData?.id, 
                    uploadingAnexos,
                    formValid: form.formState.isValid,
                    errors: form.formState.errors,
                    values: form.getValues()
                  });
                }}
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
