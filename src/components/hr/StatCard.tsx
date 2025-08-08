import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Shield, Calendar } from 'lucide-react';

interface StatCardProps {
  titulo: string;
  valor: number;
  icone: 'users' | 'shield' | 'calendar' | 'trending';
  tipo?: 'default' | 'progress';
  progresso?: number;
  cor?: 'primary' | 'success' | 'warning' | 'danger';
}

const iconMap = {
  users: Users,
  shield: Shield,
  calendar: Calendar,
  trending: TrendingUp
};

const corMap = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white'
};

export function StatCard({ 
  titulo, 
  valor, 
  icone, 
  tipo = 'default', 
  progresso, 
  cor = 'primary' 
}: StatCardProps) {
  const IconComponent = iconMap[icone];
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium text-muted-foreground">
          {titulo}
        </div>
        <div className={`p-2 rounded-full ${corMap[cor]}`}>
          <IconComponent className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {tipo === 'progress' ? `${valor}%` : valor.toLocaleString('pt-BR')}
        </div>
        {tipo === 'progress' && (
          <div className="mt-2">
            <Progress value={progresso || valor} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}