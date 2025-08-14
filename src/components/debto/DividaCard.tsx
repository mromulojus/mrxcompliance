import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AcordoManager } from "./AcordoManager";
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  Edit,
  Eye,
  MoreVertical
} from "lucide-react";
import { Divida } from "@/hooks/useDebtoData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

interface DividaCardProps {
  divida: Divida;
  compact?: boolean;
  onUpdate?: () => void;
}

export function DividaCard({ divida, compact = false, onUpdate }: DividaCardProps) {
  const { hasRole } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'negociacao':
        return 'bg-blue-100 text-blue-700';
      case 'acordado':
        return 'bg-green-100 text-green-700';
      case 'pago':
        return 'bg-green-100 text-green-700';
      case 'judicial':
        return 'bg-red-100 text-red-700';
      case 'negativado':
        return 'bg-orange-100 text-orange-700';
      case 'protestado':
        return 'bg-red-100 text-red-700';
      case 'cancelado':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstagioColor = (estagio: string) => {
    switch (estagio) {
      case 'vencimento_proximo':
        return 'bg-yellow-100 text-yellow-700';
      case 'vencido':
        return 'bg-red-100 text-red-700';
      case 'negociacao':
        return 'bg-blue-100 text-blue-700';
      case 'formal':
        return 'bg-orange-100 text-orange-700';
      case 'judicial':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calcularDiasAtraso = () => {
    const hoje = new Date();
    const vencimento = new Date(divida.data_vencimento);
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasAtraso);
  };

  const diasAtraso = calcularDiasAtraso();

  if (compact) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium truncate">{divida.origem_divida}</div>
              <div className="text-sm text-muted-foreground">
                Vencimento: {formatDate(divida.data_vencimento)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">{formatCurrency(divida.valor_atualizado)}</div>
              <Badge className={`text-xs ${getStatusColor(divida.status)}`}>
                {divida.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{divida.origem_divida}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(divida.status)}>
                {divida.status}
              </Badge>
              <Badge variant="outline" className={getEstagioColor(divida.estagio)}>
                {divida.estagio.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {hasRole('administrador') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Original</p>
            <p className="font-medium">{formatCurrency(divida.valor_original)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor Atualizado</p>
            <p className="font-bold text-primary">{formatCurrency(divida.valor_atualizado)}</p>
          </div>
        </div>

        {/* Datas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Vencimento: {formatDate(divida.data_vencimento)}</span>
          </div>
          
          {diasAtraso > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-red-600">{diasAtraso} dias em atraso</span>
            </div>
          )}
        </div>

        {/* Documentos */}
        {(divida.numero_contrato || divida.numero_nf) && (
          <div className="space-y-1 text-sm">
            {divida.numero_contrato && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Contrato: {divida.numero_contrato}</span>
              </div>
            )}
            {divida.numero_nf && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>NF: {divida.numero_nf}</span>
              </div>
            )}
          </div>
        )}

        {/* Score de Urgência */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Score de Urgência</span>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            {divida.urgency_score}/100
          </Badge>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Detalhes
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            Cobrança
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}