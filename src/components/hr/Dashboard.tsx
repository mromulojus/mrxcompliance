import { StatCard } from './StatCard';
import { useHR } from '@/context/HRContext';

export function Dashboard() {
  const { dashboardStats } = useHR();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        titulo="Total de Colaboradores"
        valor={dashboardStats.totalColaboradores}
        icone="users"
        cor="primary"
      />
      
      <StatCard
        titulo="Colaboradores Ativos"
        valor={dashboardStats.colaboradoresAtivos}
        icone="trending"
        cor="success"
      />
      
      <StatCard
        titulo="Taxa de Compliance"
        valor={dashboardStats.complianceRate}
        icone="shield"
        tipo="progress"
        cor="warning"
      />
      
      <StatCard
        titulo="Aniversariantes do Mês"
        valor={dashboardStats.aniversariantes}
        icone="calendar"
        cor="danger"
      />
    </div>
  );
}