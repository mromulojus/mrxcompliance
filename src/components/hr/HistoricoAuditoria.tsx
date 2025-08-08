import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Upload, FileText, Clock, Calendar } from 'lucide-react';
import { HistoricoMovimento } from '@/types/auditoria';
import { toast } from 'sonner';

interface HistoricoAuditoriaProps {
  isOpen: boolean;
  onClose: () => void;
  documento: string;
  historico: HistoricoMovimento[];
  onAdicionarComentario: (comentario: string) => void;
}

export function HistoricoAuditoria({ 
  isOpen, 
  onClose, 
  documento, 
  historico,
  onAdicionarComentario 
}: HistoricoAuditoriaProps) {
  const [novoComentario, setNovoComentario] = useState('');

  const handleAdicionarComentario = () => {
    if (!novoComentario.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    onAdicionarComentario(novoComentario);
    setNovoComentario('');
    toast.success('Comentário adicionado');
  };

  const getIconeMovimento = (tipo: HistoricoMovimento['tipo']) => {
    switch (tipo) {
      case 'ARQUIVO_UPLOAD':
        return <Upload className="h-4 w-4" />;
      case 'STATUS_MUDANCA':
        return <FileText className="h-4 w-4" />;
      case 'COMENTARIO':
        return <MessageSquare className="h-4 w-4" />;
      case 'VENCIMENTO_ALTERADO':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBadgeMovimento = (tipo: HistoricoMovimento['tipo']) => {
    switch (tipo) {
      case 'ARQUIVO_UPLOAD':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Upload</Badge>;
      case 'STATUS_MUDANCA':
        return <Badge variant="default" className="bg-green-100 text-green-800">Status</Badge>;
      case 'COMENTARIO':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Comentário</Badge>;
      case 'VENCIMENTO_ALTERADO':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Vencimento</Badge>;
      default:
        return <Badge variant="secondary">Geral</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Histórico: {documento}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Histórico de movimentos */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">MOVIMENTAÇÕES</h3>
            
            {historico.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação registrada
              </div>
            ) : (
              <div className="space-y-3">
                {historico.map((movimento) => (
                  <div key={movimento.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getIconeMovimento(movimento.tipo)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getBadgeMovimento(movimento.tipo)}
                          <span className="text-sm font-medium">{movimento.usuario}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(movimento.data).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{movimento.descricao}</p>
                      {movimento.comentario && (
                        <div className="bg-muted p-2 rounded text-sm">
                          {movimento.comentario}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Adicionar novo comentário */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">ADICIONAR COMENTÁRIO</h3>
            <div className="space-y-3">
              <Textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Digite seu comentário..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleAdicionarComentario} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Adicionar Comentário
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}