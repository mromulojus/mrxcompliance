import { Badge } from '@/components/ui/badge';
import { Colaborador } from '@/types/hr';
import { cn } from '@/lib/utils';
import { Clock, Shield, UserCheck, AlertTriangle } from 'lucide-react';

interface EtiquetasColaboradorProps {
  colaborador: Colaborador;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EtiquetasColaborador({ colaborador, size = 'sm', className }: EtiquetasColaboradorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DESLIGADO':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EM_CONTRATACAO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContratoColor = (tipo: string) => {
    switch (tipo) {
      case 'CLT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PJ':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ESTAGIO':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {/* Status Detalhado */}
      <Badge 
        variant="outline" 
        className={cn(
          sizeClasses[size],
          getStatusColor(colaborador.etiquetas?.status_detalhado || colaborador.status)
        )}
      >
        <UserCheck className="h-3 w-3 mr-1" />
        {colaborador.etiquetas?.status_detalhado || colaborador.status}
      </Badge>

      {/* Tipo de Contrato Detalhado */}
      <Badge 
        variant="outline" 
        className={cn(
          sizeClasses[size],
          getContratoColor(colaborador.etiquetas?.tipo_contrato_detalhado || colaborador.tipo_contrato)
        )}
      >
        <Shield className="h-3 w-3 mr-1" />
        {colaborador.etiquetas?.tipo_contrato_detalhado || colaborador.tipo_contrato}
      </Badge>

      {/* Due Diligence */}
      {colaborador.etiquetas?.due_diligence && (
        <Badge 
          variant="outline" 
          className={cn(
            sizeClasses[size],
            'bg-yellow-100 text-yellow-800 border-yellow-200'
          )}
        >
          <Clock className="h-3 w-3 mr-1" />
          AGD DUE DILIGENCE
        </Badge>
      )}

      {/* Perfil Comportamental */}
      {colaborador.perfil_comportamental?.tipo_perfil && (
        <Badge 
          variant="outline" 
          className={cn(
            sizeClasses[size],
            'bg-indigo-100 text-indigo-800 border-indigo-200'
          )}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          {colaborador.perfil_comportamental.tipo_perfil}
        </Badge>
      )}
    </div>
  );
}