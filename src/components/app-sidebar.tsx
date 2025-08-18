import { useLocation } from "react-router-dom";
import {
  Activity,
  BookText,
  Building2,
  Home,
  ListTree,
  Settings2,
  Shield,
  Users,
  LogOut,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/animated-sidebar";

export function AppSidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  type Item = { title: string; url: string; icon: LucideIcon; show: boolean; permission?: string };

  const items: Item[] = [
    { title: "Painel", url: "/", icon: Home, show: true },
    { title: "Empresas", url: "/empresas", icon: Building2, show: true },
    { title: "Debto - Cobranças", url: "/debto", icon: DollarSign, show: true },
    { title: "Dashboard Denúncias", url: "/denuncias/dashboard", icon: Shield, show: true, permission: 'view:denuncias' },
    { title: "Log de Atividades", url: "/admin/activity-log", icon: Activity, show: true, permission: 'view:activity-log' },
    { title: "Dados do Sistema", url: "/admin/system-data", icon: Settings2, show: true, permission: 'view:system-data' },
    { title: "Estrutura", url: "/admin/structure", icon: ListTree, show: true, permission: 'manage:structure' },
    { title: "Usuários", url: "/admin/users", icon: Users, show: true, permission: 'manage:users' },
    { title: "Documentação", url: "/admin/docs", icon: BookText, show: true },
  ];

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mt-2 flex flex-col gap-2">
            {items.filter((i) => i.show).map((item) => (
              <SidebarLink
                key={item.title}
                className={path === item.url ? "bg-neutral-200/60 dark:bg-neutral-700/60 rounded-md px-2" : "px-2"}
                link={{
                  label: item.title,
                  href: item.url,
                  icon: <item.icon className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />,
                  permission: item.permission,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mb-2">
          {profile && (
            <SidebarLink
              className="px-2"
              link={{
                label: profile.full_name || "Usuário",
                href: "/profile",
                icon: (
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80&auto=format&fit=crop&crop=faces"
                    className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                    width={28}
                    height={28}
                    alt="Avatar"
                  />
                ),
              }}
            />
          )}
          <SidebarLink
            className="px-2"
            onClick={() => signOut()}
            link={{
              label: "Sair",
              href: "#",
              icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />,
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
