import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  ExternalLink, 
  Calendar, 
  Download,
  Info,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface ICalSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string | null;
  empresas: Array<{ id: string; nome: string }>;
}

const MODULOS_DISPONIVEIS = [
  { id: 'tarefas', label: 'Tarefas', color: 'bg-blue-100 text-blue-800' },
  { id: 'processos', label: 'Processos Judiciais', color: 'bg-purple-100 text-purple-800' },
  { id: 'cobrancas', label: 'Cobranças', color: 'bg-red-100 text-red-800' },
  { id: 'hr', label: 'Recursos Humanos', color: 'bg-green-100 text-green-800' },
  { id: 'custom', label: 'Eventos Personalizados', color: 'bg-gray-100 text-gray-800' }
];

export const ICalSyncModal: React.FC<ICalSyncModalProps> = ({
  open,
  onOpenChange,
  empresaId,
  empresas
}) => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(empresaId || 'all');
  const [selectedModulos, setSelectedModulos] = useState<string[]>(['tarefas', 'processos']);
  const [incluirConcluidos, setIncluirConcluidos] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const iCalUrl = useMemo(() => {
    const baseUrl = 'https://pxpscjyeqmqqxzbttbep.supabase.co/functions/v1/calendar-ical';
    const params = new URLSearchParams();
    
    if (selectedEmpresa !== 'all') {
      params.append('empresa_id', selectedEmpresa);
    }
    
    if (selectedModulos.length > 0) {
      params.append('modulos', selectedModulos.join(','));
    }
    
    if (incluirConcluidos) {
      params.append('incluir_concluidos', 'true');
    }

    return `${baseUrl}?${params.toString()}`;
  }, [selectedEmpresa, selectedModulos, incluirConcluidos]);

  const handleModuloToggle = (moduloId: string) => {
    setSelectedModulos(prev => 
      prev.includes(moduloId) 
        ? prev.filter(id => id !== moduloId)
        : [...prev, moduloId]
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(iCalUrl);
      setLinkCopiado(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setLinkCopiado(false), 3000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const downloadICS = () => {
    window.open(iCalUrl, '_blank');
  };

  const empresaNome = selectedEmpresa === 'all' 
    ? 'Todas as empresas' 
    : empresas.find(e => e.id === selectedEmpresa)?.nome || 'Empresa selecionada';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sincronizar com Google Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações do Calendário</CardTitle>
              <CardDescription>
                Personalize quais eventos serão sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção de Empresa */}
              <div className="space-y-2">
                <Label htmlFor="empresa-select">Empresa</Label>
                <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {empresas.map(empresa => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Módulos */}
              <div className="space-y-3">
                <Label>Módulos a sincronizar</Label>
                <div className="grid grid-cols-2 gap-3">
                  {MODULOS_DISPONIVEIS.map(modulo => (
                    <div key={modulo.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={modulo.id}
                        checked={selectedModulos.includes(modulo.id)}
                        onCheckedChange={() => handleModuloToggle(modulo.id)}
                      />
                      <Label htmlFor={modulo.id} className="flex items-center gap-2 cursor-pointer">
                        <Badge className={modulo.color} variant="secondary">
                          {modulo.label}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opções Extras */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="incluir-concluidos"
                  checked={incluirConcluidos}
                  onCheckedChange={(checked) => setIncluirConcluidos(checked as boolean)}
                />
                <Label htmlFor="incluir-concluidos">
                  Incluir eventos já concluídos
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Resumo e Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Link de Sincronização</CardTitle>
              <CardDescription>
                Use este link para adicionar o calendário ao Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumo da Configuração */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Empresa:</span>
                  <Badge variant="outline">{empresaNome}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Módulos:</span>
                  <div className="flex gap-1">
                    {selectedModulos.map(moduloId => {
                      const modulo = MODULOS_DISPONIVEIS.find(m => m.id === moduloId);
                      return modulo ? (
                        <Badge key={moduloId} className={modulo.color} variant="secondary">
                          {modulo.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Eventos concluídos:</span>
                  <Badge variant={incluirConcluidos ? "default" : "secondary"}>
                    {incluirConcluidos ? 'Incluídos' : 'Não incluídos'}
                  </Badge>
                </div>
              </div>

              {/* Link de Sincronização */}
              <div className="space-y-2">
                <Label htmlFor="ical-url">URL do Calendário</Label>
                <div className="flex gap-2">
                  <Input
                    id="ical-url"
                    value={iCalUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className={linkCopiado ? "bg-green-100 text-green-800" : ""}
                  >
                    {linkCopiado ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button variant="outline" onClick={downloadICS}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar .ics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Como adicionar no Google Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Copie o link de sincronização acima</li>
                <li>Abra o Google Calendar em seu computador</li>
                <li>Do lado esquerdo, clique em "Outros calendários" e depois em "+"</li>
                <li>Selecione "Por URL"</li>
                <li>Cole o link copiado e clique em "Adicionar calendário"</li>
                <li>O calendário será sincronizado automaticamente!</li>
              </ol>
              
              <Separator className="my-4" />
              
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Importante:</p>
                  <p>O Google Calendar pode levar alguns minutos para sincronizar. Os eventos são atualizados automaticamente quando modificados no sistema.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};