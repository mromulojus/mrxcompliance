import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/types/tarefas';
import { supabase } from '@/integrations/supabase/client';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
}

export function TaskFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: TaskFiltersProps) {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from('profiles').select('user_id, username').order('username');
      setUsers((data || []).map((u) => ({ id: u.user_id as string, name: (u.username as string) || 'Sem nome' })));
    };
    loadUsers();
  }, []);
  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== ''
  );

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.busca || ''}
            onChange={(e) => handleFilterChange('busca', e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.prioridade || ''}
          onValueChange={(value) => handleFilterChange('prioridade', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="alta">🔴 Alta</SelectItem>
            <SelectItem value="media">🟡 Média</SelectItem>
            <SelectItem value="baixa">🟢 Baixa</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.modulo || ''}
          onValueChange={(value) => handleFilterChange('modulo', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="geral">Geral</SelectItem>
            <SelectItem value="ouvidoria">Ouvidoria</SelectItem>
            <SelectItem value="auditoria">Auditoria</SelectItem>
            <SelectItem value="cobrancas">Cobranças</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="a_fazer">A Fazer</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="em_revisao">Em Revisão</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.responsavel || ''}
          onValueChange={(value) => handleFilterChange('responsavel', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="current_user">Minhas Tarefas</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}