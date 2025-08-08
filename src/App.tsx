import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HRProvider } from "@/context/HRContext";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import Login from "@/pages/Login";
import Empresas from "@/pages/Empresas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HRProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/empresas"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "view:system-data" }]}>
                      <Empresas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/empresa/:empresaId"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "view:system-data" }]}> 
                      <EmpresaDetalhes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/denuncias/dashboard"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "view:denuncias" }]}> 
                      <DenunciasDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/denuncias/consulta"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "view:denuncias" }]}> 
                      <ConsultaDenuncia />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/activity-log"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "view:activity-log" }]}> 
                      <ActivityLog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/system-data"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "view:system-data" }]}> 
                      <SystemData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/structure"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "manage:structure" }]}> 
                      <Structure />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "role", value: "superuser" }, { type: "role", value: "administrador" }]}> 
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/docs"
                  element={
                    <ProtectedRoute requireAnyOf={[{ type: "perm", value: "use:docs" }]}> 
                      <Docs />
                    </ProtectedRoute>
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
