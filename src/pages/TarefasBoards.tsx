import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';

export default function TarefasBoards() {
  const navigate = useNavigate();
  const { boards, createBoard, deleteBoard } = useTaskBoards();
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const { profile } = useAuth();

  type TemplateKey = 'VENDAS' | 'COMPLIANCE' | 'JURIDICO' | 'OUVIDORIA' | 'COBRANCA' | 'ADMINISTRATIVO';
  const templates: Record<TemplateKey, { name: string; columns: string[]; cardDefault?: any; empresaMatch?: string | null }> = {
    VENDAS: { name: 'Vendas (xGROWTH)', columns: ['Leads', 'Qualificados', 'Proposta', 'Fechamento', 'Ganho', 'Perdido'], cardDefault: { prioridade: 'media', modulo_origem: 'geral' } },
    COMPLIANCE: { name: 'Compliance (Mrx Compliance)', columns: ['A Fazer', 'Em Análise', 'Investigação', 'Revisão', 'Concluído'], cardDefault: { modulo_origem: 'auditoria', prioridade: 'alta' } },
    JURIDICO: { name: 'Jurídico (MR Advocacia)', columns: ['A Fazer', 'Prazos', 'Em Andamento', 'Em Revisão', 'Concluído'], cardDefault: { modulo_origem: 'geral' } },
    OUVIDORIA: { name: 'Ouvidoria (Ouve.ai)', columns: ['Recebido', 'Em Análise', 'Investigação', 'Ação', 'Concluído'], cardDefault: { modulo_origem: 'ouvidoria', prioridade: 'alta' } },
    COBRANCA: { name: 'Cobrança (Debto)', columns: ['Novo', 'Contato', 'Negociação', 'Acordo', 'Pago'], cardDefault: { modulo_origem: 'cobrancas' } },
    ADMINISTRATIVO: { name: 'Administrativo (Geral)', columns: ['Backlog', 'A Fazer', 'Em Andamento', 'Revisão', 'Concluído'], cardDefault: { modulo_origem: 'geral' } },
  };
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null);

  const handleCreate = async () => {
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard(newBoardName.trim());
      // If chosen template, create columns and set card default via direct Supabase calls
      const key = selectedTemplate;
      if (key) {
        const tpl = templates[key];
        const sb = (await import('@/integrations/supabase/client')).supabase as any;
        // Create columns in order
        for (let i = 0; i < tpl.columns.length; i++) {
          const name = tpl.columns[i];
          await sb.from('task_columns').insert({ board_id: board.id, name, order_index: i });
        }
        await sb.from('task_boards').update({ card_default: tpl.cardDefault || null }).eq('id', board.id);
      }
      setNewBoardName('');
      setSelectedTemplate(null);
      navigate(`/tarefas/quadros/${board.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quadros de Tarefas</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie quadros de tarefas.</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Template</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-3">
                <Label>Escolha um template</Label>
                <Select value={selectedTemplate || ''} onValueChange={(v) => setSelectedTemplate(v as TemplateKey)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum (em branco)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="VENDAS">Vendas (xGROWTH)</SelectItem>
                    <SelectItem value="COMPLIANCE">Compliance (Mrx Compliance)</SelectItem>
                    <SelectItem value="JURIDICO">Jurídico (MR Advocacia)</SelectItem>
                    <SelectItem value="OUVIDORIA">Ouvidoria (Ouve.ai)</SelectItem>
                    <SelectItem value="COBRANCA">Cobrança (Debto)</SelectItem>
                    <SelectItem value="ADMINISTRATIVO">Administrativo (Geral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Nome do novo quadro"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleCreate} disabled={creating || !newBoardName.trim()}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Quadro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Card key={board.id} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/tarefas/quadros/${board.id}`)}>
            <CardHeader>
              <CardTitle>{board.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Atualizado em {new Date(board.updated_at).toLocaleDateString('pt-BR')}</span>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); void deleteBoard(board.id); }}>Excluir</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

