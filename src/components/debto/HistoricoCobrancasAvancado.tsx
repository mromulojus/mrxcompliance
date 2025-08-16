import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Phone, 
  Mail, 
  MessageCircle, 
  FileText, 
  Upload,
  Download,
  Calendar,
  DollarSign,
  User
} from "lucide-react";
import { useDebtoData } from "@/hooks/useDebtoData";
import { toast } from "sonner";

interface HistoricoItem {
  id: string;
  tipo_acao: string;
  canal: string;
  descricao: string;
  resultado?: string;
  valor_negociado?: number;
  data_compromisso?: string;
  observacoes?: string;
  anexos?: string[];
  created_at: string;
  created_by: string;
}

interface HistoricoCobrancasAvancadoProps {
  dividaId: string;
  devedorId: string;
}

export function HistoricoCobrancasAvancado({ dividaId, devedorId }: HistoricoCobrancasAvancadoProps) {
  const { historico, adicionarHistorico, fetchHistorico } = useDebtoData();
  const [historicoFiltrado, setHistoricoFiltrado] = useState<HistoricoItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo_acao: '',
    canal: '',
    descricao: '',
    resultado: '',
    valor_negociado: '',
    data_compromisso: '',
    observacoes: ''
  });
  const [arquivos, setArquivos] = useState<File[]>([]);

  useEffect(() => {
    fetchHistorico(dividaId);
  }, [dividaId]);

  useEffect(() => {
    // Filtrar histórico específico desta dívida
    const filtrado = historico.filter(h => h.divida_id === dividaId);
    setHistoricoFiltrado(filtrado as HistoricoItem[]);
  }, [historico, dividaId]);

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'telefone': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'presencial': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getResultadoColor = (resultado?: string) => {
    switch (resultado) {
      case 'sucesso': return 'bg-green-100 text-green-700';
      case 'sem_resposta': return 'bg-yellow-100 text-yellow-700';
      case 'negativa': return 'bg-red-100 text-red-700';
      case 'reagendado': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArquivos([...arquivos, ...files]);
  };

  const removeFile = (index: number) => {
    setArquivos(arquivos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simular upload de arquivos (implementar upload real depois)
      const anexosUrls = arquivos.map(file => `uploads/${file.name}`);
      
      await adicionarHistorico({
        divida_id: dividaId,
        devedor_id: devedorId,
        tipo_acao: formData.tipo_acao,
        canal: formData.canal,
        descricao: formData.descricao,
        resultado: formData.resultado || undefined,
        valor_negociado: formData.valor_negociado ? parseFloat(formData.valor_negociado) : undefined,
        data_compromisso: formData.data_compromisso || undefined,
        observacoes: formData.observacoes || undefined,
        anexos: anexosUrls.length > 0 ? anexosUrls : undefined
      });

      // Resetar formulário
      setFormData({
        tipo_acao: '',
        canal: '',
        descricao: '',
        resultado: '',
        valor_negociado: '',
        data_compromisso: '',
        observacoes: ''
      });
      setArquivos([]);
      setDialogOpen(false);
      
      // Recarregar histórico
      fetchHistorico(dividaId);
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Histórico de Cobrança</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Registro de Cobrança</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_acao">Tipo de Ação *</Label>
                  <Select value={formData.tipo_acao} onValueChange={(value) => setFormData({...formData, tipo_acao: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contato_inicial">Contato Inicial</SelectItem>
                      <SelectItem value="cobranca_amigavel">Cobrança Amigável</SelectItem>
                      <SelectItem value="negociacao">Negociação</SelectItem>
                      <SelectItem value="acordo">Acordo</SelectItem>
                      <SelectItem value="protesto">Protesto</SelectItem>
                      <SelectItem value="negativacao">Negativação</SelectItem>
                      <SelectItem value="judicial">Judicial</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="canal">Canal *</Label>
                  <Select value={formData.canal} onValueChange={(value) => setFormData({...formData, canal: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="carta">Carta</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descreva o que aconteceu neste contato..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resultado">Resultado</Label>
                  <Select value={formData.resultado} onValueChange={(value) => setFormData({...formData, resultado: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sucesso">Sucesso</SelectItem>
                      <SelectItem value="sem_resposta">Sem Resposta</SelectItem>
                      <SelectItem value="negativa">Negativa</SelectItem>
                      <SelectItem value="reagendado">Reagendado</SelectItem>
                      <SelectItem value="parcial">Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor_negociado">Valor Negociado</Label>
                  <Input
                    id="valor_negociado"
                    type="number"
                    step="0.01"
                    value={formData.valor_negociado}
                    onChange={(e) => setFormData({...formData, valor_negociado: e.target.value})}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_compromisso">Data de Compromisso</Label>
                  <Input
                    id="data_compromisso"
                    type="date"
                    value={formData.data_compromisso}
                    onChange={(e) => setFormData({...formData, data_compromisso: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              {/* Upload de Arquivos */}
              <div>
                <Label>Anexos</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Arquivos
                  </Button>
                </div>

                {arquivos.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {arquivos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Registro
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Histórico */}
      <div className="space-y-4">
        {historicoFiltrado.length > 0 ? (
          historicoFiltrado.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                    {getCanalIcon(item.canal)}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.tipo_acao.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground">
                          via {item.canal} • {formatDate(item.created_at)}
                        </p>
                      </div>
                      
                      {item.resultado && (
                        <Badge className={getResultadoColor(item.resultado)}>
                          {item.resultado.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm">{item.descricao}</p>

                    {/* Informações Adicionais */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {item.valor_negociado && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Valor: {formatCurrency(item.valor_negociado)}
                        </div>
                      )}
                      
                      {item.data_compromisso && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Compromisso: {new Date(item.data_compromisso).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {/* Observações */}
                    {item.observacoes && (
                      <div className="p-2 bg-muted rounded text-sm">
                        <strong>Observações:</strong> {item.observacoes}
                      </div>
                    )}

                    {/* Anexos */}
                    {item.anexos && item.anexos.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Anexos:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.anexos.map((anexo, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => {/* Implementar download */}}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              {anexo.split('/').pop()}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Nenhum registro de cobrança encontrado.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em "Adicionar Registro" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}