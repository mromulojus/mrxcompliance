import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type Role = "superuser" | "administrador" | "empresarial" | "operacional" | "anon";

export type UserProfile = {
  id: string;
  user_id: string;
  username: string;
  role: Role;
  empresa_ids: string[];
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permission system
const rolePerms: Record<Role, string[]> = {
  superuser: [
    "view:activity-log",
    "view:system-data",
    "manage:structure",
    "manage:users",
    "view:denuncias",
    "view:rescisao",
    "use:docs",
  ],
  administrador: [
    "view:system-data",
    "manage:users",
    "view:denuncias",
    "view:rescisao",
    "use:docs",
  ],
  empresarial: [
    "view:system-data",
    "view:denuncias",
    "use:docs",
  ],
  operacional: [
    "view:system-data",
    "use:docs",
  ],
  anon: [],
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const logActivity = async (action: string, meta?: any) => {
    if (!user) return;
    
    try {
      await supabase
        .from('activity_logs')
        .insert({
          action,
          by_user: profile?.username || user.email || 'unknown',
          meta: meta ? JSON.stringify(meta) : null
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((userProfile) => {
          setProfile(userProfile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username || email
        }
      }
    });

    if (!error) {
      await logActivity('signup', { email, username });
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      await logActivity('login', { email });
      toast({
        title: "Bem-vindo",
        description: `Você entrou como ${email}.`,
      });
    }

    return { error };
  };

  const signOut = async () => {
    if (user) {
      await logActivity('logout');
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const can = (permission: string): boolean => {
    if (!profile) return false;
    return rolePerms[profile.role]?.includes(permission) ?? false;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    can
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useSupabaseAuth deve ser usado dentro de SupabaseAuthProvider");
  return ctx;
};