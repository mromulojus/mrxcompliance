import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreVertical, Edit, Eye, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Colaborador } from '@/types/hr';
import { useHR } from '@/context/HRContext';
import { calcularRescisaoColaborador, calcularValorPrevisto } from '@/lib/rescisao';
import { VisualizacaoColaboradorCompleta } from './VisualizacaoColaboradorCompleta';
import { EtiquetasColaborador } from './EtiquetasColaborador';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ColaboradorCardProps {
  colaborador: Colaborador;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ColaboradorCard({ colaborador, onEdit, onView }: ColaboradorCardProps) {
  const { removerColaborador, empresas } = useHR();
  const [showVisualizacao, setShowVisualizacao] = useState(false);
  const { can } = useAuth();
  
  const iniciais = colaborador.nome
    .split(' ')
    .map(nome => nome[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const empresa = empresas.find(e => e.id === colaborador.empresa);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INATIVO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DEMITIDO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRemover = () => {
    if (window.confirm(`Tem certeza que deseja remover ${colaborador.nome}?`)) {
      removerColaborador(colaborador.id);
    }
  };

  // Calcular rescisão
  const rescisao = calcularRescisaoColaborador(colaborador);
  const valorRescisao = 'totalEstimado' in rescisao ? parseFloat(rescisao.totalEstimado) : 0;
  const valorPrevisto = calcularValorPrevisto(valorRescisao);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {iniciais}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{colaborador.nome}</h3>
            <p className="text-xs text-muted-foreground">{colaborador.cargo}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowVisualizacao(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(colaborador.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleRemover}
              className="text-red-600 focus:text-red-600"
            >
              <UserX className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Etiquetas */}
        <EtiquetasColaborador colaborador={colaborador} size="sm" />
        
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(colaborador.status)}>
            {colaborador.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {colaborador.departamento}
          </span>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Email:</p>
          <p className="text-sm truncate">{colaborador.email}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Empresa:</p>
          <p className="text-sm">{empresa?.nome || 'N/A'}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Salário Base:</p>
          <p className="text-sm font-medium">
            {colaborador.salario_base.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
        </div>
        
        {can('view:rescisao') && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Rescisão Estimada:</p>
            <p className="text-sm font-medium text-red-600">
              {valorRescisao.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Previsto: {valorPrevisto.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>
        )}
      </CardContent>

      {showVisualizacao && (
        <Dialog open={showVisualizacao} onOpenChange={setShowVisualizacao}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
            <VisualizacaoColaboradorCompleta 
              colaborador={colaborador}
              onClose={() => setShowVisualizacao(false)}
              onEdit={(id) => {
                setShowVisualizacao(false);
                onEdit?.(id);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}