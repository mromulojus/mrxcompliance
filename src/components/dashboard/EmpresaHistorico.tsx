import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Plus, Paperclip, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmpresaHistoricoRow {
  id: string;
  empresa_id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  usuario_nome: string;
  anexos?: string[];
  meta?: any;
  created_at: string;
  created_by: string;
}

interface EmpresaHistoricoProps {
  empresaId: string;
  className?: string;
}

const EmpresaHistorico: React.FC<EmpresaHistoricoProps> = ({ empresaId, className }) => {
  const [historico, setHistorico] = useState<EmpresaHistoricoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  const { toast } = useToast();

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresa_historico')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        toast({ title: "Erro ao carregar histórico", variant: "destructive" });
        return;
      }

      setHistorico(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addManualHistorico = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      toast({ title: "Erro", description: "Título e descrição são obrigatórios", variant: "destructive" });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
        return;
      }

      // Buscar nome do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userData.user.id)
        .single();

      const userName = profile?.full_name || userData.user.email || 'Usuário';

      // URLs dos anexos (implementar upload se necessário)
      const anexosUrls: string[] = [];

      const { error } = await supabase
        .from('empresa_historico')
        .insert({
          empresa_id: empresaId,
          tipo: 'manual',
          titulo,
          descricao,
          usuario_nome: userName,
          anexos: anexosUrls,
          created_by: userData.user.id
        });

      if (error) {
        console.error('Erro ao adicionar histórico:', error);
        toast({ title: "Erro ao salvar histórico", variant: "destructive" });
        return;
      }

      toast({ title: "Sucesso", description: "Comentário adicionado ao histórico" });
      setShowAddDialog(false);
      setTitulo('');
      setDescricao('');
      setAnexos([]);
      fetchHistorico();
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
      toast({ title: "Erro ao salvar no histórico", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchHistorico();
    }
  }, [empresaId]);

  const formatTipo = (tipo: string) => {
    const tipos: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      'manual': { label: 'Comentário', variant: 'default', icon: <FileText className="h-3 w-3" /> },
      'tarefa': { label: 'Tarefa', variant: 'secondary', icon: <Calendar className="h-3 w-3" /> },
      'colaborador': { label: 'Colaborador', variant: 'default', icon: <FileText className="h-3 w-3" /> },
      'auditoria': { label: 'Auditoria', variant: 'outline', icon: <FileText className="h-3 w-3" /> },
      'cobranca': { label: 'Cobrança', variant: 'destructive', icon: <FileText className="h-3 w-3" /> },
      'sistema': { label: 'Sistema', variant: 'secondary', icon: <FileText className="h-3 w-3" /> },
    };
    return tipos[tipo.toLowerCase()] || { label: tipo, variant: 'default' as const, icon: <FileText className="h-3 w-3" /> };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Histórico da Empresa</CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Atualizado em {formatDate(lastUpdated.toISOString())}
            </span>
          )}
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Comentário ao Histórico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título do comentário"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição detalhada do comentário"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addManualHistorico}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistorico}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Nenhum registro encontrado
            </div>
          ) : (
            historico.map((item, index) => {
              const tipoFormatted = formatTipo(item.tipo);
              return (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {tipoFormatted.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={tipoFormatted.variant}>
                            {tipoFormatted.label}
                          </Badge>
                          <span className="text-sm font-medium">{item.titulo}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{item.descricao}</p>
                      
                      <div className="text-xs text-muted-foreground">
                        Por: {item.usuario_nome}
                      </div>
                      
                      {item.anexos && item.anexos.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3" />
                          {item.anexos.length} anexo(s)
                        </div>
                      )}
                      
                      {item.meta && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(item.meta, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < historico.length - 1 && <Separator />}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmpresaHistorico;