import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PerfilComportamentalFormProps {
  perfil?: {
    tipo_perfil?: string;
    descricao?: string;
    pontos_fortes?: string[];
    areas_desenvolvimento?: string[];
    data_avaliacao?: string;
    avaliador?: string;
  };
  onChange: (perfil: any) => void;
}

export function PerfilComportamentalForm({ perfil, onChange }: PerfilComportamentalFormProps) {
  const [localPerfil, setLocalPerfil] = useState({
    tipo_perfil: perfil?.tipo_perfil || '',
    descricao: perfil?.descricao || '',
    pontos_fortes: perfil?.pontos_fortes || [],
    areas_desenvolvimento: perfil?.areas_desenvolvimento || [],
    data_avaliacao: perfil?.data_avaliacao || '',
    avaliador: perfil?.avaliador || ''
  });

  const [novoItem, setNovoItem] = useState('');
  const [tipoNovoItem, setTipoNovoItem] = useState<'pontos_fortes' | 'areas_desenvolvimento'>('pontos_fortes');
  const [dataAvaliacao, setDataAvaliacao] = useState<Date>();

  const updatePerfil = (updates: any) => {
    const novoPerfil = { ...localPerfil, ...updates };
    setLocalPerfil(novoPerfil);
    onChange(novoPerfil);
  };

  const adicionarItem = () => {
    if (!novoItem.trim()) return;
    
    const lista = [...localPerfil[tipoNovoItem], novoItem.trim()];
    updatePerfil({ [tipoNovoItem]: lista });
    setNovoItem('');
  };

  const removerItem = (tipo: 'pontos_fortes' | 'areas_desenvolvimento', index: number) => {
    const lista = localPerfil[tipo].filter((_, i) => i !== index);
    updatePerfil({ [tipo]: lista });
  };

  const tiposPerfil = [
    { value: 'DOMINANTE', label: 'Dominante (D)' },
    { value: 'INFLUENTE', label: 'Influente (I)' },
    { value: 'ESTAVEL', label: 'Estável (S)' },
    { value: 'CONSCIENCIOSO', label: 'Consciencioso (C)' },
    { value: 'ANALITICO', label: 'Analítico' },
    { value: 'EXPRESSIVO', label: 'Expressivo' },
    { value: 'MOTIVADOR', label: 'Motivador' },
    { value: 'FACILITADOR', label: 'Facilitador' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Perfil Comportamental</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Tipo de Perfil */}
        <div className="space-y-2">
          <Label htmlFor="tipo_perfil">Tipo de Perfil</Label>
          <Select 
            value={localPerfil.tipo_perfil} 
            onValueChange={(value) => updatePerfil({ tipo_perfil: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de perfil" />
            </SelectTrigger>
            <SelectContent>
              {tiposPerfil.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição do Perfil</Label>
          <Textarea
            id="descricao"
            placeholder="Descreva as características comportamentais do colaborador..."
            value={localPerfil.descricao}
            onChange={(e) => updatePerfil({ descricao: e.target.value })}
            rows={3}
          />
        </div>

        {/* Pontos Fortes */}
        <div className="space-y-3">
          <Label>Pontos Fortes</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar ponto forte..."
              value={tipoNovoItem === 'pontos_fortes' ? novoItem : ''}
              onChange={(e) => {
                setNovoItem(e.target.value);
                setTipoNovoItem('pontos_fortes');
              }}
              onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
            />
            <Button onClick={adicionarItem} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localPerfil.pontos_fortes.map((ponto, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                {ponto}
                <button
                  onClick={() => removerItem('pontos_fortes', index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Áreas de Desenvolvimento */}
        <div className="space-y-3">
          <Label>Áreas de Desenvolvimento</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar área de desenvolvimento..."
              value={tipoNovoItem === 'areas_desenvolvimento' ? novoItem : ''}
              onChange={(e) => {
                setNovoItem(e.target.value);
                setTipoNovoItem('areas_desenvolvimento');
              }}
              onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
            />
            <Button onClick={adicionarItem} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {localPerfil.areas_desenvolvimento.map((area, index) => (
              <Badge key={index} variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                {area}
                <button
                  onClick={() => removerItem('areas_desenvolvimento', index)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Data da Avaliação */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data da Avaliação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dataAvaliacao && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataAvaliacao ? format(dataAvaliacao, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataAvaliacao}
                  onSelect={(date) => {
                    setDataAvaliacao(date);
                    updatePerfil({ data_avaliacao: date ? date.toISOString() : '' });
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Avaliador */}
          <div className="space-y-2">
            <Label htmlFor="avaliador">Avaliador</Label>
            <Input
              id="avaliador"
              placeholder="Nome do avaliador"
              value={localPerfil.avaliador}
              onChange={(e) => updatePerfil({ avaliador: e.target.value })}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}