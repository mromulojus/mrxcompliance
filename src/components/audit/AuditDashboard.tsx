import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, FileText, CheckCircle2, AlertTriangle, Clock, Calendar as CalendarIcon, Users, TrendingUp, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface AuditEvent {
  id: string;
  title: string;
  type: "document" | "training" | "visit" | "meeting";
  date: Date;
  status: "scheduled" | "completed" | "overdue";
  responsible: string;
}

export const auditEvents: AuditEvent[] = [
  {
    id: "1",
    title: "Vencimento ISO 9001",
    type: "document",
    date: new Date(2024, 1, 20),
    status: "scheduled",
    responsible: "João Silva",
  },
  {
    id: "2",
    title: "Treinamento LGPD",
    type: "training",
    date: new Date(2024, 1, 25),
    status: "scheduled",
    responsible: "Maria Santos",
  },
];

export function AuditDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "document" as const,
    date: new Date(),
    responsible: ""
  });

  // Mock data para os gráficos
  const logsByType = [
    { name: 'Documentos', value: 45, color: '#0088FE' },
    { name: 'Treinamentos', value: 30, color: '#00C49F' },
    { name: 'Visitas', value: 15, color: '#FFBB28' },
    { name: 'Reuniões', value: 10, color: '#FF8042' }
  ];

  const complianceEvolution = [
    { month: 'Jan', conformidade: 65, naoConformidade: 15 },
    { month: 'Fev', conformidade: 70, naoConformidade: 12 },
    { month: 'Mar', conformidade: 75, naoConformidade: 10 },
    { month: 'Abr', conformidade: 80, naoConformidade: 8 },
    { month: 'Mai', conformidade: 85, naoConformidade: 6 },
    { month: 'Jun', conformidade: 88, naoConformidade: 5 }
  ];

  const departmentDistribution = [
    { name: 'RH', value: 25, color: '#8884d8' },
    { name: 'Financeiro', value: 20, color: '#82ca9d' },
    { name: 'Operacional', value: 30, color: '#ffc658' },
    { name: 'Comercial', value: 15, color: '#ff7300' },
    { name: 'TI', value: 10, color: '#00ff88' }
  ];

  const auditHistory = [
    {
      id: "1",
      date: "2024-01-15T10:00:00Z",
      user: "João Silva",
      type: "Documento",
      result: "Aprovado",
      responseTime: "2h"
    },
    {
      id: "2", 
      date: "2024-01-14T14:30:00Z",
      user: "Maria Santos",
      type: "Treinamento",
      result: "Não Conformidade",
      responseTime: "1h 30min"
    },
    {
      id: "3",
      date: "2024-01-13T09:15:00Z",
      user: "Pedro Costa",
      type: "Visita",
      result: "Aprovado",
      responseTime: "45min"
    }
  ];

  const syncWithGoogleCalendar = async () => {
    toast.success("Sincronização com Google Calendar iniciada");
    // Aqui seria implementada a integração real com Google Calendar API
  };

  const addEvent = () => {
    toast.success("Evento adicionado ao calendário");
    setNewEvent({
      title: "",
      type: "document",
      date: new Date(),
      responsible: ""
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-4 w-4" />;
      case "training": return <Users className="h-4 w-4" />;
      case "visit": return <Activity className="h-4 w-4" />;
      case "meeting": return <CalendarIcon className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case "overdue": return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      case "scheduled": return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      default: return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Logs</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ações Aprovadas</p>
                <p className="text-2xl font-bold">987</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">1.5h</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Logs por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={logsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução de Não Conformidades */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="conformidade" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="naoConformidade" stroke="#FF8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Calendário */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agenda de Auditoria</CardTitle>
              <div className="flex gap-2">
                <Button onClick={syncWithGoogleCalendar} size="sm" variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Evento de Auditoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                          placeholder="Título do evento"
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <select 
                          className="w-full p-2 border rounded"
                          value={newEvent.type}
                          onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                        >
                          <option value="document">Documento</option>
                          <option value="training">Treinamento</option>
                          <option value="visit">Visita</option>
                          <option value="meeting">Reunião</option>
                        </select>
                      </div>
                      <div>
                        <Label>Responsável</Label>
                        <Input
                          value={newEvent.responsible}
                          onChange={(e) => setNewEvent({...newEvent, responsible: e.target.value})}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <Button onClick={addEvent} className="w-full">
                        Adicionar Evento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
            />
          </CardContent>
        </Card>
      </div>

      {/* Histórico Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Geral de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Tempo de Resposta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.date).toLocaleString()}
                  </TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(item.type.toLowerCase())}
                      {item.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.result === "Aprovado" ? "completed" : "overdue")}
                  </TableCell>
                  <TableCell>{item.responseTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Eventos Próximos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getEventTypeIcon(event.type)}
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString()} - {event.responsible}
                    </p>
                  </div>
                </div>
                {getStatusBadge(event.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}