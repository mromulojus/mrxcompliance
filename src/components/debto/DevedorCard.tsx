import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  MessageCircle, 
  Edit,
  Eye,
  MoreVertical
} from "lucide-react";
import { Devedor, useDebtoData } from "@/hooks/useDebtoData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

interface DevedorCardProps {
  devedor: Devedor;
  compact?: boolean;
  onUpdate?: () => void;
}

export function DevedorCard({ devedor, compact = false, onUpdate }: DevedorCardProps) {
  const { hasRole } = useAuth();
  const { dividas } = useDebtoData();

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'whatsapp':
        return <MessageCircle className="w-3 h-3" />;
      case 'telefone':
        return <Phone className="w-3 h-3" />;
      case 'email':
        return <Mail className="w-3 h-3" />;
      default:
        return <Phone className="w-3 h-3" />;
    }
  };

  const handleContact = (type: 'phone' | 'whatsapp' | 'email') => {
    switch (type) {
      case 'phone':
        if (devedor.telefone_principal) {
          window.open(`tel:${devedor.telefone_principal}`);
        }
        break;
      case 'whatsapp':
        if (devedor.telefone_whatsapp) {
          const cleanPhone = devedor.telefone_whatsapp.replace(/\D/g, '');
          window.open(`https://wa.me/55${cleanPhone}`);
        }
        break;
      case 'email':
        if (devedor.email_principal) {
          window.open(`mailto:${devedor.email_principal}`);
        }
        break;
    }
  };

  const calcularEstatisticasDevedor = () => {
    const dividasDevedor = dividas.filter(d => d.devedor_id === devedor.id);
    const total = dividasDevedor.reduce((acc, d) => acc + d.valor_atualizado, 0);
    const maisAntiga = dividasDevedor
      .filter(d => new Date(d.data_vencimento) < new Date())
      .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0];

    const diasVencimento = maisAntiga ? 
      Math.floor((new Date().getTime() - new Date(maisAntiga.data_vencimento).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      totalDividas: total,
      diasMaisAntiga: diasVencimento
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const stats = calcularEstatisticasDevedor();

  if (compact) {
    return (
      <Card 
        className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => window.location.href = `/devedor/${devedor.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(devedor.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{devedor.nome}</div>
              <div className="text-sm text-muted-foreground">{devedor.documento}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Valor Dívida</div>
              <div className="font-bold text-destructive text-sm">
                {formatCurrency(stats.totalDividas)}
              </div>
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
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(devedor.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">{devedor.nome}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {devedor.tipo_pessoa === 'FISICA' ? 'CPF' : 'CNPJ'}
                </Badge>
                <span className="text-sm text-muted-foreground">{devedor.documento}</span>
              </div>
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
                <DropdownMenuItem onClick={() => window.location.href = `/devedor/${devedor.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/devedor/${devedor.id}/editar`, '_blank')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valor da Dívida Atualizada */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Valor da Dívida Atualizada</span>
          <Badge className="bg-red-100 text-red-700">
            {formatCurrency(stats.totalDividas)}
          </Badge>
        </div>

        {/* Estatísticas de Dívidas */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Total em Dívidas</p>
            <p className="font-bold text-primary text-sm">{formatCurrency(stats.totalDividas)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dias Vencida</p>
            <p className={`font-bold text-sm ${stats.diasMaisAntiga > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.diasMaisAntiga > 0 ? `${stats.diasMaisAntiga} dias` : 'Em dia'}
            </p>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-2">
          {devedor.telefone_principal && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{formatPhone(devedor.telefone_principal)}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleContact('phone')}
                className="p-1 h-auto"
              >
                <Phone className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {devedor.telefone_whatsapp && (
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span className="flex-1">{formatPhone(devedor.telefone_whatsapp)}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleContact('whatsapp')}
                className="p-1 h-auto text-green-600 hover:text-green-700"
              >
                <MessageCircle className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {devedor.email_principal && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 truncate">{devedor.email_principal}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleContact('email')}
                className="p-1 h-auto"
              >
                <Mail className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Endereço */}
        {(devedor.cidade || devedor.endereco_completo) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              {devedor.cidade && (
                <div className="font-medium">{devedor.cidade}, {devedor.estado}</div>
              )}
              {devedor.endereco_completo && (
                <div className="text-muted-foreground text-xs truncate">
                  {devedor.endereco_completo}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local de Trabalho */}
        {devedor.local_trabalho && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 truncate">{devedor.local_trabalho}</span>
          </div>
        )}

        {/* Canal Preferencial */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Canal Preferencial</span>
          <Badge variant="outline" className="text-xs">
            {getCanalIcon(devedor.canal_preferencial)}
            <span className="ml-1 capitalize">{devedor.canal_preferencial}</span>
          </Badge>
        </div>

        {/* Ações Rápidas */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => handleContact(devedor.canal_preferencial as 'phone' | 'whatsapp' | 'email')}
          >
            {getCanalIcon(devedor.canal_preferencial)}
            <span className="ml-1">Contatar</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => window.location.href = `/devedor/${devedor.id}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            Dívidas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}