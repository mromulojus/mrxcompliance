import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { Logo } from "@/components/ui/logo";
import { FloatingTaskButton } from "@/components/ui/floating-task-button";

const AppLayout: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      "/": "MRx Compliance - Painel",
      "/denuncias/dashboard": "Denúncias - Dashboard",
      "/auth": "Entrar - MRx Compliance",
    };
    const descriptions: Record<string, string> = {
      "/": "Painel de compliance e RH com visão geral e métricas.",
      "/denuncias/dashboard": "Acompanhe denúncias: abertas, em andamento e concluídas.",
      "/auth": "Acesse sua conta no MRx Compliance com segurança.",
    };

    document.title = titles[path] || "MRx Compliance";

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    const metaDesc = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    }) as HTMLMetaElement;
    metaDesc.setAttribute('content', descriptions[path] || 'Plataforma de compliance e canal de denúncias.');

    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }) as HTMLLinkElement;
    canonical.setAttribute('href', `${window.location.origin}${path}`);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="relative flex min-h-svh flex-1 flex-col bg-background">
        <header className="h-12 border-b bg-card flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <Logo className="text-primary" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Sistema Aberto</span>
          </div>
        </header>
        <div className="p-2 md:p-4">
          <Outlet />
        </div>
        <FloatingTaskButton />
      </main>
    </div>
  );
};

export default AppLayout;
