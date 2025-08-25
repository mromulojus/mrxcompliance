import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Edit3, 
  MessageSquare, 
  CheckCircle2,
  Circle,
  Plus,
  X,
  Send,
  History,
  Building2,
  Paperclip,
  FileText,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { TarefaWithUser, TaskPriority, TaskStatus } from '@/types/tarefas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmpresaSelectModal } from '@/components/empresas/EmpresaSelectModal';
import { supabase } from '@/integrations/supabase/client';

interface TaskDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa: TarefaWithUser | null;
  onEdit: (tarefa: TarefaWithUser) => void;
  onUpdate: (id: string, updates: Partial<TarefaWithUser>) => Promise<void>;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export function TaskDetailsModal({ 
  open, 
  onOpenChange, 
  tarefa, 
  onEdit,
  onUpdate 
}: TaskDetailsModalProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const { toast } = useToast();
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helpers to serialize metadata (temporary until dedicated tables)
  type SerializedComment = { id: string; text: string; author: string; createdAt: string };

  const parseDescricaoMeta = (descricao?: string) => {
    const safe = descricao || '';
    const keys = ['checklist:', 'comments:', 'predefined_fields:'] as const;
    let base = safe;
    let checklistJson = '[]';
    let commentsJson = '[]';
    let predefinedFieldsJson = '{}';

    const positions = keys
      .map(key => ({ key, index: safe.indexOf(key) }))
      .filter(k => k.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (positions.length > 0) {
      base = safe.slice(0, positions[0].index);
      for (let i = 0; i < positions.length; i++) {
        const current = positions[i];
        const next = positions[i + 1];
        const value = safe.slice(current.index + current.key.length, next ? next.index : safe.length);
        if (current.key === 'checklist:') checklistJson = value.trim();
        if (current.key === 'comments:') commentsJson = value.trim();
        if (current.key === 'predefined_fields:') predefinedFieldsJson = value.trim();
      }
    }

    let parsedChecklist: ChecklistItem[] = [];
    let parsedComments: Comment[] = [];
    let parsedPredefinedFields: {[key: string]: string} = {};
    try { parsedChecklist = JSON.parse(checklistJson || '[]'); } catch {}
    try {
      const temp: SerializedComment[] = JSON.parse(commentsJson || '[]');
      parsedComments = (temp || []).map(c => ({ ...c, createdAt: new Date(c.createdAt) }));
    } catch {}
    try { parsedPredefinedFields = JSON.parse(predefinedFieldsJson || '{}'); } catch {}

    return { baseDescription: base, parsedChecklist, parsedComments, parsedPredefinedFields };
  };

  const buildDescricaoWithMeta = (baseDescription: string, checklistToSave: ChecklistItem[], commentsToSave: Comment[]) => {
    const serialized: SerializedComment[] = commentsToSave.map(c => ({
      id: c.id,
      text: c.text,
      author: c.author,
      createdAt: c.createdAt.toISOString(),
    }));
    
    // Preserve existing predefined_fields when updating
    const { parsedPredefinedFields } = parseDescricaoMeta(tarefa?.descricao);
    const predefinedFieldsString = Object.keys(parsedPredefinedFields).length > 0 
      ? `predefined_fields:${JSON.stringify(parsedPredefinedFields)}` 
      : '';
    
    return `${baseDescription}checklist:${JSON.stringify(checklistToSave)}comments:${JSON.stringify(serialized)}${predefinedFieldsString}`;
  };

  // Load checklist, comments, and predefined fields when tarefa changes
  useEffect(() => {
    if (tarefa) {
      const { parsedChecklist, parsedComments } = parseDescricaoMeta(tarefa.descricao);
      setChecklist(parsedChecklist);
      setComments(parsedComments);
    }
  }, [tarefa]);

  // Helper function to get friendly field labels
  const getFieldLabel = (key: string): string => {
    const labels: {[key: string]: string} = {
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
    return labels[key] || key;
  };

  // Render predefined fields in organized sections
  const renderPredefinedFields = (fields: {[key: string]: string}) => {
    const processFields = ['numero_processo', 'data_audiencia', 'valor_causa', 'objeto_acao', 'advogado_empresa'];
    const companyFields = ['nome_fantasia_razao_social', 'cnpj', 'telefone_principal_empresa', 'segmento_atuacao', 'porte_estimado'];
    const contactFields = ['nome_socio_decisor', 'cargo', 'telefone_direto_whatsapp', 'email_decisor'];

    const renderSection = (title: string, sectionFields: string[], bgColor: string) => {
      const hasContent = sectionFields.some(field => fields[field] && fields[field].trim() !== '');
      if (!hasContent) return null;

      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <div className={`w-2 h-2 rounded-full ${bgColor}`}></div>
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <div className="space-y-2 pl-4">
            {sectionFields.map(field => {
              const value = fields[field];
              if (!value || value.trim() === '') return null;
              
              return (
                <div key={field} className="grid grid-cols-3 gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{getFieldLabel(field)}:</span>
                  <span className="text-sm col-span-2">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {renderSection('Dados do Processo', processFields, 'bg-blue-500')}
        {renderSection('Dados da Empresa', companyFields, 'bg-green-500')}
        {renderSection('Dados do Contato', contactFields, 'bg-purple-500')}
      </div>
    );
  };

  if (!tarefa) return null;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'a_fazer': return 'bg-gray-100 text-gray-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'em_revisao': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false
      };
      setChecklist(prev => [...prev, newItem]);
      setNewChecklistItem('');
      setIsAddingChecklistItem(false);
      // persist
      updateTaskMeta([...checklist, newItem], comments);
    }
  };

  const toggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    updateTaskMeta(updatedChecklist, comments);
  };

  const removeChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== id);
    setChecklist(updatedChecklist);
    updateTaskMeta(updatedChecklist, comments);
  };

  const updateTaskMeta = async (newChecklist: ChecklistItem[], newComments: Comment[]) => {
    try {
      const { baseDescription } = parseDescricaoMeta(tarefa.descricao);
      const updatedDescription = buildDescricaoWithMeta(baseDescription, newChecklist, newComments);
      await onUpdate(tarefa.id, { descricao: updatedDescription });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: tarefa.responsavel?.full_name || tarefa.responsavel?.username || 'Usuário',
        createdAt: new Date()
      };
      const updatedComments = [comment, ...comments];
      setComments(updatedComments);
      setNewComment('');
      updateTaskMeta(checklist, updatedComments);
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi adicionado com sucesso',
      });
    }
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const progress = checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-semibold">
                {tarefa.titulo}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(tarefa.prioridade)}>
                  {tarefa.prioridade}
                </Badge>
                <Badge className={getStatusColor(tarefa.status)}>
                  {tarefa.status.replace('_', ' ')}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => setEmpresaModalOpen(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  {tarefa.empresa_id ? 'Alterar empresa' : 'Vincular empresa'}
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => {
                // Passar tarefa com todos os dados necessários para edição
                onEdit({
                  ...tarefa,
                  // Garantir que todos os campos necessários estão presentes
                  responsavel_ids: tarefa.responsavel_ids || [],
                  anexos: tarefa.anexos || []
                });
              }}
              size="sm"
              variant="outline"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Tarefa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Responsável:</span>
                    {tarefa.responsaveis && tarefa.responsaveis.length > 0 ? (
                      <div className="flex items-center -space-x-2">
                        {tarefa.responsaveis.slice(0, 5).map(u => (
                          <Avatar key={u.user_id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={u.avatar_url} />
                            <AvatarFallback>
                              {(u.full_name || u.username)?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {tarefa.responsaveis.length > 5 && (
                          <div className="h-6 w-6 rounded-full bg-muted text-[10px] flex items-center justify-center">+{tarefa.responsaveis.length - 5}</div>
                        )}
                      </div>
                    ) : tarefa.responsavel ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={tarefa.responsavel.avatar_url} />
                          <AvatarFallback>
                            {tarefa.responsavel.full_name?.[0] || tarefa.responsavel.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {tarefa.responsavel.full_name || tarefa.responsavel.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Não atribuído</span>
                    )}
                  </div>
                  
                  {tarefa.data_vencimento && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Vencimento:</span>
                      <span className="text-sm">
                        {format(new Date(tarefa.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Empresa:</span>
                    <span className="text-sm text-muted-foreground">{tarefa.empresa_id || 'Não vinculada'}</span>
                  </div>
                </div>

                {tarefa.descricao && (
                  <div>
                    <span className="text-sm font-medium">Descrição:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {parseDescricaoMeta(tarefa.descricao).baseDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campos de Qualificação (Predefined Fields) */}
            {(() => {
              const { parsedPredefinedFields } = parseDescricaoMeta(tarefa.descricao);
              const hasFields = Object.keys(parsedPredefinedFields).length > 0 && 
                               Object.values(parsedPredefinedFields).some(v => v && v.trim() !== '');
              
              if (!hasFields) return null;

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>Campos de Qualificação</span>
                      <Badge variant="secondary" className="text-xs">Template VENDAS</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderPredefinedFields(parsedPredefinedFields)}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Anexos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Anexos</span>
                  <div>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!tarefa) return;
                      if (files.length === 0) return;
                      try {
                        setUploadingAnexos(true);
                        const folder = `empresa_${tarefa.empresa_id || 'sem_empresa'}/${tarefa.id}`;
                        const novos: string[] = [];
                        for (const f of files) {
                          const safe = f.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
                          const path = `${folder}/${Date.now()}_${safe}`;
                          const { data: up, error } = await supabase.storage.from('tarefas-anexos').upload(path, f, { cacheControl: '3600' });
                          if (error) throw error;
                          novos.push(up.path);
                        }
                        await onUpdate(tarefa.id, { anexos: [ ...(tarefa.anexos || []), ...novos ] });
                        toast({ title: 'Anexos enviados', description: `${files.length} arquivo(s) anexado(s).` });
                      } catch (e: any) {
                        console.error('Erro ao anexar arquivos da tarefa:', e);
                        toast({ title: 'Erro ao anexar', description: e.message || 'Falha ao enviar anexos', variant: 'destructive' });
                      } finally {
                        setUploadingAnexos(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }} />
                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingAnexos}>
                      <Paperclip className="h-4 w-4 mr-2" />
                      {uploadingAnexos ? 'Enviando...' : 'Anexar arquivos'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(tarefa.anexos && tarefa.anexos.length > 0) ? (
                  <div className="space-y-2">
                    {tarefa.anexos.map((path, idx) => (
                      <div key={`${path}-${idx}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{path.split('/').slice(-1)[0]}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              const { data, error } = await supabase.storage.from('tarefas-anexos').createSignedUrl(path, 60 * 5);
                              if (error) throw error;
                              if (data?.signedUrl) {
                                window.open(data.signedUrl, '_blank');
                              }
                            } catch {}
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhum anexo</div>
                )}
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Checklist</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {completedItems}/{checklist.length} concluídos
                    </span>
                    {checklist.length > 0 && (
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    <span 
                      className={`flex-1 text-sm ${
                        item.completed 
                          ? 'line-through text-muted-foreground' 
                          : 'text-foreground'
                      }`}
                    >
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {isAddingChecklistItem ? (
                  <div className="flex items-center gap-2">
                    <Circle className="h-5 w-5 text-muted-foreground" />
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Digite o item do checklist..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                      autoFocus
                    />
                    <Button size="sm" onClick={addChecklistItem}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setIsAddingChecklistItem(false);
                        setNewChecklistItem('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingChecklistItem(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar item
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Histórico e Comentários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário ou observação..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={addComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Adicionar Comentário
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum comentário registrado</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Modal de seleção de empresa */}
        <EmpresaSelectModal
          open={empresaModalOpen}
          onOpenChange={setEmpresaModalOpen}
          selectedEmpresaId={tarefa.empresa_id || undefined}
          onSelect={async (empresa) => {
            try {
              await onUpdate(tarefa.id, { empresa_id: empresa ? empresa.id : null as unknown as any });
              toast({ title: 'Empresa atualizada', description: empresa ? 'Vínculo alterado.' : 'Vínculo removido.' });
            } catch (e: any) {
              toast({ title: 'Erro', description: e.message || 'Falha ao vincular empresa', variant: 'destructive' });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}