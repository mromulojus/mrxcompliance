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
  History
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
import { TarefaWithUser, TaskPriority, TaskStatus, UserProfile } from '@/types/tarefas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  // Load checklist and comments when tarefa changes
  useEffect(() => {
    if (tarefa) {
      // Parse checklist from tarefa data (you might want to store this in a separate field)
      const savedChecklist = tarefa.descricao?.includes('checklist:') 
        ? JSON.parse(tarefa.descricao.split('checklist:')[1] || '[]')
        : [];
      setChecklist(savedChecklist);
      
      // Load comments (you might want to create a separate table for this)
      setComments([]);
    }
  }, [tarefa]);

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
      
      // Update task with new checklist
      updateTaskChecklist([...checklist, newItem]);
    }
  };

  const toggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    updateTaskChecklist(updatedChecklist);
  };

  const removeChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== id);
    setChecklist(updatedChecklist);
    updateTaskChecklist(updatedChecklist);
  };

  const updateTaskChecklist = async (newChecklist: ChecklistItem[]) => {
    try {
      const baseDescription = tarefa.descricao?.split('checklist:')[0] || '';
      const updatedDescription = `${baseDescription}checklist:${JSON.stringify(newChecklist)}`;
      await onUpdate(tarefa.id, { descricao: updatedDescription });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o checklist',
        variant: 'destructive',
      });
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: 'Usuário Atual', // Replace with actual user
        createdAt: new Date()
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
              </div>
            </div>
            <Button 
              onClick={() => onEdit(tarefa)}
              size="sm"
              variant="outline"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
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
                </div>

                {tarefa.descricao && !tarefa.descricao.includes('checklist:') && (
                  <div>
                    <span className="text-sm font-medium">Descrição:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tarefa.descricao.split('checklist:')[0]}
                    </p>
                  </div>
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
      </DialogContent>
    </Dialog>
  );
}