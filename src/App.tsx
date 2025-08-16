import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import Login from "@/pages/Login";
import Empresas from "@/pages/Empresas";
import DebtosDashboard from "@/pages/DebtosDashboard";
import DevedorDetalhes from "./pages/DevedorDetalhes";
import Homepage from "@/pages/Homepage";
import Calendario from "@/pages/Calendario";

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
              {/* Public routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/denuncia-publica/:empresaId" element={<DenunciaPublica />} />
              
              {/* Protected routes */}
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/empresa/:empresaId" element={<EmpresaDetalhes />} />
                <Route path="/debto" element={<DebtosDashboard />} />
                <Route path="/devedor/:devedorId" element={<DevedorDetalhes />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/denuncias/dashboard" element={<DenunciasDashboard />} />
                <Route path="/denuncias/consulta" element={<ConsultaDenuncia />} />
                
                {/* Admin only routes */}
                <Route path="/admin/activity-log" element={
                  <ProtectedRoute requiredRole="administrador">
                    <ActivityLog />
                  </ProtectedRoute>
                } />
                <Route path="/admin/system-data" element={
                  <ProtectedRoute allowedRoles={['superuser', 'administrador']}>
                    <SystemData />
                  </ProtectedRoute>
                } />
                <Route path="/admin/structure" element={
                  <ProtectedRoute requiredRole="superuser">
                    <Structure />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['superuser', 'administrador']}>
                    <UsersPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/docs" element={<Docs />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HRProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
