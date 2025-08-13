import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentUploadProps {
  colaboradorId: string;
  onUploadComplete?: (documento: any) => void;
}

export function DocumentUpload({ colaboradorId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use JPG, PNG, PDF ou DOC.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Selecione um arquivo e tipo de documento');
      return;
    }

    setUploading(true);
    
    try {
      // Create file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${colaboradorId}/${documentType}_${Date.now()}.${fileExt}`;

      console.log('Iniciando upload para bucket colaborador-docs:', fileName);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('colaborador-docs')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload bem-sucedido:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('colaborador-docs')
        .getPublicUrl(fileName);

      // Save document record to database
      const { data: docData, error: docError } = await supabase
        .from('documentos_colaborador')
        .insert({
          colaborador_id: colaboradorId,
          tipo: documentType as 'RG' | 'CPF' | 'CTPS' | 'COMPROVANTE_ENDERECO' | 'DIPLOMA' | 'CERTIDAO' | 'LAUDO' | 'CONTRATO' | 'OUTROS',
          nome: selectedFile.name,
          url: publicUrl
        })
        .select()
        .single();

      if (docError) {
        console.error('Erro ao salvar no banco:', docError);
        throw new Error(`Erro ao salvar documento: ${docError.message}`);
      }

      // Adicionar entrada no histórico
      await supabase
        .from('historico_colaborador')
        .insert({
          colaborador_id: colaboradorId,
          observacao: `Documento adicionado: ${selectedFile.name} (${documentType})`,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      toast.success('Documento enviado com sucesso!');
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      
      // Call callback
      onUploadComplete?.(docData);
      
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      toast.error(error.message || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload de Documento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-type">Tipo de Documento</Label>
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
          <Label htmlFor="file-upload">Arquivo</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          />
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
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
  );
}