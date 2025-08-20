import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAnyOf?: Array<
    | { type: "role"; value: UserRole }
    | { type: "perm"; value: string }
  >;
};

export const SupabaseProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAnyOf 
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Optional: if consumer passes requireAnyOf with roles, respect it
  if (requireAnyOf && requireAnyOf.length > 0) {
    const hasRole = requireAnyOf.some((req) => req.type === 'role' && profile.role === (req.value as any));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};