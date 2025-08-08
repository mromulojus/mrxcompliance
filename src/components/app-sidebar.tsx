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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const path = location.pathname;

  type Item = { title: string; url: string; icon: React.ComponentType<any>; show: boolean };

  const items: Item[] = [
    { title: "Painel", url: "/", icon: Home, show: true },
    { title: "Empresas", url: "/empresas", icon: Building2, show: true },
    { title: "Dashboard Denúncias", url: "/denuncias/dashboard", icon: Shield, show: true },
    { title: "Consultar Denúncia", url: "/denuncias/consulta", icon: Activity, show: true },
    { title: "Log de Atividades", url: "/admin/activity-log", icon: Activity, show: true },
    { title: "Dados do Sistema", url: "/admin/system-data", icon: Settings2, show: true },
    { title: "Estrutura", url: "/admin/structure", icon: ListTree, show: true },
    { title: "Usuários", url: "/admin/users", icon: Users, show: true },
    { title: "Documentação", url: "/admin/docs", icon: BookText, show: true },
  ];

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
