import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Clock, User, Tag, Circle, Plus, X } from 'lucide-react';
import { TaskFormData, UserProfile } from '@/types/tarefas';
import { format } from 'date-fns';

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  users: UserProfile[];
  defaultValues?: Partial<TaskFormData>;
}

export function TaskFormModal({ open, onOpenChange, onSubmit, users, defaultValues }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    titulo: '',
    descricao: '',
    status: 'a_fazer',
    prioridade: 'media',
    modulo_origem: 'geral',
    ...defaultValues,
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [initialChecklist, setInitialChecklist] = useState<string[]>(['']);

  const addChecklistItem = () => {
    setInitialChecklist(prev => [...prev, '']);
  };

  const removeChecklistItem = (index: number) => {
    setInitialChecklist(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare checklist data
    const validChecklistItems = initialChecklist.filter(item => item.trim() !== '');
    const checklistData = validChecklistItems.map((text, index) => ({
      id: Date.now() + index,
      text: text.trim(),
      completed: false
    }));

    let finalDescription = formData.descricao || '';
    if (checklistData.length > 0) {
      finalDescription += `checklist:${JSON.stringify(checklistData)}`;
    }

    const taskData: TaskFormData = {
      ...formData,
      descricao: finalDescription,
      data_vencimento: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    };

    onSubmit(taskData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      descricao: '',
      status: 'a_fazer',
      prioridade: 'media',
      modulo_origem: 'geral',
      ...defaultValues,
    });
    setSelectedDate(undefined);
    setInitialChecklist(['']);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ➕ Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Revisar relatório mensal, Implementar nova funcionalidade..."
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva a tarefa..."
              className="min-h-[100px]"
            />
          </div>

          {/* Checklist Inicial */}
          <div className="space-y-2">
            <Label>Checklist Inicial (opcional)</Label>
            <div className="space-y-2">
              {initialChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newChecklist = [...initialChecklist];
                      newChecklist[index] = e.target.value;
                      setInitialChecklist(newChecklist);
                    }}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChecklistItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChecklistItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar item ao checklist
              </Button>
            </div>
          </div>

          {/* Grid com Prioridade e Módulo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select 
                value={formData.prioridade} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🟡 Média</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modulo">Módulo</Label>
              <Select 
                value={formData.modulo_origem} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, modulo_origem: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">📋 Geral</SelectItem>
                  <SelectItem value="ouvidoria">📢 Ouvidoria</SelectItem>
                  <SelectItem value="auditoria">🔍 Auditoria</SelectItem>
                  <SelectItem value="cobrancas">💰 Cobranças</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid com Responsável e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select 
                value={formData.responsavel_id || 'none'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value === 'none' ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_fazer">📋 A Fazer</SelectItem>
                  <SelectItem value="em_andamento">🔄 Em Andamento</SelectItem>
                  <SelectItem value="em_revisao">👀 Em Revisão</SelectItem>
                  <SelectItem value="concluido">✅ Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="data_vencimento">Data de Vencimento</Label>
            <Input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}