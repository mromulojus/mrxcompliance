import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Activity, BookText, Building2, Home, ListTree, Settings2, Shield, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, can } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  type Item = { title: string; url: string; icon: React.ComponentType<any>; show: boolean };

  const items: Item[] = useMemo(() => [
    { title: "Início", url: "/", icon: Home, show: true },
    { title: "Denúncias", url: "/denuncias/dashboard", icon: Shield, show: can("view:denuncias") },
    { title: "Consulta Denúncia", url: "/denuncias/consulta", icon: Activity, show: can("view:denuncias") },
    { title: "Empresas", url: "/empresas", icon: Building2, show: can("view:system-data") },
    { title: "Dados do Sistema", url: "/admin/system-data", icon: Building2, show: can("view:system-data") },
    { title: "Estrutura Padrão", url: "/admin/structure", icon: Settings2, show: can("manage:structure") },
    { title: "Usuários", url: "/admin/users", icon: Users, show: user?.role === "superuser" || user?.role === "administrador" },
    { title: "Logs de Atividades", url: "/admin/activity-log", icon: ListTree, show: can("view:activity-log") },
    { title: "Documentação / Webhooks", url: "/admin/docs", icon: BookText, show: can("use:docs") },
  ], [user?.role, path]);

  const getCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.filter((i) => i.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <NavLink to={item.url} className={getCls} end>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
