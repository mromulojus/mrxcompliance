import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "superuser" | "administrador" | "empresarial" | "operacional" | "anon";

export type User = {
  username: string;
  role: Role;
  empresaIds?: string[]; // empresas vinculadas
};

type AuthContextType = {
  user: User | null;
  login: (params: { username: string; password?: string; roleFallback?: Exclude<Role, "anon"> }) => void;
  logout: () => void;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth:user";
const LOGS_KEY = "activityLogs";

function pushLog(entry: { action: string; by: string; meta?: Record<string, unknown> }) {
  try {
    const logs: any[] = JSON.parse(localStorage.getItem(LOGS_KEY) || "[]");
    logs.unshift({ id: crypto.randomUUID(), ts: new Date().toISOString(), ...entry });
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login: AuthContextType["login"] = ({ username, password, roleFallback }) => {
    // Regra pedida: superuser com credenciais específicas
    if (username === "mrxbr" && password === "1408") {
      const u: User = { username, role: "superuser" };
      setUser(u);
      pushLog({ action: "login", by: username, meta: { role: u.role } });
      return;
    }
    const role: Role = roleFallback ?? "operacional";
    const u: User = { username, role };
    setUser(u);
    pushLog({ action: "login", by: username, meta: { role } });
  };

  const logout = () => {
    if (user) pushLog({ action: "logout", by: user.username });
    setUser(null);
  };

  // Tabela simples de permissões por role
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
      // tudo exceto logs e estrutura
      "view:system-data",
      "manage:users", // mas sem excluir no UI (tratado na tela)
      "view:denuncias",
      "view:rescisao",
      "use:docs",
    ],
    empresarial: [
      "view:system-data",
      "view:denuncias",
      "use:docs",
      // Sem manage:users
    ],
    operacional: [
      "view:system-data",
      // sem denuncias e sem rescisao
      "use:docs",
    ],
    anon: [],
  };

  const can: AuthContextType["can"] = (permission) => {
    if (!user) return false;
    return rolePerms[user.role]?.includes(permission) ?? false;
  };

  const value = useMemo(() => ({ user, login, logout, can }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
