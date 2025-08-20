import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Activity, Clock, MapPin, Phone, Mail, Building, Calendar, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  empresa_ids: string[] | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login: string | null;
  phone: string | null;
  department: string | null;
}

interface UserActivity {
  id: string;
  action: string;
  created_at: string;
  meta: any;
}

interface SimpleStats {
  totalSessions: number;
  totalDuration: number;
  averageSession: number;
  lastActive: string | null;
}

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SimpleStats>({
    totalSessions: 0,
    totalDuration: 0,
    averageSession: 0,
    lastActive: null
  });
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [liveSessionSeconds, setLiveSessionSeconds] = useState(0);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      // Load activities
      const { data: activitiesData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('by_user', profileData.username)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setActivities(activitiesData || []);

      // Simple stats calculation (no timesheet functionality)
      const simpleStats: SimpleStats = {
        totalSessions: activitiesData?.filter(a => a.action === 'login').length || 0,
        totalDuration: 0, // Disabled functionality
        averageSession: 0, // Disabled functionality
        lastActive: profileData.last_login
      };
      
      setStats(simpleStats);
      setLiveSessionSeconds(0); // Disabled functionality
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do usuário',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!profile) return;
    
    try {
      const newStatus = !profile.is_active;
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      setProfile({ ...profile, is_active: newStatus });
      
      toast({
        title: 'Status atualizado',
        description: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do usuário',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Usuário não encontrado</h2>
        <Button onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para usuários
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superuser':
        return 'destructive';
      case 'administrador':
        return 'default';
      case 'empresarial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-muted-foreground">Detalhes do usuário</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={profile.is_active ? 'default' : 'secondary'}>
            {profile.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          <Badge variant={getRoleBadgeVariant(profile.role)}>
            {profile.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {(profile.full_name || profile.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{profile.full_name || profile.username}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            <div className="space-y-3">
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
              
              {profile.department && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">{profile.department}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Criado em {formatDate(profile.created_at)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Último login: {formatDate(profile.last_login)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant={profile.is_active ? "destructive" : "default"}
                onClick={handleToggleStatus}
                className="w-full"
              >
                {profile.is_active ? 'Desativar usuário' : 'Ativar usuário'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">logins registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
                <p className="text-xs text-muted-foreground">funcionalidade desabilitada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sessão Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(stats.averageSession)}</div>
                <p className="text-xs text-muted-foreground">funcionalidade desabilitada</p>
              </CardContent>
            </Card>
          </div>

          {/* Live Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessão Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold mb-2">
                  {formatDuration(liveSessionSeconds)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Funcionalidade de timesheet temporariamente desabilitada
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade registrada
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                      {activity.meta && (
                        <Badge variant="outline" className="text-xs">
                          {JSON.stringify(activity.meta).slice(0, 20)}...
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}