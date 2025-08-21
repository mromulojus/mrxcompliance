import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHR } from '@/context/HRContext';
import { Denuncia, DenunciaStatus } from '@/types/denuncia';
import { AlertCircle, MessageSquare, Calendar, User, FileText, ExternalLink, Download, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface DenunciasEmpresaProps {
  empresaId: string;
}

export function DenunciasEmpresa({ empresaId }: DenunciasEmpresaProps) {
  const { denuncias, atualizarStatus, adicionarComentario, empresas } = useHR();
  const { toast } = useToast();
  
  const empresa = empresas.find(e => e.id === empresaId);
  const linkDenuncia = `${window.location.origin}/denuncia-publica/${empresaId}`;

  const handleSendEmail = async () => {
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    const email = emailInput?.value.trim();
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe um email válido.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-qr-code', {
        body: {
          toEmail: email,
          companyName: empresa?.nome || 'Empresa',
          qrCodeUrl: linkDenuncia,
          linkUrl: linkDenuncia
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        toast({
          title: "Erro ao enviar email",
          description: "Não foi possível enviar o email. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Email enviado!",
        description: `QR Code e link enviados para ${email}`,
      });
      
      emailInput.value = '';
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erro ao enviar email",
        description: "Erro interno. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [novoStatus, setNovoStatus] = useState<DenunciaStatus>('RECEBIDO');
  const [novoAnexoArquivos, setNovoAnexoArquivos] = useState<File[]>([]);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const [novoAnexoComentarios, setNovoAnexoComentarios] = useState<File[]>([]);
  const [uploadingComentarioAnexos, setUploadingComentarioAnexos] = useState(false);

  const denunciasEmpresa = denuncias.filter(d => d.empresaId === empresaId);
  
  const denunciasPorStatus = {
    RECEBIDO: denunciasEmpresa.filter(d => d.status === 'RECEBIDO'),
    EM_ANALISE: denunciasEmpresa.filter(d => d.status === 'EM_ANALISE'),
    INVESTIGACAO: denunciasEmpresa.filter(d => d.status === 'INVESTIGACAO'),
    CONCLUIDO: denunciasEmpresa.filter(d => d.status === 'CONCLUIDO'),
  };

  const statusLabels = {
    RECEBIDO: 'Recebidas',
    EM_ANALISE: 'Em Análise',
    INVESTIGACAO: 'Em Investigação',
    CONCLUIDO: 'Concluídas'
  };

  const statusColors = {
    RECEBIDO: 'bg-red-100 text-red-800',
    EM_ANALISE: 'bg-yellow-100 text-yellow-800',
    INVESTIGACAO: 'bg-blue-100 text-blue-800',
    CONCLUIDO: 'bg-green-100 text-green-800'
  };

  const tipoLabels = {
    DISCRIMINACAO: 'Discriminação',
    ASSEDIO_MORAL: 'Assédio Moral',
    CORRUPCAO: 'Corrupção',
    VIOLACAO_TRABALHISTA: 'Violação Trabalhista',
    OUTRO: 'Outro'
  };

  const handleAtualizarStatus = async () => {
    if (!selectedDenuncia) return;

    await atualizarStatus(selectedDenuncia.id, novoStatus);
    setSelectedDenuncia({ ...selectedDenuncia, status: novoStatus });

    toast({
      title: 'Status atualizado',
      description: `Denúncia ${selectedDenuncia.protocolo} foi marcada como ${statusLabels[novoStatus].toLowerCase()}.`
    });
  };

  const handleAdicionarComentario = async () => {
    if (!selectedDenuncia || !novoComentario.trim()) return;

    try {
      let anexosComentario: string[] = [];
      
      // Upload dos anexos do comentário se houver
      if (novoAnexoComentarios.length > 0) {
        setUploadingComentarioAnexos(true);
        const folder = `comentarios/empresa_${selectedDenuncia.empresaId}/${selectedDenuncia.id}`;
        
        for (const file of novoAnexoComentarios) {
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
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('denuncia-anexos')
            .upload(path, file, { cacheControl: '3600' });
          if (uploadError) throw uploadError;
          anexosComentario.push(uploadData.path);
        }
      }

      await adicionarComentario(selectedDenuncia.id, { 
        autor: 'Sistema', 
        mensagem: novoComentario,
        anexos: anexosComentario
      });
      
      setNovoComentario('');
      setNovoAnexoComentarios([]);

      // Atualizar denúncia local
      const updatedDenuncia = {
        ...selectedDenuncia,
        comentarios: [...selectedDenuncia.comentarios, {
          id: Date.now().toString(),
          denunciaId: selectedDenuncia.id,
          autor: 'Sistema',
          mensagem: novoComentario,
          anexos: anexosComentario,
          createdAt: new Date().toISOString()
        }]
      };
      setSelectedDenuncia(updatedDenuncia);

      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi registrado na denúncia.'
      });
    } catch (e: any) {
      console.error('Erro ao adicionar comentário:', e);
      toast({
        title: 'Erro ao adicionar comentário',
        description: e.message || 'Falha ao adicionar comentário',
        variant: 'destructive'
      });
    } finally {
      setUploadingComentarioAnexos(false);
    }
  };

  const handleUploadAnexos = async () => {
    if (!selectedDenuncia || novoAnexoArquivos.length === 0) return;
    try {
      setUploadingAnexos(true);
      const folder = `empresa_${selectedDenuncia.empresaId}/${selectedDenuncia.id}`;
      const anexosPaths: string[] = [];
      for (const file of novoAnexoArquivos) {
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
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('denuncia-anexos')
          .upload(path, file, { cacheControl: '3600' });
        if (uploadError) throw uploadError;
        anexosPaths.push(uploadData.path);
      }

      const novosAnexos = [...(selectedDenuncia.anexos || []), ...anexosPaths];
      await supabase
        .from('denuncias')
        .update({ anexos: novosAnexos })
        .eq('id', selectedDenuncia.id);

      setSelectedDenuncia({ ...selectedDenuncia, anexos: novosAnexos });
      setNovoAnexoArquivos([]);
      toast({ title: 'Anexos enviados', description: 'Arquivos anexados à denúncia.' });
    } catch (e: any) {
      console.error('Erro ao anexar arquivos:', e);
      toast({ title: 'Erro ao anexar', description: e.message || 'Falha ao enviar anexos', variant: 'destructive' });
    } finally {
      setUploadingAnexos(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header com Botão de Denúncia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Sistema de Denúncias
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Página de Denúncia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Página Pública de Denúncias</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <QRCodeComponent 
                      url={linkDenuncia}
                      title="Canal de Denúncias"
                      description="Escaneie para acessar"
                      size={180}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Link da página:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={linkDenuncia} 
                        readOnly 
                        className="flex-1 p-2 border rounded text-sm bg-muted"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(linkDenuncia);
                          toast({ title: 'Link copiado!', description: 'O link foi copiado para a área de transferência.' });
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enviar por email:</label>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="email@exemplo.com"
                        className="flex-1 p-2 border rounded text-sm"
                        id="email-input"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleSendEmail}
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(linkDenuncia, '_blank')}
                  >
                    Abrir Página de Denúncia
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(denunciasPorStatus).map(([status, denunciasList]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold">{denunciasList.length}</div>
                <div className="text-sm text-muted-foreground">{statusLabels[status as DenunciaStatus]}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Denúncias por Status */}
      {Object.entries(denunciasPorStatus).map(([status, denunciasList]) => (
        <Card key={status}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={statusColors[status as DenunciaStatus]}>
                {statusLabels[status as DenunciaStatus]} ({denunciasList.length})
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {denunciasList.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma denúncia {statusLabels[status as DenunciaStatus].toLowerCase()}
              </p>
            ) : (
              <div className="space-y-3">
                {denunciasList.map((denuncia) => (
                  <div key={denuncia.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {denuncia.protocolo}
                        </code>
                        <Badge variant="outline">
                          {tipoLabels[denuncia.tipo]}
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedDenuncia(denuncia)}>
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Denúncia {selectedDenuncia?.protocolo}</DialogTitle>
                          </DialogHeader>
                          {selectedDenuncia && (
                            <div className="space-y-4">
                              {/* Informações Básicas */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Tipo:</label>
                                  <p>{tipoLabels[selectedDenuncia.tipo]}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status:</label>
                                  <Badge className={statusColors[selectedDenuncia.status]}>
                                    {statusLabels[selectedDenuncia.status]}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Data:</label>
                                  <p>{formatDistanceToNow(new Date(selectedDenuncia.createdAt), { addSuffix: true, locale: ptBR })}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Identificado:</label>
                                  <p>{selectedDenuncia.identificado ? `Sim - ${selectedDenuncia.nome}` : 'Anônimo'}</p>
                                </div>
                                {selectedDenuncia.identificado && selectedDenuncia.email && (
                                  <div>
                                    <label className="text-sm font-medium">Email:</label>
                                    <p>{selectedDenuncia.email}</p>
                                  </div>
                                )}
                                {selectedDenuncia.identificado && (
                                  <div>
                                    <label className="text-sm font-medium">Relação com a empresa:</label>
                                    <p>{selectedDenuncia.relacao}</p>
                                  </div>
                                )}
                                {selectedDenuncia.identificado && (
                                  <div>
                                    <label className="text-sm font-medium">Como soube do fato:</label>
                                    <p>{selectedDenuncia.conhecimentoFato}</p>
                                  </div>
                                )}
                                {selectedDenuncia.identificado && (
                                  <div>
                                    <label className="text-sm font-medium">Envolvidos cientes:</label>
                                    <p>{selectedDenuncia.envolvidosCientes ? 'Sim' : 'Não'}</p>
                                  </div>
                                )}
                                {selectedDenuncia.setor && (
                                  <div>
                                    <label className="text-sm font-medium">Setor:</label>
                                    <p>{selectedDenuncia.setor}</p>
                                  </div>
                                )}
                              </div>

                              {/* Descrição */}
                              <div>
                                <label className="text-sm font-medium">Descrição:</label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">{selectedDenuncia.descricao}</p>
                              </div>

                              {selectedDenuncia.evidenciasDescricao && (
                                <div>
                                  <label className="text-sm font-medium">Evidências:</label>
                                  <p className="text-sm bg-muted p-3 rounded mt-1">{selectedDenuncia.evidenciasDescricao}</p>
                                </div>
                              )}

                              {selectedDenuncia.sugestao && (
                                <div>
                                  <label className="text-sm font-medium">Sugestão:</label>
                                  <p className="text-sm bg-muted p-3 rounded mt-1">{selectedDenuncia.sugestao}</p>
                                </div>
                              )}

                              {/* Anexos */}
                              <div className="space-y-3">
                                <label className="text-sm font-medium">Anexos:</label>
                                {selectedDenuncia.anexos && selectedDenuncia.anexos.length > 0 ? (
                                  <div className="space-y-2">
                                    {selectedDenuncia.anexos.map((path, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm flex-1 truncate">{path.split('/').pop()}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={async () => {
                                            const { data, error } = await supabase.storage
                                              .from('denuncia-anexos')
                                              .createSignedUrl(path, 60 * 5);
                                            if (!error && data?.signedUrl) {
                                              window.open(data.signedUrl, '_blank');
                                            }
                                          }}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
                                )}

                                <div className="space-y-2 pt-2">
                                  <Input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                                    onChange={(e) => setNovoAnexoArquivos(Array.from(e.target.files || []))}
                                    disabled={uploadingAnexos}
                                  />
                                  <Button onClick={handleUploadAnexos} disabled={novoAnexoArquivos.length === 0 || uploadingAnexos}>
                                    {uploadingAnexos ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Enviando...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Anexar Arquivos
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Atualizar Status */}
                              <Separator />
                              <div className="space-y-3">
                                <label className="text-sm font-medium">Atualizar Status:</label>
                                <div className="flex gap-2">
                                  <Select value={novoStatus} onValueChange={(value) => setNovoStatus(value as DenunciaStatus)}>
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="RECEBIDO">Recebido</SelectItem>
                                      <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                                      <SelectItem value="INVESTIGACAO">Em Investigação</SelectItem>
                                      <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button onClick={handleAtualizarStatus}>
                                    Atualizar
                                  </Button>
                                </div>
                              </div>

                              {/* Adicionar Comentário */}
                              <div className="space-y-3">
                                <label className="text-sm font-medium">Adicionar Comentário:</label>
                                <Textarea
                                  value={novoComentario}
                                  onChange={(e) => setNovoComentario(e.target.value)}
                                  placeholder="Digite seu comentário..."
                                  rows={3}
                                />
                                
                                {/* Anexos do comentário */}
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                                    onChange={(e) => setNovoAnexoComentarios(Array.from(e.target.files || []))}
                                    disabled={uploadingComentarioAnexos}
                                  />
                                  {novoAnexoComentarios.length > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                      {novoAnexoComentarios.length} arquivo(s) selecionado(s)
                                    </p>
                                  )}
                                </div>
                                
                                <Button 
                                  onClick={handleAdicionarComentario} 
                                  disabled={!novoComentario.trim() || uploadingComentarioAnexos}
                                >
                                  {uploadingComentarioAnexos ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Adicionar Comentário
                                    </>
                                  )}
                                </Button>
                              </div>

                              {/* Histórico de Comentários */}
                              {selectedDenuncia.comentarios.length > 0 && (
                                <div className="space-y-3">
                                  <Separator />
                                  <label className="text-sm font-medium">Histórico de Comentários:</label>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedDenuncia.comentarios.map((comentario) => (
                                      <div key={comentario.id} className="bg-muted p-3 rounded text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                          <User className="h-3 w-3" />
                                          <span className="font-medium">{comentario.autor}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comentario.createdAt), { addSuffix: true, locale: ptBR })}
                                          </span>
                                        </div>
                                        <p className="mb-2">{comentario.mensagem}</p>
                                        {/* Anexos do comentário */}
                                        {comentario.anexos && comentario.anexos.length > 0 && (
                                          <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Anexos:</p>
                                            <div className="space-y-1">
                                              {comentario.anexos.map((path, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-1 bg-background rounded">
                                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                                  <span className="text-xs flex-1 truncate">{path.split('/').pop()}</span>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={async () => {
                                                      const { data, error } = await supabase.storage
                                                        .from('denuncia-anexos')
                                                        .createSignedUrl(path, 60 * 5);
                                                      if (!error && data?.signedUrl) {
                                                        window.open(data.signedUrl, '_blank');
                                                      }
                                                    }}
                                                  >
                                                    <Download className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(denuncia.createdAt), { addSuffix: true, locale: ptBR })}
                      </div>
                      {denuncia.identificado && denuncia.nome && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {denuncia.nome}
                        </div>
                      )}
                      {denuncia.comentarios.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {denuncia.comentarios.length} comentário(s)
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm mt-2 line-clamp-2">{denuncia.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}