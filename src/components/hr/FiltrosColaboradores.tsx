import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useHR } from '@/context/HRContext';

export function FiltrosColaboradores() {
  const { filtros, setFiltros, empresas, colaboradores } = useHR();

  // Obter departamentos únicos
  const departamentos = Array.from(new Set(colaboradores.map(c => c.departamento)));

  const limparFiltros = () => {
    setFiltros({
      nome: '',
      status: '',
      empresa: '',
      departamento: ''
    });
  };

  const temFiltrosAtivos = Object.values(filtros).some(valor => valor !== '');

  return (
    <div className="space-y-4">
      {/* Filtros principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar por nome..."
          value={filtros.nome}
          onChange={(e) => setFiltros({ nome: e.target.value })}
          className="w-full"
        />
        
        <Select value={filtros.status} onValueChange={(value) => setFiltros({ status: value === 'todos' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ATIVO">Ativo</SelectItem>
            <SelectItem value="INATIVO">Inativo</SelectItem>
            <SelectItem value="DEMITIDO">Demitido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtros.empresa} onValueChange={(value) => setFiltros({ empresa: value === 'todas' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as empresas</SelectItem>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.departamento} onValueChange={(value) => setFiltros({ departamento: value === 'todos' ? '' : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os departamentos</SelectItem>
            {departamentos.map((depto) => (
              <SelectItem key={depto} value={depto}>
                {depto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chips de filtros ativos */}
      {temFiltrosAtivos && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros ativos:
          </div>
          
          {filtros.nome && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Nome: {filtros.nome}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFiltros({ nome: '' })}
              />
            </Badge>
          )}
          
          {filtros.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filtros.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFiltros({ status: '' })}
              />
            </Badge>
          )}
          
          {filtros.empresa && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Empresa: {empresas.find(e => e.id === filtros.empresa)?.nome}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFiltros({ empresa: '' })}
              />
            </Badge>
          )}
          
          {filtros.departamento && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Depto: {filtros.departamento}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFiltros({ departamento: '' })}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="h-6 px-2 text-xs"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
}