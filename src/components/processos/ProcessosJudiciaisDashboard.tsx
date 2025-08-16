import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Calendar, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { useProcessosData } from '@/hooks/useProcessosData';
import { ProcessoDetalhes } from './ProcessoDetalhes';
import { FormProcesso } from './FormProcesso';
import { CalendarioEventos } from './CalendarioEventos';
import { ProcessoKPICards } from './ProcessoKPICards';
import type { ProcessoJudicial, ProcessoFiltros } from '@/types/processos';

interface ProcessosJudiciaisDashboardProps {
  empresaId: string;
}

export function ProcessosJudiciaisDashboard({ empresaId }: ProcessosJudiciaisDashboardProps) {
  const { 
    processos, 
    loading, 
    fetchProcessos,
    fetchEventos,
    eventos 
  } = useProcessosData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoJudicial | null>(null);
  const [activeTab, setActiveTab] = useState('lista');

  useEffect(() => {
    if (empresaId) {
      const filtros: ProcessoFiltros = { empresa_id: empresaId };
      if (statusFilter) filtros.status = statusFilter as any;
      if (searchTerm) filtros.numero_processo = searchTerm;
      
      fetchProcessos(filtros);
      fetchEventos({ empresa_id: empresaId });
    }
  }, [empresaId, statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'suspenso': 'bg-yellow-100 text-yellow-800',
      'arquivado': 'bg-gray-100 text-gray-800',
      'transitado_julgado': 'bg-blue-100 text-blue-800',
      'baixado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const processosAtivos = processos.filter(p => p.status === 'ativo');
  const proximosEventos = eventos.filter(e => 
    new Date(e.data_inicio) >= new Date() && 
    new Date(e.data_inicio) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  if (selectedProcesso) {
    return (
      <ProcessoDetalhes 
        processo={selectedProcesso}
        onBack={() => setSelectedProcesso(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Processos Judiciais</h1>
          <p className="text-muted-foreground">
            Gestão completa de processos e eventos jurídicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Processo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ProcessoKPICards 
        processos={processos}
        eventos={eventos}
        empresaId={empresaId}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista" className="gap-2">
            <FileText className="h-4 w-4" />
            Processos
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número do processo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="suspenso">Suspenso</option>
                    <option value="arquivado">Arquivado</option>
                    <option value="transitado_julgado">Transitado em Julgado</option>
                    <option value="baixado">Baixado</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Processos */}
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando processos...</p>
                </CardContent>
              </Card>
            ) : processos.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum processo encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie o primeiro processo judicial para começar
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    Criar Processo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              processos.map((processo) => (
                <Card 
                  key={processo.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProcesso(processo)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{processo.titulo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {processo.numero_processo}
                            </p>
                          </div>
                          <Badge className={getStatusColor(processo.status)}>
                            {processo.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Ação:</span>
                            <p className="text-muted-foreground">{processo.acao}</p>
                          </div>
                          <div>
                            <span className="font-medium">Autor:</span>
                            <p className="text-muted-foreground">{processo.autor}</p>
                          </div>
                          <div>
                            <span className="font-medium">Réu:</span>
                            <p className="text-muted-foreground">{processo.reu}</p>
                          </div>
                          <div>
                            <span className="font-medium">Valor da Causa:</span>
                            <p className="text-muted-foreground">
                              {formatCurrency(processo.valor_causa)}
                            </p>
                          </div>
                        </div>

                        {processo.tribunal && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Tribunal:</span>
                            <span className="text-muted-foreground ml-1">{processo.tribunal}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(processo.data_cadastro).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendario">
          <CalendarioEventos empresaId={empresaId} />
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios em Desenvolvimento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Módulo de estatísticas e relatórios será implementado na próxima versão.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal do Formulário */}
      {showForm && (
        <FormProcesso
          empresaId={empresaId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchProcessos({ empresa_id: empresaId });
          }}
        />
      )}
    </div>
  );
}