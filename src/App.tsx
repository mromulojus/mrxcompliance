import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HRProvider } from "@/context/HRContext";
import AppLayout from "@/layouts/AppLayout";
import Index from "./pages/Index";
import EmpresaDetalhes from "./pages/EmpresaDetalhes";
import DenunciasDashboard from "./pages/DenunciasDashboard";
import ConsultaDenuncia from "./pages/ConsultaDenuncia";
import DenunciaPublica from "./pages/DenunciaPublica";
import NotFound from "./pages/NotFound";
import ActivityLog from "@/pages/admin/ActivityLog";
import SystemData from "@/pages/admin/SystemData";
import Structure from "@/pages/admin/Structure";
import UsersPage from "@/pages/admin/Users";
import Docs from "@/pages/admin/Docs";
import Auth from "@/pages/Auth";
import Empresas from "@/pages/Empresas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HRProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/empresa/:empresaId" element={<EmpresaDetalhes />} />
              <Route path="/denuncias/dashboard" element={<DenunciasDashboard />} />
              <Route path="/denuncias/consulta" element={<ConsultaDenuncia />} />
              <Route path="/admin/activity-log" element={<ActivityLog />} />
              <Route path="/admin/system-data" element={<SystemData />} />
              <Route path="/admin/structure" element={<Structure />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/docs" element={<Docs />} />
            </Route>

            <Route path="/denuncia-publica/:empresaId" element={<DenunciaPublica />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HRProvider>
  </QueryClientProvider>
);

export default App;
