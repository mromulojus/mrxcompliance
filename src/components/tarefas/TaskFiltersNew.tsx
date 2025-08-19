import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TaskFilters, UserProfile } from '@/types/tarefas';
import { supabase } from '@/integrations/supabase/client';
import type { Department } from '@/types/departments';
import type { Department } from '@/types/departments';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  users: UserProfile[];
}

export function TaskFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  users 
}: TaskFiltersProps) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(filters.busca || '');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('busca', searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    // Convert "all" values back to undefined for filtering
    const filterValue = value === 'all' ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.rpc('my_departments');
      const unique: Record<string, Department> = {};
      (data || []).forEach((d: any) => {
        unique[d.department_id] = {
          id: d.department_id,
          company_id: d.company_id,
          name: d.name,
          slug: d.slug,
          color: d.color,
          business_unit: d.business_unit,
          is_active: d.is_active,
        } as Department;
      });
      setDepartments(Object.values(unique));
    };
    void fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.rpc('my_departments');
      const unique: Record<string, Department> = {};
      (data || []).forEach((d: any) => {
        unique[d.department_id] = {
          id: d.department_id,
          company_id: d.company_id,
          name: d.name,
          slug: d.slug,
          color: d.color,
          business_unit: d.business_unit,
          is_active: d.is_active,
        } as Department;
      });
      setDepartments(Object.values(unique));
    };
    void fetchDepartments();
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.busca) count++;
    if (filters.prioridade) count++;
    if (filters.modulo) count++;
    if (filters.status) count++;
    if (filters.responsavel) count++;
    if (filters.empresa) count++;
    if (filters.department) count++;
    return count;
  }, [filters]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Filtros</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-2 lg:px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tarefas, responsáveis..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* Priority Filter */}
            <Select
              value={filters.prioridade || 'all'}
              onValueChange={(value) => handleFilterChange('prioridade', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="alta">🔴 Alta</SelectItem>
                <SelectItem value="media">🟡 Média</SelectItem>
                <SelectItem value="baixa">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>

            {/* Module Filter */}
            <Select
              value={filters.modulo || 'all'}
              onValueChange={(value) => handleFilterChange('modulo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="ouvidoria">Ouvidoria</SelectItem>
                <SelectItem value="auditoria">Auditoria</SelectItem>
                <SelectItem value="cobrancas">Cobranças</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="a_fazer">A Fazer</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="em_revisao">Em Revisão</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            {/* Responsible Filter */}
            <Select
              value={filters.responsavel || 'all'}
              onValueChange={(value) => handleFilterChange('responsavel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {currentUser && (
                  <SelectItem value={currentUser}>Minhas Tarefas</SelectItem>
                )}
                <SelectItem value="unassigned">Não Atribuídas</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select
              value={filters.department || 'all'}
              onValueChange={(value) => handleFilterChange('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.busca && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {filters.busca}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchValue('');
                      handleFilterChange('busca', '');
                    }}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.prioridade && (
                <Badge variant="secondary" className="gap-1">
                  Prioridade: {filters.prioridade}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('prioridade', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.modulo && (
                <Badge variant="secondary" className="gap-1">
                  Módulo: {filters.modulo}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('modulo', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('status', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.responsavel && (
                <Badge variant="secondary" className="gap-1">
                  Responsável: {
                    filters.responsavel === 'unassigned' ? 'Não atribuídas' :
                    filters.responsavel === currentUser ? 'Minhas tarefas' :
                    users.find(u => u.user_id === filters.responsavel)?.full_name || 'Usuário'
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('responsavel', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {filters.department && (
                <Badge variant="secondary" className="gap-1">
                  Departamento: {departments.find(d => d.id === filters.department)?.name || 'Selecionado'}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('department', 'all')}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}