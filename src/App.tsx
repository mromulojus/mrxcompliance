import Homepage from "@/pages/Homepage";
import Tarefas from "@/pages/Tarefas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tarefas" element={<Tarefas />} />
        {/* Admin only routes */}
        <Route path="/admin/activity-log" element={
          <ProtectedRoute requiredRole="administrador">
            <ActivityLog />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;