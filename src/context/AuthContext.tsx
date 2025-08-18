import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'superuser' | 'administrador' | 'compliance' | 'empresarial' | 'operacional';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department?: string;
  is_active: boolean;
  empresa_ids?: string[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signUp: (username: string, password: string, fullName?: string, email?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  hasRole: (requiredRole: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshProfile: () => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Central permission map
  const rolePermissions: Record<UserRole, string[]> = {
    superuser: [
      'view:activity-log',
      'view:system-data',
      'manage:structure',
      'manage:users',
      'manage:vinculos',
      'export:all',
      'view:denuncias',
      'view:denuncias:stats',
      'view:rescisao',
      'view:processos',
      'use:docs',
      'use:operacional',
    ],
    administrador: [
      'view:system-data',
      'manage:users',
      'manage:vinculos',
      'view:denuncias',
      'view:denuncias:stats',
      'view:rescisao',
      // sem export:all, sem view:activity-log, sem view:processos
      'use:docs',
      'use:operacional',
    ],
    compliance: [
      'view:denuncias',
      'view:denuncias:stats',
      'view:system-data',
      'use:docs',
    ],
    empresarial: [
      // dono da empresa
      'export:empresa',
      'manage:users', // limitado à própria empresa via RLS
      'manage:vinculos', // idem
      'view:denuncias:stats',
      'view:rescisao',
      'use:docs',
      'use:operacional',
    ],
    operacional: [
      'use:docs',
      'use:operacional',
      // sem denuncias, sem rescisao, sem export, sem processos
    ],
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const updateLastLogin = async () => {
    try {
      await supabase.rpc('update_last_login');
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid recursive issues
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            
            if (event === 'SIGNED_IN') {
              await updateLastLogin();
              toast({
                title: 'Login realizado com sucesso',
                description: `Bem-vindo(a), ${profileData?.full_name || session.user.email}!`
              });
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Get email from username
      const { data: authData, error: authError } = await supabase.rpc('authenticate_by_username', {
        username_input: username,
        password_input: password
      });

      if (authError || !authData || authData.length === 0) {
        const errorMessage = authError?.message || 'Usuário não encontrado';
        toast({
          title: 'Erro no login',
          description: errorMessage.includes('not found') ? 'Usuário não encontrado ou inativo' : 'Usuário ou senha incorretos',
          variant: 'destructive'
        });
        return { error: authError || new Error('Usuário não encontrado') };
      }

      const userEmail = authData[0].email;
      
      // Now authenticate with Supabase using the email
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (error) {
        toast({
          title: 'Erro no login',
          description: error.message === 'Invalid login credentials' 
            ? 'Usuário ou senha incorretos' 
            : error.message,
          variant: 'destructive'
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string, fullName?: string, email?: string) => {
    try {
      setLoading(true);
      
      // Gerar email válido se não fornecido
      if (!email) {
        // Verificar se o username já é um email válido
        if (username.includes('@') && username.includes('.')) {
          email = username;
        } else {
          email = `${username}@sistema.interno`;
        }
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || username,
            username: username
          }
        }
      });

      if (error) {
        toast({
          title: 'Erro no cadastro',
          description: error.message === 'User already registered' 
            ? 'Este usuário já está cadastrado' 
            : error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Cadastro realizado',
          description: 'Conta criada com sucesso! Você já pode fazer login.'
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        toast({
          title: 'Logout realizado',
          description: 'Você foi desconectado com sucesso.'
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile) return false;
    
    const roleHierarchy = {
      'superuser': 5,
      'administrador': 4,
      'compliance': 3,
      'empresarial': 2,
      'operacional': 1
    };
    
    const userRoleLevel = roleHierarchy[profile.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

   const can = (permission: string): boolean => {
     if (!profile) return false;
     const perms = rolePermissions[profile.role] || [];
     return perms.includes(permission);
   };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    hasAnyRole,
    refreshProfile,
    can
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
