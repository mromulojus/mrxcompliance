import { useLocation } from "react-router-dom";
import {
  Activity,
  BookText,
  Building2,
  ListTree,
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

  // Itens principais fora de "Opções"
  const items: Item[] = [
    { title: "Painel", url: "/", icon: MrxIcon as unknown as LucideIcon, show: true },
    { title: "Tarefas", url: "/tarefas", icon: KanbanSquare, show: true },
    { title: "Empresas", url: "/empresas", icon: Building2, show: true },
    { title: "Debto - Cobranças", url: "/debto", icon: DollarSign, show: true },
    { title: "Dashboard Denúncias", url: "/denuncias/dashboard", icon: Shield, show: true },
  ];

  // Submenus agrupados em "Opções"
  const optionItems: Item[] = [
    { title: "Log de Atividades", url: "/admin/activity-log", icon: Activity, show: profile?.role === 'superuser' },
    { title: "Dados do Sistema", url: "/admin/system-data", icon: Settings2, show: true },
    { title: "Estrutura", url: "/admin/structure", icon: ListTree, show: true },
    { title: "Usuários", url: "/admin/users", icon: Users, show: true },
    { title: "Documentação", url: "/admin/docs", icon: BookText, show: true },
  ];

  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const optionsHasActive = optionItems.some((i) => i.show && path === i.url);
  const optionsVisible = optionItems.some((i) => i.show);

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
                }}
              />
            ))}

            {optionsVisible && (
              <>
                <SidebarLink
                  className={(optionsHasActive ? "bg-neutral-200/60 dark:bg-neutral-700/60 rounded-md " : "") + "px-2"}
                  onClick={(e) => {
                    e.preventDefault();
                    setOptionsOpen((prev) => !prev);
                  }}
                  link={{
                    label: "Opções",
                    href: "#",
                    icon: <Settings2 className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />,
                  }}
                />

                {optionsOpen && (
                  <div className="ml-6 flex flex-col gap-1">
                    {optionItems.filter((i) => i.show).map((item) => (
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
                )}
              </>
            )}
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
                    src={profile.avatar_url || "/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png"}
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
