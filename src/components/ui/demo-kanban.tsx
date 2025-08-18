import { Kanban } from "@/components/ui/kanban";
import { Tarefa } from "@/types/tarefas";

const mockTasks: Tarefa[] = [
  {
    id: "1",
    titulo: "Revisar política de compliance",
    descricao: "Atualizar a política de compliance da empresa para 2024",
    status: "a_fazer",
    prioridade: "alta",
    modulo_origem: "auditoria",
    created_by: "user1",
    ordem_na_coluna: 0,
    data_vencimento: "2024-01-15",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2", 
    titulo: "Processar denúncia #1234",
    descricao: "Analisar denúncia de assédio moral",
    status: "em_andamento",
    prioridade: "alta",
    modulo_origem: "ouvidoria",
    created_by: "user1",
    ordem_na_coluna: 0,
    data_vencimento: "2024-01-20",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    titulo: "Cobrar dívida vencida",
    descricao: "Entrar em contato com devedor sobre pagamento atrasado",
    status: "em_revisao", 
    prioridade: "media",
    modulo_origem: "cobrancas",
    created_by: "user1",
    ordem_na_coluna: 0,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    titulo: "Reunião de equipe",
    descricao: "Reunião semanal de alinhamento",
    status: "concluido",
    prioridade: "baixa",
    modulo_origem: "geral",
    created_by: "user1",
    ordem_na_coluna: 0,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z"
  }
];

const DemoKanban = () => {
  const handleTaskUpdate = (tasks: Tarefa[]) => {
    console.log('Tasks updated:', tasks);
  };

  const handleTaskCreate = (status: any) => {
    console.log('Create task with status:', status);
  };

  const handleTaskDelete = (taskId: string) => {
    console.log('Delete task:', taskId);
  };

  return (
    <div className="h-screen w-full">
      <Kanban 
        tasks={mockTasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskCreate={handleTaskCreate}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  );
};

export { DemoKanban };