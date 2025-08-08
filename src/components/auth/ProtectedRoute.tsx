import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAnyOf?: Array<
    | { type: "role"; value: import("@/context/AuthContext").Role }
    | { type: "perm"; value: string }
  >;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAnyOf }) => {
  const { user, can } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAnyOf && requireAnyOf.length > 0) {
    const ok = requireAnyOf.some((req) =>
      req.type === "role" ? user.role === req.value : can(req.value)
    );
    if (!ok) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
