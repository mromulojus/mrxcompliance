import { useLocation } from "react-router-dom";
import {
  Activity,
  BookText,
  Building2,
  ListTree,
  Calendar,
  Settings2,
  Shield,
  Users,
  LogOut,
  DollarSign,
  KanbanSquare,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/animated-sidebar";
import { Logo } from "@/components/ui/logo";

export function AppSidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  type Item = { title: string; url: string; icon: LucideIcon; show: boolean };

  // Wrapper para usar o logotipo MRx como ícone no mesmo formato dos ícones do Lucide
  const MrxIcon = ({ className }: { className?: string }) => (
    <Logo variant="icon" size="sm" className={className} />
  );

  // Filtrar itens baseado no role do usuário
  const getVisibleItems = (allItems: Item[]) => {
    const userRole = profile?.role;
    
    // Usuários operacional e empresarial só veem Empresas e Denúncias
    if (userRole === 'operacional' || userRole === 'empresarial') {
      return allItems.filter(item => 
        item.url === "/empresas" || 
        item.url === "/denuncias/dashboard"
      );
    }
    
    // Administradores e superusers veem tudo
    return allItems;
  };

  const items: Item[] = [
    { title: "Painel", url: "/", icon: MrxIcon as unknown as LucideIcon, show: true },
    { title: "Tarefas", url: "/tarefas", icon: KanbanSquare, show: true },
    { title: "Indicadores", url: "/indicadores", icon: Activity, show: true },
    { title: "Calendário", url: "/calendario", icon: Calendar, show: true },
    { title: "Empresas", url: "/empresas", icon: Building2, show: true },
    { title: "Debto - Cobranças", url: "/debto", icon: DollarSign, show: true },
    { title: "Dashboard Denúncias", url: "/denuncias/dashboard", icon: Shield, show: true },
    // Itens administrativos movidos para o menu "Opções" no cabeçalho
  ];

  const visibleItems = getVisibleItems(items);

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mt-2 flex flex-col gap-2">
            {visibleItems.filter((i) => i.show).map((item) => (
              <SidebarLink
                key={item.title}
                className={path === item.url ? "bg-neutral-200/60 dark:bg-neutral-700/60 rounded-md px-2" : "px-2"}
                link={{
                  label: item.title,
                  href: item.url,
                  icon: <item.icon className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />,
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
                href: `/admin/users/${profile.user_id}`,
                icon: (
                  <img
                    src={profile.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80&auto=format&fit=crop&crop=faces"}
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
