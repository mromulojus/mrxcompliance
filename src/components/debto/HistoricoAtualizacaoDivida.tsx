import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  FileText,
  Clock,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValorHistorico {
  id: string;
  valor: number;
  data_valor: string;
  descricao?: string;
  created_at: string;
  created_by?: string;
  tipo: 'atualizacao' | 'comentario';
}

interface HistoricoAtualizacaoDividaProps {
  devedorId: string;
}

export function HistoricoAtualizacaoDivida({ devedorId }: HistoricoAtualizacaoDividaProps) {
  const [historico, setHistorico] = useState<ValorHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoValor, setNovoValor] = useState('');
  const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoComentario, setNovoComentario] = useState('');

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      
      // Buscar histórico de atualizações das dívidas do devedor
      const { data: dividas } = await supabase
        .from('dividas')
        .select('id, valor_original, valor_atualizado, updated_at, created_at')
        .eq('devedor_id', devedorId);

      if (!dividas || dividas.length === 0) {
        setHistorico([]);
        return;
      }

      // Simular histórico de valores (na prática, isso seria uma tabela específica)
      const historicoSimulado: ValorHistorico[] = dividas.flatMap(divida => [
        {
          id: divida.id + '_original',
          valor: divida.valor_original,
          data_valor: divida.created_at,
          descricao: 'Valor original da dívida',
          created_at: divida.created_at,
          tipo: 'atualizacao' as const
        },
        {
          id: divida.id + '_atualizado',
          valor: divida.valor_atualizado,
          data_valor: divida.updated_at,
          descricao: 'Valor atualizado com correção',
          created_at: divida.updated_at,
          tipo: 'atualizacao' as const
        }
      ]);

      // Buscar dados do localStorage se houver comentários salvos
      const comentariosSalvos = localStorage.getItem(`comentarios_devedor_${devedorId}`);
      if (comentariosSalvos) {
        const comentarios = JSON.parse(comentariosSalvos);
        comentarios.forEach((comentario: any) => {
          historicoSimulado.push({
            id: comentario.id,
            valor: 0,
            data_valor: comentario.data,
            descricao: comentario.texto,
            created_at: comentario.data,
            tipo: 'comentario' as const
          });
        });
      }

      setHistorico(historicoSimulado.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de atualizações');
    } finally {
      setLoading(false);
    }
  };

  const adicionarValor = () => {
    if (!novoValor || !novaData) {
      toast.error('Valor e data são obrigatórios');
      return;
    }

    const novoItem: ValorHistorico = {
      id: Date.now().toString(),
      valor: parseFloat(novoValor),
      data_valor: novaData,
      descricao: novaDescricao || undefined,
      created_at: new Date().toISOString(),
      tipo: 'atualizacao'
    };

    setHistorico(prev => [novoItem, ...prev]);
    
    // Salvar no localStorage
    const historicos = localStorage.getItem(`valores_devedor_${devedorId}`) || '[]';
    const historicoArray = JSON.parse(historicos);
    historicoArray.push(novoItem);
    localStorage.setItem(`valores_devedor_${devedorId}`, JSON.stringify(historicoArray));

    setNovoValor('');
    setNovaData(new Date().toISOString().split('T')[0]);
    setNovaDescricao('');
    
    toast.success('Valor adicionado ao histórico!');
  };

  const adicionarComentario = () => {
    if (!novoComentario.trim()) {
      toast.error('Comentário não pode estar vazio');
      return;
    }

    const novoItem: ValorHistorico = {
      id: Date.now().toString(),
      valor: 0,
      data_valor: new Date().toISOString(),
      descricao: novoComentario,
      created_at: new Date().toISOString(),
      tipo: 'comentario'
    };

    setHistorico(prev => [novoItem, ...prev]);
    
    // Salvar no localStorage
    const comentarios = localStorage.getItem(`comentarios_devedor_${devedorId}`) || '[]';
    const comentariosArray = JSON.parse(comentarios);
    comentariosArray.push({
      id: novoItem.id,
      texto: novoComentario,
      data: new Date().toISOString()
    });
    localStorage.setItem(`comentarios_devedor_${devedorId}`, JSON.stringify(comentariosArray));

    setNovoComentario('');
    toast.success('Comentário adicionado!');
  };

  const removerItem = (id: string) => {
    setHistorico(prev => prev.filter(item => item.id !== id));
    toast.success('Item removido do histórico');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchHistorico();
  }, [devedorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Novo Valor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Adicionar Valor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg items-end">
            <div className="space-y-2">
              <Label className="text-xs">Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Data do valor</Label>
              <Input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Descrição (opcional)</Label>
              <Input
                type="text"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Descrição"
              />
            </div>
          </div>

          <Button onClick={adicionarValor} className="gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            Adicionar valor
          </Button>
        </CardContent>
      </Card>

      {/* Adicionar Comentário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Adicionar Comentário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Digite um comentário sobre as alterações ou situação do devedor..."
            className="min-h-[100px]"
          />
          <Button onClick={adicionarComentario} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Comentário
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Valores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Histórico de Valores e Comentários
            </CardTitle>
            <Button onClick={fetchHistorico} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {historico.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum histórico encontrado</p>
              <p className="text-sm">Adicione valores ou comentários para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg items-center text-sm font-medium bg-muted/50">
                <div>Valor</div>
                <div>Data Valor</div>
                <div>Descrição</div>
                <div>Ações</div>
              </div>
              
              {/* Itens do histórico */}
              {historico.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg items-center text-sm">
                  <div className="flex items-center gap-2">
                    {item.tipo === 'comentario' ? (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Comentário
                      </Badge>
                    ) : (
                      <span className="font-medium">{formatCurrency(item.valor)}</span>
                    )}
                  </div>
                  <div>{formatDate(item.data_valor)}</div>
                  <div className="truncate" title={item.descricao}>{item.descricao || '-'}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => removerItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}