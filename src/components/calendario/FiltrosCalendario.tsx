import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Filter, X, Clock, AlertTriangle } from 'lucide-react';
import { 
  FiltrosCalendario as FiltrosType, 
  TIPOS_EVENTO_LABELS, 
  MODULOS_LABELS,
  CORES_POR_TIPO 
} from '@/hooks/useCalendarioUnificado';
import { useHR } from '@/context/HRContext';

interface FiltrosCalendarioProps {
  filtros: FiltrosType;
  onFiltrosChange: (filtros: FiltrosType) => void;
  onLimparFiltros: () => void;
  estatisticas: {
    total: number;
    vencidos: number;
    proximosSete: number;
    concluidos: number;
    porModulo: Record<string, number>;
    porTipo: Record<string, number>;
  };
}

export const FiltrosCalendario: React.FC<FiltrosCalendarioProps> = ({
  filtros,
  onFiltrosChange,
  onLimparFiltros,
  estatisticas
}) => {
  const { empresas } = useHR();

  const handleModuloToggle = (modulo: string, checked: boolean) => {
    const modulosAtuais = filtros.modulo_origem || [];
    const novosModulos = checked 
      ? [...modulosAtuais, modulo]
      : modulosAtuais.filter(m => m !== modulo);
    
    onFiltrosChange({ ...filtros, modulo_origem: novosModulos });
  };

  const handleTipoToggle = (tipo: string, checked: boolean) => {
    const tiposAtuais = filtros.tipo_evento || [];
    const novosTipos = checked 
      ? [...tiposAtuais, tipo]
      : tiposAtuais.filter(t => t !== tipo);
    
    onFiltrosChange({ ...filtros, tipo_evento: novosTipos });
  };

  const handlePrioridadeToggle = (prioridade: string, checked: boolean) => {
    const prioridadesAtuais = filtros.prioridade || [];
    const novasPrioridades = checked 
      ? [...prioridadesAtuais, prioridade]
      : prioridadesAtuais.filter(p => p !== prioridade);
    
    onFiltrosChange({ ...filtros, prioridade: novasPrioridades });
  };

  const handleStatusToggle = (status: string, checked: boolean) => {
    const statusAtuais = filtros.status || [];
    const novosStatus = checked 
      ? [...statusAtuais, status]
      : statusAtuais.filter(s => s !== status);
    
    onFiltrosChange({ ...filtros, status: novosStatus });
  };

  const filtrosAtivos = 
    (filtros.modulo_origem?.length || 0) +
    (filtros.tipo_evento?.length || 0) +
    (filtros.prioridade?.length || 0) +
    (filtros.status?.length || 0) +
    (filtros.empresa_id ? 1 : 0) +
    (filtros.data_inicio ? 1 : 0) +
    (filtros.data_fim ? 1 : 0) +
    (filtros.apenas_vencidos ? 1 : 0) +
    (filtros.apenas_proximos ? 1 : 0);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros do Calendário
          {filtrosAtivos > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filtrosAtivos} ativos
            </Badge>
          )}
        </CardTitle>
        {filtrosAtivos > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLimparFiltros}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{estatisticas.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-700">{estatisticas.vencidos}</p>
              <p className="text-xs text-red-600">Vencidos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-700">{estatisticas.proximosSete}</p>
              <p className="text-xs text-yellow-600">Próximos 7 dias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-green-700">{estatisticas.concluidos}</p>
              <p className="text-xs text-green-600">Concluídos</p>
            </div>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filtros.apenas_vencidos ? "default" : "outline"}
            size="sm"
            onClick={() => onFiltrosChange({ 
              ...filtros, 
              apenas_vencidos: !filtros.apenas_vencidos,
              apenas_proximos: false 
            })}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Vencidos ({estatisticas.vencidos})
          </Button>
          
          <Button
            variant={filtros.apenas_proximos ? "default" : "outline"}
            size="sm"
            onClick={() => onFiltrosChange({ 
              ...filtros, 
              apenas_proximos: !filtros.apenas_proximos,
              apenas_vencidos: false 
            })}
          >
            <Clock className="h-4 w-4 mr-1" />
            Próximos 7 dias ({estatisticas.proximosSete})
          </Button>
        </div>

        {/* Empresa */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Empresa</Label>
          <Select 
            value={filtros.empresa_id || ""}
            onValueChange={(value) => onFiltrosChange({ 
              ...filtros, 
              empresa_id: value || undefined 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Início</Label>
            <Input
              type="date"
              value={filtros.data_inicio || ""}
              onChange={(e) => onFiltrosChange({ 
                ...filtros, 
                data_inicio: e.target.value || undefined 
              })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Fim</Label>
            <Input
              type="date"
              value={filtros.data_fim || ""}
              onChange={(e) => onFiltrosChange({ 
                ...filtros, 
                data_fim: e.target.value || undefined 
              })}
            />
          </div>
        </div>

        {/* Módulos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Módulos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(MODULOS_LABELS).map(([modulo, label]) => (
              <div key={modulo} className="flex items-center space-x-2">
                <Checkbox
                  id={`modulo-${modulo}`}
                  checked={filtros.modulo_origem?.includes(modulo) || false}
                  onCheckedChange={(checked) => 
                    handleModuloToggle(modulo, checked as boolean)
                  }
                />
                <Label htmlFor={`modulo-${modulo}`} className="text-sm">
                  {label}
                  {estatisticas.porModulo[modulo] && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {estatisticas.porModulo[modulo]}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Evento */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipos de Evento</Label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {Object.entries(TIPOS_EVENTO_LABELS).map(([tipo, label]) => {
              const corInfo = CORES_POR_TIPO[tipo as keyof typeof CORES_POR_TIPO];
              return (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tipo-${tipo}`}
                    checked={filtros.tipo_evento?.includes(tipo) || false}
                    onCheckedChange={(checked) => 
                      handleTipoToggle(tipo, checked as boolean)
                    }
                  />
                  <Label htmlFor={`tipo-${tipo}`} className="text-sm flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: corInfo?.cor || '#6B7280' }}
                    />
                    {label}
                    {estatisticas.porTipo[tipo] && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {estatisticas.porTipo[tipo]}
                      </Badge>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prioridade */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Prioridade</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { valor: 'alta', label: 'Alta', cor: 'bg-red-500' },
              { valor: 'media', label: 'Média', cor: 'bg-yellow-500' },
              { valor: 'baixa', label: 'Baixa', cor: 'bg-green-500' }
            ].map(({ valor, label, cor }) => (
              <div key={valor} className="flex items-center space-x-2">
                <Checkbox
                  id={`prioridade-${valor}`}
                  checked={filtros.prioridade?.includes(valor) || false}
                  onCheckedChange={(checked) => 
                    handlePrioridadeToggle(valor, checked as boolean)
                  }
                />
                <Label htmlFor={`prioridade-${valor}`} className="text-sm flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${cor}`} />
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { valor: 'pendente', label: 'Pendente' },
              { valor: 'concluido', label: 'Concluído' },
              { valor: 'cancelado', label: 'Cancelado' }
            ].map(({ valor, label }) => (
              <div key={valor} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${valor}`}
                  checked={filtros.status?.includes(valor) || false}
                  onCheckedChange={(checked) => 
                    handleStatusToggle(valor, checked as boolean)
                  }
                />
                <Label htmlFor={`status-${valor}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};