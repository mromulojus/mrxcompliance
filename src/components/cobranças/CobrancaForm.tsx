import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface CobrancaFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

export function CobrancaForm({ onSubmit, initialData }: CobrancaFormProps) {
  const [formData, setFormData] = useState({
    tipo_acao: initialData?.tipo_acao || "",
    canal: initialData?.canal || "",
    resultado: initialData?.resultado || "",
    valor_negociado: initialData?.valor_negociado || "",
    data_compromisso: initialData?.data_compromisso || "",
    observacoes_complementares: initialData?.observacoes || ""
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Verificar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`);
        return;
      }

      // Criar URL temporária para o arquivo
      const url = URL.createObjectURL(file);
      
      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: url
      };

      setAttachments(prev => [...prev, newAttachment]);
      toast.success(`Arquivo ${file.name} adicionado com sucesso`);
    });

    // Limpar o input
    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
    toast.success("Arquivo removido");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      anexos: attachments.map(att => ({
        nome: att.name,
        tipo: att.type,
        tamanho: att.size,
        url: att.url
      }))
    };

    onSubmit?.(submitData);
    toast.success("Cobrança registrada com sucesso!");
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Cobrança</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_acao">Tipo de Ação</Label>
              <select
                id="tipo_acao"
                value={formData.tipo_acao}
                onChange={(e) => handleChange('tipo_acao', e.target.value)}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="">Selecionar tipo</option>
                <option value="LIGACAO">Ligação</option>
                <option value="EMAIL">E-mail</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="VISITA">Visita</option>
                <option value="CARTA">Carta</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canal">Canal</Label>
              <select
                id="canal"
                value={formData.canal}
                onChange={(e) => handleChange('canal', e.target.value)}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="">Selecionar canal</option>
                <option value="TELEFONE">Telefone</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">E-mail</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="CORRESPONDENCIA">Correspondência</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resultado">Resultado</Label>
              <select
                id="resultado"
                value={formData.resultado}
                onChange={(e) => handleChange('resultado', e.target.value)}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="">Selecionar resultado</option>
                <option value="SUCESSO">Sucesso</option>
                <option value="PARCIAL">Parcial</option>
                <option value="SEM_SUCESSO">Sem Sucesso</option>
                <option value="REAGENDADO">Reagendado</option>
                <option value="CONTATO_PERDIDO">Contato Perdido</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_negociado">Valor Negociado</Label>
              <Input
                id="valor_negociado"
                type="number"
                step="0.01"
                value={formData.valor_negociado}
                onChange={(e) => handleChange('valor_negociado', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_compromisso">Data de Compromisso</Label>
            <Input
              id="data_compromisso"
              type="date"
              value={formData.data_compromisso}
              onChange={(e) => handleChange('data_compromisso', e.target.value)}
            />
          </div>

          {/* Observações Complementares */}
          <div className="space-y-2">
            <Label htmlFor="observacoes_complementares">
              Observações Complementares
            </Label>
            <Textarea
              id="observacoes_complementares"
              value={formData.observacoes_complementares}
              onChange={(e) => handleChange('observacoes_complementares', e.target.value)}
              placeholder="Digite suas observações detalhadas sobre a cobrança..."
              className="min-h-[120px] resize-y"
            />
            <p className="text-xs text-muted-foreground">
              O campo se expande automaticamente conforme você digita.
            </p>
          </div>

          {/* Upload de Arquivos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Anexos</Label>
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Adicionar Arquivos
                </Button>
              </div>
            </div>

            {/* Lista de Anexos */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Arquivos Anexados:</p>
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG, XLSX, XLS</p>
              <p>• Tamanho máximo por arquivo: 10MB</p>
              <p>• Múltiplos arquivos podem ser selecionados</p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Cobrança
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}