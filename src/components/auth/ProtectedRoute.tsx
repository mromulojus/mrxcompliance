import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, profile, loading, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log para debug
    if (!loading && user) {
      console.log('User authenticated:', { 
        user: user.email, 
        profile: profile?.role,
        requiredRole,
        allowedRoles 
      });
    }
  }, [user, profile, loading, requiredRole, allowedRoles]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for profile to load
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Check if user is active
  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Sua conta está inativa. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Nível necessário: <span className="font-medium">{requiredRole}</span><br />
            Seu nível: <span className="font-medium">{profile.role}</span>
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Níveis permitidos: <span className="font-medium">{allowedRoles.join(', ')}</span><br />
            Seu nível: <span className="font-medium">{profile.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
