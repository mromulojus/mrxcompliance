import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EtiquetasFormProps {
  etiquetas?: {
    tipo_contrato_detalhado?: string;
    status_detalhado?: string;
    due_diligence?: boolean;
    data_due_diligence?: string;
  };
  onChange: (etiquetas: any) => void;
}

export function EtiquetasForm({ etiquetas, onChange }: EtiquetasFormProps) {
  const [localEtiquetas, setLocalEtiquetas] = useState({
    tipo_contrato_detalhado: etiquetas?.tipo_contrato_detalhado || '',
    status_detalhado: etiquetas?.status_detalhado || '',
    due_diligence: etiquetas?.due_diligence || false,
    data_due_diligence: etiquetas?.data_due_diligence || ''
  });

  const [dataDueDiligence, setDataDueDiligence] = useState<Date>();

  const updateEtiquetas = (updates: any) => {
    const novasEtiquetas = { ...localEtiquetas, ...updates };
    setLocalEtiquetas(novasEtiquetas);
    onChange(novasEtiquetas);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏷️ Etiquetas e Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Tipo de Contrato Detalhado */}
        <div className="space-y-2">
          <Label htmlFor="tipo_contrato_detalhado">Tipo de Contrato</Label>
          <Select 
            value={localEtiquetas.tipo_contrato_detalhado} 
            onValueChange={(value) => updateEtiquetas({ tipo_contrato_detalhado: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="ESTAGIO">ESTÁGIO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Detalhado */}
        <div className="space-y-2">
          <Label htmlFor="status_detalhado">Status Detalhado</Label>
          <Select 
            value={localEtiquetas.status_detalhado} 
            onValueChange={(value) => updateEtiquetas({ status_detalhado: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ATIVO">ATIVO</SelectItem>
              <SelectItem value="DESLIGADO">DESLIGADO</SelectItem>
              <SelectItem value="EM_CONTRATACAO">EM CONTRATAÇÃO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Diligence */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="due_diligence"
              checked={localEtiquetas.due_diligence}
              onCheckedChange={(checked) => updateEtiquetas({ due_diligence: checked })}
            />
            <Label htmlFor="due_diligence">AGD DUE DILIGENCE</Label>
          </div>

          {localEtiquetas.due_diligence && (
            <div className="space-y-2">
              <Label>Data do Due Diligence</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dataDueDiligence && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataDueDiligence ? format(dataDueDiligence, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataDueDiligence}
                    onSelect={(date) => {
                      setDataDueDiligence(date);
                      updateEtiquetas({ data_due_diligence: date ? date.toISOString() : '' });
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Preview das Etiquetas */}
        <div className="space-y-2">
          <Label>Preview das Etiquetas</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
            {localEtiquetas.status_detalhado && (
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                {localEtiquetas.status_detalhado}
              </Badge>
            )}
            {localEtiquetas.tipo_contrato_detalhado && (
              <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                {localEtiquetas.tipo_contrato_detalhado}
              </Badge>
            )}
            {localEtiquetas.due_diligence && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                AGD DUE DILIGENCE
              </Badge>
            )}
            {!localEtiquetas.status_detalhado && !localEtiquetas.tipo_contrato_detalhado && !localEtiquetas.due_diligence && (
              <span className="text-muted-foreground text-sm">Nenhuma etiqueta selecionada</span>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}