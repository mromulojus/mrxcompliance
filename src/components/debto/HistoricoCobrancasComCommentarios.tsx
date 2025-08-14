import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Calendar, 
  User,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HistoricoItem {
  id: string;
  tipo_acao: string;
  canal: string;
  descricao: string;
  resultado?: string;
  data_compromisso?: string;
  valor_negociado?: number;
  observacoes?: string;
  created_at: string;
  created_by: string;
  comentarios?: string[];
}

interface HistoricoCobrancasComComentariosProps {
  dividaId: string;
  devedorId: string;
}

export function HistoricoCobrancasComComentarios({ dividaId, devedorId }: HistoricoCobrancasComComentariosProps) {
  const [novoComentario, setNovoComentario] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Dados simulados do histórico
  const [historico, setHistorico] = useState<HistoricoItem[]>([
    {
      id: "1",
      tipo_acao: "CONTATO_TELEFONICO",
      canal: "telefone",
      descricao: "Tentativa de contato telefônico",
      resultado: "SEM_RESPOSTA",
      created_at: "2024-12-20T10:30:00Z",
      created_by: "João Operador",
      observacoes: "Telefone chamou mas não atendeu",
      comentarios: ["Tentativa realizada no horário comercial"]
    },
    {
      id: "2",
      tipo_acao: "ENVIO_EMAIL",
      canal: "email",
      descricao: "Email de cobrança enviado",
      resultado: "SUCESSO",
      created_at: "2024-12-18T14:15:00Z",
      created_by: "Maria Cobradora",
      observacoes: "Email entregue com sucesso",
      comentarios: ["Email aberto pelo destinatário", "Aguardando resposta"]
    },
    {
      id: "3",
      tipo_acao: "PROPOSTA_ACORDO",
      canal: "whatsapp",
      descricao: "Proposta de acordo apresentada",
      resultado: "PROMESSA",
      valor_negociado: 1500,
      data_compromisso: "2024-12-25",
      created_at: "2024-12-15T16:45:00Z",
      created_by: "Carlos Negociador",
      observacoes: "Cliente demonstrou interesse em negociar",
      comentarios: ["Proposta bem recebida", "Cliente solicitou prazo para análise"]
    }
  ]);

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'telefone':
        return <Phone className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getResultadoColor = (resultado?: string) => {
    switch (resultado) {
      case 'SUCESSO':
        return 'bg-green-100 text-green-700';
      case 'SEM_RESPOSTA':
        return 'bg-gray-100 text-gray-700';
      case 'PROMESSA':
        return 'bg-blue-100 text-blue-700';
      case 'RECUSA':
        return 'bg-red-100 text-red-700';
      case 'REAGENDADO':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  const adicionarComentario = (historicoId: string) => {
    if (!novoComentario.trim()) return;

    setHistorico(prev => prev.map(item => {
      if (item.id === historicoId) {
        return {
          ...item,
          comentarios: [...(item.comentarios || []), novoComentario]
        };
      }
      return item;
    }));

    setNovoComentario("");
    setIsAddingComment(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico de Cobranças</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Ação
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Upload Documentos
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {historico.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getCanalIcon(item.canal)}
                  <div>
                    <CardTitle className="text-base">{item.descricao}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.tipo_acao.replace('_', ' ')}
                      </Badge>
                      {item.resultado && (
                        <Badge className={`text-xs ${getResultadoColor(item.resultado)}`}>
                          {item.resultado}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" />
                    {item.created_by}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Observações */}
              {item.observacoes && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">{item.observacoes}</p>
                </div>
              )}

              {/* Informações adicionais */}
              {(item.valor_negociado || item.data_compromisso) && (
                <div className="grid grid-cols-2 gap-4 p-3 border rounded-md">
                  {item.valor_negociado && (
                    <div>
                      <span className="text-xs text-muted-foreground">Valor Negociado</span>
                      <p className="font-medium text-green-600">
                        {formatCurrency(item.valor_negociado)}
                      </p>
                    </div>
                  )}
                  {item.data_compromisso && (
                    <div>
                      <span className="text-xs text-muted-foreground">Data Compromisso</span>
                      <p className="font-medium">
                        {new Date(item.data_compromisso).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Comentários */}
              {item.comentarios && item.comentarios.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comentários ({item.comentarios.length})
                  </h5>
                  <div className="space-y-2">
                    {item.comentarios.map((comentario, index) => (
                      <div key={index} className="p-2 bg-blue-50 border-l-2 border-l-blue-200 rounded-r-md">
                        <p className="text-sm">{comentario}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adicionar comentário */}
              <div className="flex gap-2">
                <Dialog open={isAddingComment} onOpenChange={setIsAddingComment}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Adicionar Comentário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Comentário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Digite seu comentário..."
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddingComment(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={() => adicionarComentario(item.id)}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {historico.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum histórico encontrado</h3>
              <p className="text-muted-foreground text-center">
                As ações de cobrança aparecerão aqui
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}