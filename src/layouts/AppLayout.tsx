import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const AppLayout: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    // SEO basic tags by route
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-12 border-b bg-card flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Logo className="text-primary" />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Sistema Aberto</span>
            </div>
          </header>
          <div className="p-2 md:p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
