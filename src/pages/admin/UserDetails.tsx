import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Rectangle, XAxis, YAxis } from "recharts";

type DatabaseRole = "operacional" | "empresarial" | "administrador" | "superuser";

type Profile = {
  user_id: string;
  username: string;
  full_name: string | null;
  role: DatabaseRole;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  empresa_ids: string[] | null;
  avatar_url?: string | null;
};

type Empresa = { id: string; nome: string };

const roleLabels: Record<DatabaseRole, string> = {
  operacional: "Operacional",
  empresarial: "Empresarial",
  administrador: "Administrador",
  superuser: "Superuser"
};

const UserDetails: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loginWeekCount, setLoginWeekCount] = useState(0);
  const [loginMonthCount, setLoginMonthCount] = useState(0);
  const [timeWeekHours, setTimeWeekHours] = useState(0);
  const [timeMonthHours, setTimeMonthHours] = useState(0);
  const [tasksDoneWeek, setTasksDoneWeek] = useState(0);
  const [tasksDoneMonth, setTasksDoneMonth] = useState(0);
  const [weeklyActivitySeries, setWeeklyActivitySeries] = useState<{ day: string; logins: number; horas: number; concluidas: number }[]>([]);

  useEffect(() => {
    document.title = "Detalhes do Usuário - MRx Compliance";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { data: prof, error } = await supabase
          .from("profiles")
          .select("user_id, username, full_name, role, is_active, created_at, updated_at, empresa_ids, avatar_url")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        setProfile(prof as unknown as Profile);

        const ids = (prof?.empresa_ids as string[] | null) || [];
        if (ids.length > 0) {
          const { data: empData } = await supabase
            .from("empresas")
            .select("id, nome")
            .in("id", ids);
          setEmpresas(empData || []);
        } else {
          setEmpresas([]);
        }
        // Fetch metrics: activity_logs for login/logout; tarefas for completed tasks
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now);
        startOfMonth.setDate(now.getDate() - 30);

        // Logins in last week/month
        const [loginsWeekRes, loginsMonthRes] = await Promise.all([
          supabase.from('activity_logs').select('id, action, created_at')
            .gte('created_at', startOfWeek.toISOString())
            .eq('action', 'login')
            .contains('meta', { user_id: userId }),
          supabase.from('activity_logs').select('id, action, created_at')
            .gte('created_at', startOfMonth.toISOString())
            .eq('action', 'login')
            .contains('meta', { user_id: userId }),
        ]);
        setLoginWeekCount(loginsWeekRes.data?.length || 0);
        setLoginMonthCount(loginsMonthRes.data?.length || 0);

        // Approx time in system: pair login-logout events and sum session durations
        const { data: actsMonth } = await supabase.from('activity_logs')
          .select('action, created_at')
          .gte('created_at', startOfMonth.toISOString())
          .or('action.eq.login,action.eq.logout')
          .contains('meta', { user_id: userId })
          .order('created_at', { ascending: true });
        const sessions: { start: Date; end?: Date }[] = [];
        (actsMonth || []).forEach((a) => {
          if (a.action === 'login') sessions.push({ start: new Date(a.created_at) });
          if (a.action === 'logout') {
            const lastOpen = [...sessions].reverse().find((s) => !s.end);
            if (lastOpen) lastOpen.end = new Date(a.created_at);
          }
        });
        const totalMsMonth = sessions.reduce((acc, s) => acc + Math.max(0, (s.end?.getTime() || now.getTime()) - s.start.getTime()), 0);
        const totalHoursMonth = totalMsMonth / 36e5;
        setTimeMonthHours(Number(totalHoursMonth.toFixed(2)));
        const totalMsWeek = sessions
          .filter((s) => s.start >= startOfWeek)
          .reduce((acc, s) => acc + Math.max(0, (s.end?.getTime() || now.getTime()) - s.start.getTime()), 0);
        setTimeWeekHours(Number((totalMsWeek / 36e5).toFixed(2)));

        // Tasks completed by this user (responsavel_id) in last week/month
        const [doneWeek, doneMonth] = await Promise.all([
          supabase.from('tarefas').select('id').eq('responsavel_id', userId).eq('status', 'concluido').gte('data_conclusao', startOfWeek.toISOString()),
          supabase.from('tarefas').select('id').eq('responsavel_id', userId).eq('status', 'concluido').gte('data_conclusao', startOfMonth.toISOString()),
        ]);
        setTasksDoneWeek(doneWeek.data?.length || 0);
        setTasksDoneMonth(doneMonth.data?.length || 0);

        // Weekly series (last 7 days)
        const seriesDays = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          return d;
        });
        const loginsByDay: Record<string, number> = {};
        (loginsWeekRes.data || []).forEach((l) => {
          const k = new Date(l.created_at).toISOString().slice(0, 10);
          loginsByDay[k] = (loginsByDay[k] || 0) + 1;
        });
        const concluidasWeek = await supabase.from('tarefas').select('id, data_conclusao')
          .eq('responsavel_id', userId).eq('status', 'concluido').gte('data_conclusao', startOfWeek.toISOString());
        const concluidasByDay: Record<string, number> = {};
        (concluidasWeek.data || []).forEach((t) => {
          const k = (t.data_conclusao as string).slice(0, 10);
          concluidasByDay[k] = (concluidasByDay[k] || 0) + 1;
        });
        const weeklySeries = seriesDays.map((d) => {
          const k = d.toISOString().slice(0, 10);
          return {
            day: k,
            logins: loginsByDay[k] || 0,
            horas: 0, // detailed per-day session breakdown could be added later
            concluidas: concluidasByDay[k] || 0,
          };
        });
        setWeeklyActivitySeries(weeklySeries);
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const empresasResumo = useMemo(() => {
    if (!profile) return "";
    if (!profile.empresa_ids || profile.empresa_ids.length === 0) return "Sem vínculo";
    if (empresas.length === 0) return `${profile.empresa_ids.length} empresas`;
    return empresas.map((e) => e.nome).join(", ");
  }, [profile, empresas]);

  if (loading) {
    return (
      <main>
        <div className="py-16 text-center text-muted-foreground">Carregando...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <div className="py-16 text-center">
          <p className="mb-4">Usuário não encontrado.</p>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name ?? profile.username} />
                <AvatarFallback>
                  {profile.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">
                  {profile.full_name || profile.username}
                </div>
                <div className="text-sm text-muted-foreground">{profile.username}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="uppercase">{roleLabels[profile.role]}</Badge>
              <Badge variant={profile.is_active ? "default" : "destructive"}>
                {profile.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell className="font-mono">{profile.user_id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>{profile.full_name || "—"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>{profile.username}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Papel</TableCell>
                  <TableCell className="uppercase">{roleLabels[profile.role]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>{profile.is_active ? "Ativo" : "Inativo"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Empresas</TableCell>
                  <TableCell>{empresasResumo}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Criado em</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell>
                </TableRow>
                {profile.updated_at && (
                  <TableRow>
                    <TableCell>Atualizado em</TableCell>
                    <TableCell>{new Date(profile.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Última semana: <span className="font-semibold">{loginWeekCount}</span></div>
            <div className="text-sm">Últimos 30 dias: <span className="font-semibold">{loginMonthCount}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tempo no Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Última semana: <span className="font-semibold">{timeWeekHours}h</span></div>
            <div className="text-sm">Últimos 30 dias: <span className="font-semibold">{timeMonthHours}h</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Última semana: <span className="font-semibold">{tasksDoneWeek}</span></div>
            <div className="text-sm">Últimos 30 dias: <span className="font-semibold">{tasksDoneMonth}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Atividade (últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ logins: { label: 'Logins', color: 'hsl(var(--primary))' }, concluidas: { label: 'Concluídas', color: 'hsl(var(--success))' } }}
              className="h-[260px]"
            >
              <BarChart data={weeklyActivitySeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="logins" fill="var(--color-logins)" radius={4} activeBar={<Rectangle fillOpacity={0.9} />} />
                <Bar dataKey="concluidas" fill="var(--color-concluidas)" radius={4} activeBar={<Rectangle fillOpacity={0.9} />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default UserDetails;

