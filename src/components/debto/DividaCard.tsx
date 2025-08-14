import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  FileText,
  MoreVertical,
  History
} from "lucide-react";
import { Divida } from "@/hooks/useDebtoData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

interface DividaCardProps {
  divida: Divida;
  compact?: boolean;
  onUpdate?: () => void;
}

export function DividaCard({ divida, compact = false, onUpdate }: DividaCardProps) {
  const { can } = useSupabaseAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysOverdue = (vencimento: string) => {
    const today = new Date();
    const dueDate = new Date(vencimento);
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-700',
      'negociacao': 'bg-blue-100 text-blue-700',
      'acordado': 'bg-purple-100 text-purple-700',
      'pago': 'bg-green-100 text-green-700',
      'judicial': 'bg-red-100 text-red-700',
      'negativado': 'bg-orange-100 text-orange-700',
      'protestado': 'bg-red-200 text-red-800',
      'cancelado': 'bg-gray-100 text-gray-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getEstagioColor = (estagio: string) => {
    const colors = {
      'vencimento_proximo': 'bg-yellow-100 text-yellow-700',
      'vencido': 'bg-orange-100 text-orange-700',
      'negociacao': 'bg-blue-100 text-blue-700',
      'formal': 'bg-purple-100 text-purple-700',
      'judicial': 'bg-red-100 text-red-700'
    };
    return colors[estagio as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getUrgencyLevel = (score: number) => {
    if (score >= 80) return { level: 'Crítico', color: 'text-red-600' };
    if (score >= 60) return { level: 'Alto', color: 'text-orange-600' };
    if (score >= 40) return { level: 'Médio', color: 'text-yellow-600' };
    return { level: 'Baixo', color: 'text-green-600' };
  };

  const daysOverdue = getDaysOverdue(divida.data_vencimento);
  const urgency = getUrgencyLevel(divida.urgency_score);
  const isOverdue = daysOverdue > 0 && divida.status !== 'pago';

  if (compact) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{divida.origem_divida}</span>
                <Badge className={`text-xs ${getStatusColor(divida.status)}`}>
                  {divida.status}
                </Badge>
              </div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(divida.valor_atualizado)}
              </div>
              <div className="text-xs text-muted-foreground">
                Venc: {formatDate(divida.data_vencimento)}
                {isOverdue && <span className="text-red-600 ml-1">({daysOverdue}d em atraso)</span>}
              </div>
            </div>
            {divida.urgency_score > 70 && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
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
            <CardTitle className="text-lg leading-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {divida.origem_divida}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {divida.numero_contrato && (
                <Badge variant="outline" className="text-xs">
                  Contrato: {divida.numero_contrato}
                </Badge>
              )}
              {divida.numero_nf && (
                <Badge variant="outline" className="text-xs">
                  NF: {divida.numero_nf}
                </Badge>
              )}
            </div>
          </div>
          
          {can('administrador') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <History className="w-4 h-4 mr-2" />
                  Histórico
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Documentos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valores */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor Original</span>
            <span className="font-medium">{formatCurrency(divida.valor_original)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor Atualizado</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(divida.valor_atualizado)}</span>
          </div>
          
          {(divida.valor_multa > 0 || divida.valor_juros > 0 || divida.valor_correcao > 0) && (
            <div className="text-xs text-muted-foreground space-y-1 pl-2 border-l-2 border-border/50">
              {divida.valor_multa > 0 && (
                <div className="flex justify-between">
                  <span>Multa:</span>
                  <span>{formatCurrency(divida.valor_multa)}</span>
                </div>
              )}
              {divida.valor_juros > 0 && (
                <div className="flex justify-between">
                  <span>Juros:</span>
                  <span>{formatCurrency(divida.valor_juros)}</span>
                </div>
              )}
              {divida.valor_correcao > 0 && (
                <div className="flex justify-between">
                  <span>Correção:</span>
                  <span>{formatCurrency(divida.valor_correcao)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data de Vencimento */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1">Vencimento: {formatDate(divida.data_vencimento)}</span>
          {isOverdue && (
            <Badge className="bg-red-100 text-red-700 text-xs">
              {daysOverdue}d em atraso
            </Badge>
          )}
        </div>

        {/* Status e Estágio */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(divida.status)}>
            {divida.status.charAt(0).toUpperCase() + divida.status.slice(1)}
          </Badge>
          <Badge className={getEstagioColor(divida.estagio)} variant="outline">
            {divida.estagio.replace('_', ' ').charAt(0).toUpperCase() + divida.estagio.replace('_', ' ').slice(1)}
          </Badge>
        </div>

        {/* Score de Urgência */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Urgência</span>
            <span className={`font-medium ${urgency.color}`}>
              {urgency.level} ({divida.urgency_score}/100)
            </span>
          </div>
          <Progress value={divida.urgency_score} className="h-2" />
        </div>

        {/* Datas Especiais */}
        {(divida.data_negativacao || divida.data_protesto) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {divida.data_negativacao && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-orange-500" />
                <span>Negativado em: {formatDate(divida.data_negativacao)}</span>
              </div>
            )}
            {divida.data_protesto && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span>Protestado em: {formatDate(divida.data_protesto)}</span>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <History className="w-3 h-3 mr-1" />
            Histórico
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Docs
          </Button>
          {can('administrador') && (
            <Button size="sm" className="flex-1 text-xs bg-primary/10 text-primary hover:bg-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Ação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}