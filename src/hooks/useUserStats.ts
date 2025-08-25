import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface UserStats {
  daysSinceRegistration: number;
  totalTasks: number;
  completedTasks: number;
  totalLogins: number;
  averageSessionTime: number;
  lastActivity: string | null;
  taskCompletionRate: number;
  personalRanking: number;
  totalSystemUsers: number;
}

export const useUserStats = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchUserStats = async () => {
      try {
        setLoading(true);

        // Calculate days since registration
        const daysSinceRegistration = Math.floor(
          (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get user tasks
        const { data: tasks } = await supabase
          .from('tarefas')
          .select('status, created_at, data_conclusao')
          .or(`responsavel_id.eq.${user.id},created_by.eq.${user.id}`);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(task => task.status === 'concluido').length || 0;
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Get activity logs for login count
        const { data: loginLogs } = await supabase
          .from('activity_logs')
          .select('created_at')
          .eq('by_user', user.email)
          .ilike('action', '%login%');

        const totalLogins = loginLogs?.length || 0;

        // Calculate average session time (rough estimate based on activity)
        const averageSessionTime = totalLogins > 0 ? Math.round((daysSinceRegistration * 2) / totalLogins) : 0;

        // Get last login from profile
        const lastActivity = profile.last_login;

        // Calculate personal ranking based on completed tasks
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('user_id');

        const totalSystemUsers = allUsers?.length || 0;

        // Get all users' task completion counts for ranking (incluindo tarefas criadas)
        const { data: allTasks } = await supabase
          .from('tarefas')
          .select('responsavel_id, created_by, status');

        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, username');

        const profileMap = new Map();
        allProfiles?.forEach(profile => {
          profileMap.set(profile.user_id, profile);
        });

        const userTaskCounts = new Map();
        allTasks?.forEach(task => {
          // Usar responsavel_id OU created_by
          const userId = task.responsavel_id || task.created_by;
          if (userId && task.status === 'concluido') {
            const profile = profileMap.get(userId);
            const userName = profile?.full_name || profile?.username || '';
            
            // Filtrar Matheus Romulo
            if (userName === 'Matheus Romulo') return;
            
            userTaskCounts.set(
              userId, 
              (userTaskCounts.get(userId) || 0) + 1
            );
          }
        });

        const sortedUsers = Array.from(userTaskCounts.entries())
          .sort((a, b) => b[1] - a[1]);

        const personalRanking = sortedUsers.findIndex(([userId]) => userId === user.id) + 1 || totalSystemUsers;

        setStats({
          daysSinceRegistration,
          totalTasks,
          completedTasks,
          totalLogins,
          averageSessionTime,
          lastActivity,
          taskCompletionRate,
          personalRanking,
          totalSystemUsers
        });

      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, profile]);

  return { stats, loading };
};