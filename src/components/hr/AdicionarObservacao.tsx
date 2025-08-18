import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Upload, X, Image } from 'lucide-react';
import { saveObservacao } from '@/lib/historico';
import { useAuth } from '@/context/AuthContext';

interface AdicionarObservacaoProps {
  colaboradorId: string;
  onObservacaoAdicionada: (observacao: any) => void;
}

export function AdicionarObservacao({ colaboradorId, onObservacaoAdicionada }: AdicionarObservacaoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { hasAnyRole } = useAuth();
  const canAddObservation = hasAnyRole(['administrador', 'empresarial']);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Apenas imagens são permitidas",
        description: "Selecione apenas arquivos de imagem (PNG, JPG, JPEG).",
        variant: "destructive"
      });
    }
    
    setAnexos(prev => [...prev, ...imageFiles]);
  };

  const removeAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canAddObservation) {
      toast({
        title: 'Permissão insuficiente',
        description: 'Você não tem permissão para adicionar observações.',
        variant: 'destructive'
      });
      return;
    }
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
      const anexosUrls = anexos.map((file) => ({
        nome: file.name,
        url: URL.createObjectURL(file),
        tipo: 'image'
      }));

      const novaObservacao = await saveObservacao(colaboradorId, observacao);

      onObservacaoAdicionada({ ...novaObservacao, anexos: anexosUrls });

      toast({
        title: "Observação adicionada",
        description: "A observação foi registrada com sucesso."
      });

      setObservacao('');
      setAnexos([]);
      setIsOpen(false);

    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a observação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!canAddObservation}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Adicionar Observação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Observação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              placeholder="Digite sua observação aqui..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={4}
              disabled={!canAddObservation || isLoading}
            />
          </div>

          <div>
            <Label>Anexos (Imagens)</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                disabled={!canAddObservation || isLoading}
              />
            </div>
          </div>

          {anexos.length > 0 && (
            <div>
              <Label>Imagens Selecionadas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {anexos.map((file, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-2">
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeAnexo(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !canAddObservation}>
              {isLoading ? 'Salvando...' : 'Salvar Observação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}