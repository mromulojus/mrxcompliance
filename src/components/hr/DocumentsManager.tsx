import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { saveObservacao } from '@/lib/historico';
import { toast } from 'sonner';

interface Document {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  data_upload: string;
}

interface DocumentsManagerProps {
  colaboradorId: string;
  onDocumentChange?: () => void;
}

const documentTypes = [
  { value: 'RG', label: 'RG' },
  { value: 'CPF', label: 'CPF' },
  { value: 'CTPS', label: 'CTPS' },
  { value: 'COMPROVANTE_ENDERECO', label: 'Comprovante de Endereço' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIDAO', label: 'Certidão' },
  { value: 'LAUDO', label: 'Laudo' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'OUTROS', label: 'Outros' }
];

export function DocumentsManager({ colaboradorId, onDocumentChange }: DocumentsManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (colaboradorId) {
      loadDocuments();
    }
  }, [colaboradorId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documentos_colaborador')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .order('data_upload', { ascending: false });

      if (error) {
        console.error('Erro ao carregar documentos:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP, PDF ou DOC.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentType || !colaboradorId) {
      toast.error('Selecione um arquivo e tipo de documento');
      return;
    }

    setUploading(true);
    
    try {
      // Create unique file name
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${colaboradorId}/${documentType}_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName, 'Size:', selectedFile.size);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('colaborador-docs')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('colaborador-docs')
        .getPublicUrl(fileName);

      // Save document record to database
      const { data: docData, error: docError } = await supabase
        .from('documentos_colaborador')
        .insert({
          colaborador_id: colaboradorId,
          tipo: documentType as any,
          nome: selectedFile.name,
          url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (docError) {
        console.error('Database error:', docError);
        throw new Error(`Erro ao salvar documento: ${docError.message}`);
      }

      // Registra o envio no histórico utilizando utilitário compartilhado
      await saveObservacao(
        colaboradorId,
        `Documento adicionado: ${selectedFile.name} (${documentType})`
      );

      toast.success('Documento enviado com sucesso!');
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      
      // Reload documents
      await loadDocuments();
      onDocumentChange?.();
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId: string, documentUrl: string) => {
    try {
      // Extract file path from URL - get everything after the bucket name
      const urlParts = documentUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'colaborador-docs');
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      console.log('Deleting file path:', filePath);
      
      // Delete from storage
      await supabase.storage
        .from('colaborador-docs')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('documentos_colaborador')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      // Registra a remoção no histórico através do utilitário padronizado
      const document = documents.find(d => d.id === docId);
      await saveObservacao(
        colaboradorId,
        `Documento removido: ${document?.nome || 'Documento'}`
      );

      toast.success('Documento removido com sucesso!');
      await loadDocuments();
      onDocumentChange?.();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao remover documento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enviar Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Tipo de Documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo *</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              disabled={uploading}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Button 
            onClick={uploadDocument}
            disabled={!selectedFile || !documentType || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Documento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento enviado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {documentTypes.find(t => t.value === doc.tipo)?.label || doc.tipo}
                      {' • '}
                      {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      title="Visualizar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id, doc.url)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}