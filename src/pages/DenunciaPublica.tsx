import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, CheckCircle, Eye, EyeOff, FileText, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useHR } from '@/context/HRContext';

export default function DenunciaPublica() {
  const { empresaId } = useParams();
  const { toast } = useToast();
  const { criarDenuncia } = useHR();
  
  const [formData, setFormData] = useState({
    identificado: false,
    nome: '',
    email: '',
    relacao: '',
    tipo: '',
    setor: '',
    conhecimentoFato: '',
    envolvidosCientes: false,
    descricao: '',
    evidenciasDescricao: '',
    sugestao: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [protocolo, setProtocolo] = useState('');
  
  const [empresa, setEmpresa] = useState<{ id: string; nome: string } | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadEmpresa = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nome')
          .eq('id', empresaId)
          .limit(1);
        if (error) throw error;
        if (isMounted) setEmpresa(data && data.length ? (data[0] as any) : null);
      } catch (e) {
        if (isMounted) setEmpresa(null);
      } finally {
        if (isMounted) setLoadingEmpresa(false);
      }
    };
    if (empresaId) loadEmpresa();
    else {
      setEmpresa(null);
      setLoadingEmpresa(false);
    }
    return () => { isMounted = false; };
  }, [empresaId]);

  if (loadingEmpresa) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Carregando canal de denúncias…</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Aguarde enquanto buscamos os dados da empresa.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não conseguirmos carregar a empresa (por exemplo, RLS bloqueando SELECT para usuários anônimos),
  // ainda assim permitimos o acesso público ao formulário. Só redirecionamos caso não haja empresaId.
  if (!empresaId) {
    return <Navigate to="/404" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.relacao || !formData.tipo || !formData.conhecimentoFato || !formData.descricao) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.identificado && (!formData.nome || !formData.email)) {
      toast({
        title: 'Identificação incompleta',
        description: 'Para denúncias identificadas, nome e email são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Iniciando criação de denúncia...');
      setUploadingAnexos(false);
      
      // Upload anexos antes de criar a denúncia
      let anexosPaths: string[] = [];
      if (selectedFiles.length > 0) {
        console.log('Fazendo upload de anexos:', selectedFiles.length, 'arquivos');
        setUploadingAnexos(true);
        const folder = `empresa_${empresaId}/${Date.now()}_${Math.random().toString(36).slice(2)}`;
        
        for (const file of selectedFiles) {
          console.log('Processando arquivo:', file.name, 'Tamanho:', file.size);
          
          // Validações: tipo e tamanho (máx 10MB por arquivo)
          const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          if (!allowedTypes.includes(file.type)) {
            throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP, PDF ou DOC/DOCX.');
          }
          if (file.size > 10 * 1024 * 1024) {
            throw new Error('Arquivo muito grande. Máximo 10MB por arquivo.');
          }

          const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
          const path = `${folder}/${Date.now()}_${safeName}`;
          
          console.log('Fazendo upload para:', path);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('denuncia-anexos')
            .upload(path, file, { cacheControl: '3600' });
            
          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            throw uploadError;
          }
          
          console.log('Upload concluído:', uploadData.path);
          anexosPaths.push(uploadData.path);
        }
        setUploadingAnexos(false);
        console.log('Todos os anexos enviados:', anexosPaths);
      }

      console.log('Criando denúncia com dados:', formData);
      const denuncia = await criarDenuncia({
        empresaId: empresaId!,
        identificado: formData.identificado,
        nome: formData.identificado ? formData.nome : undefined,
        email: formData.identificado ? formData.email : undefined,
        relacao: formData.relacao as any,
        tipo: formData.tipo as any,
        setor: formData.setor || undefined,
        conhecimentoFato: formData.conhecimentoFato as any,
        envolvidosCientes: formData.envolvidosCientes,
        descricao: formData.descricao,
        evidenciasDescricao: formData.evidenciasDescricao || undefined,
        sugestao: formData.sugestao || undefined,
        anexos: anexosPaths.length ? anexosPaths : undefined,
      });

      if (!denuncia) {
        console.error('Denúncia retornou null');
        throw new Error('Falha ao criar denúncia - nenhum dado retornado');
      }

      console.log('Denúncia criada com sucesso:', denuncia);
      setProtocolo(denuncia.protocolo);
      setSubmitted(true);
      setSelectedFiles([]);

      toast({
        title: 'Denúncia registrada',
        description: `Protocolo ${denuncia.protocolo} gerado com sucesso.`
      });
    } catch (error) {
      console.error('Erro detalhado ao registrar denúncia:', error);
      setUploadingAnexos(false);
      
      let errorMessage = 'Ocorreu um erro ao registrar a denúncia. Tente novamente.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Denúncia Registrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Sua denúncia foi registrada com sucesso. Use o protocolo abaixo para acompanhar o andamento:
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-sm font-medium">Protocolo de Acompanhamento:</Label>
              <div className="text-2xl font-mono font-bold text-primary mt-1">
                {protocolo}
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Guarde este protocolo para consultas futuras</p>
              <p>• Você pode consultar o status em: <a href="/denuncias/consulta" className="text-primary hover:underline">/denuncias/consulta</a></p>
              <p>• Todas as denúncias são tratadas com confidencialidade</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/denuncias/consulta'}
                className="flex-1"
              >
                Consultar Status
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Nova Denúncia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-16 flex items-center justify-center">
              <img 
                src="/lovable-uploads/0bb1fa68-8f72-4b82-aa3a-0707d95cd69a.png" 
                alt="MRxCompliance Logo" 
                className="h-16 w-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Canal de Denúncias</CardTitle>
            <p className="text-muted-foreground">{empresa?.nome ?? 'Empresa'}</p>
            {!empresa && (
              <p className="text-xs text-muted-foreground mt-1">
                Canal público ativo. O nome da empresa pode não aparecer para proteger dados internos.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Este é um canal seguro e confidencial</p>
                  <p className="text-blue-700">
                    Todas as denúncias são tratadas com seriedade e sigilo. 
                    Você pode optar por se identificar ou fazer uma denúncia anônima.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar Denúncia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identificação */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="identificado"
                    checked={formData.identificado}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, identificado: checked as boolean })
                    }
                  />
                  <Label htmlFor="identificado" className="flex items-center gap-2">
                    {formData.identificado ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Quero me identificar (opcional)
                  </Label>
                </div>
                
                {formData.identificado && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Informações da Denúncia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="relacao">Qual sua relação com a empresa? *</Label>
                  <Select value={formData.relacao} onValueChange={(value) => setFormData({ ...formData, relacao: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLABORADOR">Colaborador(a)</SelectItem>
                      <SelectItem value="EX_COLABORADOR">Ex-colaborador(a)</SelectItem>
                      <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
                      <SelectItem value="CLIENTE">Cliente</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de denúncia *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCRIMINACAO">Discriminação</SelectItem>
                      <SelectItem value="ASSEDIO_MORAL">Assédio Moral</SelectItem>
                      <SelectItem value="CORRUPCAO">Corrupção</SelectItem>
                      <SelectItem value="VIOLACAO_TRABALHISTA">Violação Trabalhista</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor envolvido (opcional)</Label>
                  <Input
                    id="setor"
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    placeholder="Ex: RH, Vendas, TI..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conhecimentoFato">Como soube do fato? *</Label>
                  <Select value={formData.conhecimentoFato} onValueChange={(value) => setFormData({ ...formData, conhecimentoFato: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OUVI_FALAR">Ouvi falar</SelectItem>
                      <SelectItem value="DOCUMENTO">Através de documento</SelectItem>
                      <SelectItem value="COLEGA_TRABALHO">Colega de trabalho</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="envolvidos"
                  checked={formData.envolvidosCientes}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, envolvidosCientes: checked as boolean })
                  }
                />
                <Label htmlFor="envolvidos">
                  Os envolvidos têm conhecimento desta denúncia?
                </Label>
              </div>

              <Separator />

              {/* Descrição */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descreva o fato ocorrido *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva detalhadamente o que aconteceu..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidencias">Evidências (opcional)</Label>
                  <Textarea
                    id="evidencias"
                    value={formData.evidenciasDescricao}
                    onChange={(e) => setFormData({ ...formData, evidenciasDescricao: e.target.value })}
                    placeholder="Descreva evidências, documentos, testemunhas, etc..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sugestao">Sugestões para resolução (opcional)</Label>
                  <Textarea
                    id="sugestao"
                    value={formData.sugestao}
                    onChange={(e) => setFormData({ ...formData, sugestao: e.target.value })}
                    placeholder="Como você sugere que este problema seja resolvido?"
                    rows={3}
                  />
                </div>

                {/* Anexos */}
                <div className="space-y-2">
                  <Label htmlFor="anexos">Anexos (opcional, múltiplos, máx 10MB por arquivo)</Label>
                  <Input
                    id="anexos"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles(files);
                    }}
                    disabled={uploadingAnexos}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                            disabled={uploadingAnexos}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Aviso:</strong> Todas as informações fornecidas serão tratadas com confidencialidade 
                  e serão utilizadas exclusivamente para investigação e resolução da denúncia.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={uploadingAnexos}>
                {uploadingAnexos ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando anexos...
                  </>
                ) : (
                  'Registrar Denúncia'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}