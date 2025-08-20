import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tarefa, TaskPriority, TaskStatus } from '@/types/tarefas';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, XAxis, YAxis } from 'recharts';

type IndicadorItem = {
  chave: string; // usuario|empresa|quadro
  tarefasConcluidas: number;
  tarefasAbertas: number;
  tarefasCriadas: number;
  tempoMedioResolucaoHoras: number; // média em horas
  pontuacao: number;
  ranking: number;
};

type RankingGeralItem = {
  usuario: string;
  pontuacao: number;
  tarefasResolvidas: number;
  ranking: number;
};

type ProfileLite = { user_id: string; full_name: string | null; username: string };
type BoardLite = { id: string; name: string };

const PRIORITY_SCORES: Record<TaskPriority, number> = {
  baixa: 0.5,
  media: 1.5,
  alta: 5,
};

const isConcluida = (status: TaskStatus) => status === 'concluido';

export default function Indicadores() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>({});
  const [boardsById, setBoardsById] = useState<Record<string, BoardLite>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Indicadores - MRx Compliance';
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [{ data: tData }, { data: pData }, { data: bData }] = await Promise.all([
          supabase.from('tarefas').select('*'),
          supabase.from('profiles').select('user_id, full_name, username'),
          supabase.from('task_boards').select('id, name'),
        ]);

        setTarefas(tData || []);
        const pMap: Record<string, ProfileLite> = {};
        (pData || []).forEach((p) => { pMap[p.user_id] = p as ProfileLite; });
        setProfilesById(pMap);

        const bMap: Record<string, BoardLite> = {};
        (bData || []).forEach((b) => { bMap[b.id] = b as BoardLite; });
        setBoardsById(bMap);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  

  const calcular = useMemo(() => {
    const by = <K extends string>(keyFn: (t: Tarefa) => K) => {
      const groups = new Map<K, Tarefa[]>();
      tarefas.forEach((t) => {
        const k = keyFn(t);
        groups.set(k, [...(groups.get(k) || []), t]);
      });
      return groups;
    };

    const diffHoras = (a: string, b: string) => {
      const ta = new Date(a).getTime();
      const tb = new Date(b).getTime();
      return Math.max(0, (tb - ta) / 36e5);
    };

    const buildIndicadores = (groups: Map<string, Tarefa[]>, labelFormatter?: (k: string) => string): IndicadorItem[] => {
      const arr: IndicadorItem[] = [];
      groups.forEach((list, k) => {
        const tarefasCriadas = list.length;
        const concluidas = list.filter((t) => isConcluida(t.status));
        const abertas = list.filter((t) => !isConcluida(t.status));
        const tempoMedio = concluidas.length
          ? concluidas.reduce((acc, t) => acc + diffHoras(t.created_at, t.data_conclusao || t.updated_at || t.created_at), 0) / concluidas.length
          : 0;
        const pontuacao = concluidas.reduce((acc, t) => acc + (PRIORITY_SCORES[t.prioridade] || 0), 0);
        arr.push({
          chave: labelFormatter ? labelFormatter(k) : k,
          tarefasConcluidas: concluidas.length,
          tarefasAbertas: abertas.length,
          tarefasCriadas,
          tempoMedioResolucaoHoras: Number(tempoMedio.toFixed(2)),
          pontuacao: Number(pontuacao.toFixed(2)),
          ranking: 0,
        });
      });
      // rank by pontuacao desc
      arr.sort((a, b) => b.pontuacao - a.pontuacao);
      arr.forEach((item, idx) => (item.ranking = idx + 1));
      return arr;
    };

    // Por usuário (usa responsavel_id)
    const gUser = by((t) => t.responsavel_id || 'sem_responsavel');
    const porUsuario = buildIndicadores(gUser, (k) => {
      if (k === 'sem_responsavel') return 'Sem responsável';
      const p = profilesById[k];
      return p?.full_name || p?.username || '—';
    });

    // Por empresa
    const gEmpresa = by((t) => t.empresa_id || 'sem_empresa');
    const porEmpresa = buildIndicadores(gEmpresa, (k) => (k === 'sem_empresa' ? 'Sem empresa' : k));

    // Por quadro (board)
    const gQuadro = by((t) => t.board_id || 'sem_quadro');
    const porQuadro = buildIndicadores(gQuadro, (k) => (k === 'sem_quadro' ? 'Sem quadro' : (boardsById[k]?.name || k)));

    // Ranking geral de tarefas por usuário (pontuação acumulada por concluidas)
    const rankingMap = new Map<string, { nome: string; pontos: number; resolvidas: number }>();
    gUser.forEach((list, k) => {
      const nome = k === 'sem_responsavel' ? 'Sem responsável' : (profilesById[k]?.full_name || profilesById[k]?.username || '—');
      const concluidas = list.filter((t) => isConcluida(t.status));
      const pontos = concluidas.reduce((acc, t) => acc + (PRIORITY_SCORES[t.prioridade] || 0), 0);
      rankingMap.set(k, { nome, pontos, resolvidas: concluidas.length });
    });
    const rankingGeral: RankingGeralItem[] = Array.from(rankingMap.values())
      .sort((a, b) => b.pontos - a.pontos)
      .map((r, idx) => ({ usuario: r.nome, pontuacao: Number(r.pontos.toFixed(2)), tarefasResolvidas: r.resolvidas, ranking: idx + 1 }));

    // Tempo total de resolução por usuário (proxy de "tempo de uso")
    const tempoUso: { usuario: string; horas: number }[] = [];
    gUser.forEach((list, k) => {
      const nome = k === 'sem_responsavel' ? 'Sem responsável' : (profilesById[k]?.full_name || profilesById[k]?.username || '—');
      const concluidas = list.filter((t) => isConcluida(t.status));
      const totalHoras = concluidas.reduce((acc, t) => acc + diffHoras(t.created_at, t.data_conclusao || t.updated_at || t.created_at), 0);
      tempoUso.push({ usuario: nome, horas: Number(totalHoras.toFixed(2)) });
    });
    tempoUso.sort((a, b) => b.horas - a.horas);

    return {
      indicadoresPorUsuario: porUsuario,
      indicadoresPorEmpresa: porEmpresa,
      indicadoresPorQuadro: porQuadro,
      rankingGeralTarefas: rankingGeral,
      tempoUsoPorUsuario: tempoUso,
    };
  }, [tarefas, profilesById, boardsById]);

  const barData = useMemo(() => {
    return calcular.indicadoresPorUsuario.slice(0, 10).map((i) => ({
      name: i.chave,
      concluidas: i.tarefasConcluidas,
      abertas: i.tarefasAbertas,
    }));
  }, [calcular]);

  return (
    <main>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Indicadores</h1>
        <p className="text-sm text-muted-foreground">Análise de tarefas por usuário, empresa e quadro, com ranking por pontuação.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ranking Geral de Tarefas (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {calcular.rankingGeralTarefas.slice(0, 10).map((r) => (
                <li key={r.ranking} className="flex items-center justify-between border-b last:border-none py-1 text-sm">
                  <span className="font-medium">#{r.ranking} {r.usuario}</span>
                  <span className="text-muted-foreground">{r.tarefasResolvidas} tarefas • {r.pontuacao} pts</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas (Concluídas vs Abertas) por Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                concluidas: { label: 'Concluídas', color: 'hsl(var(--success))' },
                abertas: { label: 'Abertas', color: 'hsl(var(--destructive))' },
              }}
              className="h-[280px]"
            >
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-12} height={50} textAnchor="end" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="concluidas" fill="var(--color-concluidas)" radius={4} activeBar={<Rectangle fillOpacity={0.8} />} />
                <Bar dataKey="abertas" fill="var(--color-abertas)" radius={4} activeBar={<Rectangle fillOpacity={0.8} />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tempo total de resolução por usuário (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {calcular.tempoUsoPorUsuario.slice(0, 10).map((u, idx) => (
                <li key={u.usuario + idx} className="flex items-center justify-between border-b last:border-none py-1 text-sm">
                  <span className="font-medium">#{idx + 1} {u.usuario}</span>
                  <span className="text-muted-foreground">{u.horas} h</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        
      </div>

      {loading && (
        <div className="py-6 text-center text-sm text-muted-foreground">Carregando dados...</div>
      )}
    </main>
  );
}

