import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Upload,
  FileText,
  Calendar,
  UserPlus,
  DollarSign,
  AlertTriangle,
  Users,
  CheckSquare,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EmpresaHistoricoRow = {
  id: string;
  empresa_id: string;
  tipo: string;
  descricao: string;
  meta: any | null;
  created_at: string;
  created_by: string;
};

interface EmpresaHistoricoProps {
  empresaId: string;
}

export function EmpresaHistorico({ empresaId }: EmpresaHistoricoProps) {
  const [historico, setHistorico] = useState<EmpresaHistoricoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoComentario, setNovoComentario] = useState("");
  const { toast } = useToast();

  const fetchHistorico = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("historico_empresa")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    } else {
      setHistorico((data || []) as EmpresaHistoricoRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistorico();
    // Opcional: assinatura em tempo real
    const channel = supabase
      .channel(`historico_empresa_${empresaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'historico_empresa', filter: `empresa_id=eq.${empresaId}` },
        () => {
          fetchHistorico();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId]);

  const handleAdicionarComentario = async () => {
    if (!novoComentario.trim()) return;
    const { error } = await supabase.from("historico_empresa").insert({
      empresa_id: empresaId,
      tipo: "COMENTARIO",
      descricao: novoComentario,
      meta: null
    });
    if (error) {
      toast({ title: "Falha ao adicionar comentário", description: error.message, variant: "destructive" });
      return;
    }
    setNovoComentario("");
    toast({ title: "Comentário adicionado" });
    fetchHistorico();
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'COMENTARIO':
        return <MessageSquare className="h-4 w-4" />;
      case 'ARQUIVO_UPLOAD':
        return <Upload className="h-4 w-4" />;
      case 'STATUS_MUDANCA':
        return <FileText className="h-4 w-4" />;
      case 'VENCIMENTO_ALTERADO':
        return <Calendar className="h-4 w-4" />;
      case 'COLABORADOR_CRIADO':
      case 'COLABORADOR_ATUALIZADO':
      case 'COLABORADOR_DELETADO':
        return <Users className="h-4 w-4" />;
      case 'DENUNCIA_CRIADA':
      case 'DENUNCIA_ATUALIZADA':
      case 'DENUNCIA_DELETADA':
        return <AlertTriangle className="h-4 w-4" />;
      case 'DEVEDOR_CRIADO':
      case 'DEVEDOR_ATUALIZADO':
      case 'DEVEDOR_DELETADO':
        return <UserPlus className="h-4 w-4" />;
      case 'DIVIDA_CRIADA':
      case 'DIVIDA_ATUALIZADA':
      case 'DIVIDA_DELETADA':
        return <DollarSign className="h-4 w-4" />;
      case 'ACORDO_CRIADO':
      case 'ACORDO_ATUALIZADO':
      case 'ACORDO_DELETADO':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBadge = (tipo: string) => {
    const map: Record<string, { text: string; className: string }> = {
      COMENTARIO: { text: 'Comentário', className: 'bg-purple-100 text-purple-800' },
      ARQUIVO_UPLOAD: { text: 'Upload', className: 'bg-blue-100 text-blue-800' },
      STATUS_MUDANCA: { text: 'Status', className: 'bg-green-100 text-green-800' },
      VENCIMENTO_ALTERADO: { text: 'Vencimento', className: 'bg-orange-100 text-orange-800' },
      COLABORADOR_CRIADO: { text: 'Colaborador', className: 'bg-gray-100 text-gray-800' },
      COLABORADOR_ATUALIZADO: { text: 'Colaborador', className: 'bg-gray-100 text-gray-800' },
      COLABORADOR_DELETADO: { text: 'Colaborador', className: 'bg-gray-100 text-gray-800' },
      DENUNCIA_CRIADA: { text: 'Denúncia', className: 'bg-yellow-100 text-yellow-800' },
      DENUNCIA_ATUALIZADA: { text: 'Denúncia', className: 'bg-yellow-100 text-yellow-800' },
      DENUNCIA_DELETADA: { text: 'Denúncia', className: 'bg-yellow-100 text-yellow-800' },
      DEVEDOR_CRIADO: { text: 'Devedor', className: 'bg-slate-100 text-slate-800' },
      DEVEDOR_ATUALIZADO: { text: 'Devedor', className: 'bg-slate-100 text-slate-800' },
      DEVEDOR_DELETADO: { text: 'Devedor', className: 'bg-slate-100 text-slate-800' },
      DIVIDA_CRIADA: { text: 'Dívida', className: 'bg-red-100 text-red-800' },
      DIVIDA_ATUALIZADA: { text: 'Dívida', className: 'bg-red-100 text-red-800' },
      DIVIDA_DELETADA: { text: 'Dívida', className: 'bg-red-100 text-red-800' },
      ACORDO_CRIADO: { text: 'Acordo', className: 'bg-emerald-100 text-emerald-800' },
      ACORDO_ATUALIZADO: { text: 'Acordo', className: 'bg-emerald-100 text-emerald-800' },
      ACORDO_DELETADO: { text: 'Acordo', className: 'bg-emerald-100 text-emerald-800' }
    };
    const info = map[tipo] || { text: 'Geral', className: 'bg-muted text-foreground' };
    return <Badge className={info.className}>{info.text}</Badge>;
  };

  const empty = useMemo(() => !loading && historico.length === 0, [loading, historico]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Histórico & Comentários</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Adicionar comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            className="min-h-[60px]"
          />
          <Button onClick={handleAdicionarComentario} disabled={!novoComentario.trim()}>
            Adicionar
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando histórico...</div>
        ) : empty ? (
          <div className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</div>
        ) : (
          <div className="space-y-3">
            {historico.map((evt) => (
              <div key={evt.id} className="flex gap-3 p-3 border rounded-lg">
                <div className="mt-1">{getIcone(evt.tipo)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getBadge(evt.tipo)}
                      <span className="text-sm font-medium">{evt.descricao}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(evt.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {evt.meta && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
{JSON.stringify(evt.meta, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

