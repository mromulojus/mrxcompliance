import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'superuser' | 'administrador' | 'empresarial' | 'operacional';

export interface UserProfile {
  user_id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  empresa_ids: string[];
  is_active: boolean;
}

export const useUserPermissions = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (requiredRole: UserRole) => {
    if (!profile) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      operacional: 1,
      empresarial: 2,
      administrador: 3,
      superuser: 4
    };

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  const canDeleteEmpresa = () => {
    return hasRole('administrador');
  };

  const canAccessEmpresa = (empresaId: string) => {
    if (!profile) return false;
    if (hasRole('administrador')) return true;
    if (profile.role === 'empresarial') {
      return profile.empresa_ids?.includes(empresaId) || false;
    }
    return false;
  };

  return {
    profile,
    loading,
    hasRole,
    canDeleteEmpresa,
    canAccessEmpresa,
    isAuthenticated: !!profile,
    refresh: fetchUserProfile
  };
};