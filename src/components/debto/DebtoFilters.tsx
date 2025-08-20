import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Empresa } from "@/hooks/useDebtoData";

interface DebtoFiltersProps {
  empresas: Empresa[];
  selectedEmpresa: string;
  onEmpresaChange: (empresaId: string) => void;
}

export function DebtoFilters({ empresas, selectedEmpresa, onEmpresaChange }: DebtoFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa</Label>
        <Select value={selectedEmpresa === '' ? 'all' : selectedEmpresa} onValueChange={(value) => onEmpresaChange(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="negociacao">Negociação</SelectItem>
            <SelectItem value="acordado">Acordado</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="judicial">Judicial</SelectItem>
            <SelectItem value="negativado">Negativado</SelectItem>
            <SelectItem value="protestado">Protestado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estagio">Estágio</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Todos os estágios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estágios</SelectItem>
            <SelectItem value="vencimento_proximo">Vencimento Próximo</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="negociacao">Negociação</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="judicial">Judicial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgencia">Urgência</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Todas as urgências" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as urgências</SelectItem>
            <SelectItem value="critico">Crítico (80-100)</SelectItem>
            <SelectItem value="alto">Alto (60-79)</SelectItem>
            <SelectItem value="medio">Médio (40-59)</SelectItem>
            <SelectItem value="baixo">Baixo (0-39)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}