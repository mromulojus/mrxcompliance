import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { HRProvider } from "@/context/HRContext";
import AppLayout from "@/layouts/AppLayout";
import { lazy, Suspense } from 'react';
const Index = lazy(() => import('./pages/Index'));
const EmpresaDetalhes = lazy(() => import('./pages/EmpresaDetalhes'));
const DenunciasDashboard = lazy(() => import('./pages/DenunciasDashboard'));
const ConsultaDenuncia = lazy(() => import('./pages/ConsultaDenuncia'));
const DenunciaPublica = lazy(() => import('./pages/DenunciaPublica'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ActivityLog = lazy(() => import('@/pages/admin/ActivityLog'));
const SystemData = lazy(() => import('@/pages/admin/SystemData'));
const Structure = lazy(() => import('@/pages/admin/Structure'));
import UserDetails from '@/pages/admin/UserDetails';
import Profile from '@/pages/Profile';
import UsersPage from '@/pages/admin/Users';
import Docs from '@/pages/admin/Docs';
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Empresas from "@/pages/Empresas";
import DebtosDashboard from "@/pages/DebtosDashboard";
import DevedorDetalhes from "./pages/DevedorDetalhes";
import DividaDetalhes from "./pages/DividaDetalhes";
import TarefasDashboard from "./pages/TarefasDashboard";
import TarefasBoards from "./pages/TarefasBoards";
import TarefaBoardView from "./pages/TarefaBoardView";
import Homepage from "@/pages/Homepage";

import Indicadores from "@/pages/Indicadores";
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
            <Suspense fallback={<div className="p-4">Carregando…</div>}>
            <Routes>
          {/* Public routes */}
          <Route path="/home" element={<Homepage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/denuncia-publica/:empresaId" element={<DenunciaPublica />} />
          <Route path="/denuncias/consulta" element={<ConsultaDenuncia />} />
              
              {/* Protected routes */}
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/tarefas" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <TarefasDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/tarefas/quadros" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <TarefasBoards />
                  </ProtectedRoute>
                } />
                <Route path="/tarefas/quadros/:boardId" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <TarefaBoardView />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/empresa/:empresaId" element={<EmpresaDetalhes />} />
                <Route path="/debto" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <DebtosDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/devedor/:devedorId" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <DevedorDetalhes />
                  </ProtectedRoute>
                } />
                <Route path="/divida/:dividaId" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <DividaDetalhes />
                  </ProtectedRoute>
                } />
                <Route path="/denuncias/dashboard" element={<DenunciasDashboard />} />
                <Route path="/indicadores" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <Indicadores />
                  </ProtectedRoute>
                } />
                <Route path="/calendario" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <Calendario />
                  </ProtectedRoute>
                } />
                <Route path="/calendario" element={<Calendario />} />
                
                {/* Admin only routes */}
                <Route path="/admin/activity-log" element={
                  <ProtectedRoute requiredRole="superuser">
                    <ActivityLog />
                  </ProtectedRoute>
                } />
                <Route path="/admin/system-data" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <SystemData />
                  </ProtectedRoute>
                } />
                <Route path="/admin/structure" element={
                  <ProtectedRoute requiredRole="superuser">
                    <Structure />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]}>
                    <UsersPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users/:userId" element={
                  <ProtectedRoute allowedRoles={["superuser", "administrador"]} allowSelfParamKey="userId">
                    <UserDetails />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin/docs" element={<Docs />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HRProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;