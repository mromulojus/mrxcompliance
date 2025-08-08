import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const AppLayout: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    // SEO basic title by route
    const titles: Record<string, string> = {
      "/": "MRx Compliance - Painel",
      "/denuncias/dashboard": "Denúncias - Dashboard",
      "/denuncias/consulta": "Consultar Denúncia",
    };
    const title = titles[location.pathname] || "MRx Compliance";
    document.title = title;
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
