import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  totalCompletedTasks: number;
  averageTasksPerUser: number;
  systemUptimeDays: number;
  topActiveUsers: Array<{
    name: string;
    completedTasks: number;
    totalTime: number;
  }>;
  moduleUsage: Array<{
    module: string;
    count: number;
    percentage: number;
  }>;
  loginFrequency: Array<{
    day: string;
    logins: number;
  }>;
}

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        setLoading(true);

        // Get total users and active users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, is_active, created_at, last_login');

        const totalUsers = profiles?.length || 0;
        const activeUsers = profiles?.filter(p => p.is_active).length || 0;

        // Get all tasks
        const { data: tasks } = await supabase
          .from('tarefas')
          .select('responsavel_id, created_by, status, modulo_origem, created_at, data_conclusao');

        const totalTasks = tasks?.length || 0;
        const totalCompletedTasks = tasks?.filter(t => t.status === 'concluido').length || 0;
        const averageTasksPerUser = totalUsers > 0 ? Math.round(totalTasks / totalUsers) : 0;

        // Calculate system uptime (days since oldest profile)
        const oldestProfile = profiles?.reduce((oldest, current) => 
          new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest
        );
        const systemUptimeDays = oldestProfile 
          ? Math.floor((Date.now() - new Date(oldestProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // Calculate top active users based on completed tasks
        const userTaskCounts = new Map();
        const userProfiles = new Map();
        
        profiles?.forEach(profile => {
          userProfiles.set(profile.user_id, profile);
        });

        tasks?.forEach(task => {
          // Usar responsavel_id OU created_by para incluir tarefas criadas
          const userId = task.responsavel_id || task.created_by;
          if (userId && task.status === 'concluido') {
            const profile = userProfiles.get(userId);
            const userName = profile?.full_name || profile?.username || '';
            
            // Filtrar Matheus Romulo
            if (userName === 'Matheus Romulo') return;
            
            const current = userTaskCounts.get(userId) || { completed: 0, totalTime: 0 };
            current.completed += 1;
            
            // Calculate time spent (rough estimate)
            if (task.data_conclusao && task.created_at) {
              const timeSpent = (new Date(task.data_conclusao).getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
              current.totalTime += timeSpent;
            }
            
            userTaskCounts.set(userId, current);
          }
        });

        const topActiveUsers = Array.from(userTaskCounts.entries())
          .sort((a, b) => b[1].completed - a[1].completed)
          .slice(0, 10)
          .map(([userId, data]) => {
            const profile = userProfiles.get(userId);
            return {
              name: profile?.full_name || profile?.username || 'Usuário',
              completedTasks: data.completed,
              totalTime: Math.round(data.totalTime)
            };
          });

        // Calculate module usage
        const moduleCount = new Map();
        tasks?.forEach(task => {
          const module = task.modulo_origem || 'geral';
          moduleCount.set(module, (moduleCount.get(module) || 0) + 1);
        });

        const moduleUsage = Array.from(moduleCount.entries())
          .map(([module, count]) => ({
            module: module === 'geral' ? 'Geral' : 
                    module === 'hr' ? 'RH' :
                    module === 'cobrancas' ? 'Cobranças' :
                    module === 'processos' ? 'Processos' :
                    module === 'denuncias' ? 'Denúncias' : module,
            count,
            percentage: Math.round((count / totalTasks) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        // Get activity logs for login frequency
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('created_at, action')
          .ilike('action', '%login%')
          .order('created_at', { ascending: false })
          .limit(1000);

        // Group by day of week
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const loginsByDay = new Array(7).fill(0);
        
        activityLogs?.forEach(log => {
          const dayOfWeek = new Date(log.created_at).getDay();
          loginsByDay[dayOfWeek] += 1;
        });

        const loginFrequency = dayNames.map((day, index) => ({
          day,
          logins: loginsByDay[index]
        }));

        setStats({
          totalUsers,
          activeUsers,
          totalTasks,
          totalCompletedTasks,
          averageTasksPerUser,
          systemUptimeDays,
          topActiveUsers,
          moduleUsage,
          loginFrequency
        });

      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  return { stats, loading };
};