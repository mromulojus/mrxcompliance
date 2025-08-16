import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AdicionarObservacaoInlineProps {
  colaboradorId: string;
  onObservacaoAdicionada: (observacao: any) => void;
}

export function AdicionarObservacaoInline({ colaboradorId, onObservacaoAdicionada }: AdicionarObservacaoInlineProps) {
  const [observacao, setObservacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!observacao.trim()) {
      toast({
        title: "Observação obrigatória",
        description: "Digite uma observação antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      const novaObservacao = {
        id: Date.now().toString(),
        colaborador_id: colaboradorId,
        observacao: observacao,
        created_at: new Date().toISOString(),
        created_by: user?.id || 'usuario_atual'
      };

      // Aqui você salvaria no banco de dados
      // await saveObservacao(colaboradorId, novaObservacao);

      onObservacaoAdicionada(novaObservacao);
      
      toast({
        title: "Observação adicionada",
        description: "A observação foi registrada com sucesso."
      });

      // Reset form
      setObservacao('');
      
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a observação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Nova Observação</h4>
      <Textarea
        placeholder="Digite uma observação sobre o colaborador..."
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
        rows={3}
        className="resize-none"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !observacao.trim()}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isLoading ? 'Adicionando...' : 'Adicionar Observação'}
      </Button>
    </div>
  );
}