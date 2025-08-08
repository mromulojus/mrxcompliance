import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/context/SupabaseAuthContext";
import { HRProvider } from "@/context/HRContext";
import AppLayout from "@/layouts/AppLayout";
import { SupabaseProtectedRoute } from "@/components/auth/SupabaseProtectedRoute";
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
    <SupabaseAuthProvider>
      <HRProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />

              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={
                    <SupabaseProtectedRoute>
                      <Index />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/empresas"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "view:system-data" }]}>
                      <Empresas />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/empresa/:empresaId"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "view:system-data" }]}> 
                      <EmpresaDetalhes />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/denuncias/dashboard"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "view:denuncias" }]}> 
                      <DenunciasDashboard />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/denuncias/consulta"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "view:denuncias" }]}> 
                      <ConsultaDenuncia />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/admin/activity-log"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "view:activity-log" }]}> 
                      <ActivityLog />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/admin/system-data"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "view:system-data" }]}> 
                      <SystemData />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/admin/structure"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "manage:structure" }]}> 
                      <Structure />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "role", value: "superuser" }, { type: "role", value: "administrador" }]}> 
                      <UsersPage />
                    </SupabaseProtectedRoute>
                  }
                />
                <Route
                  path="/admin/docs"
                  element={
                    <SupabaseProtectedRoute requireAnyOf={[{ type: "perm", value: "use:docs" }]}> 
                      <Docs />
                    </SupabaseProtectedRoute>
                  }
                />
              </Route>

              <Route path="/denuncias/:empresaId" element={<DenunciaPublica />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HRProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
