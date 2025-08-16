import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Trash2,
  Plus
} from 'lucide-react';
import { useProcessosData } from '@/hooks/useProcessosData';
import type { DocumentoProcessoTipo } from '@/types/processos';

interface ProcessoDocumentosProps {
  processoId: string;
}

export function ProcessoDocumentos({ processoId }: ProcessoDocumentosProps) {
  const { documentos, fetchDocumentos } = useProcessosData();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (processoId) {
      fetchDocumentos(processoId);
    }
  }, [processoId]);

  const getTipoColor = (tipo: DocumentoProcessoTipo) => {
    const colors = {
      'inicial': 'bg-blue-100 text-blue-800',
      'contestacao': 'bg-red-100 text-red-800',
      'sentenca': 'bg-purple-100 text-purple-800',
      'recurso': 'bg-yellow-100 text-yellow-800',
      'acordo': 'bg-green-100 text-green-800',
      'comprovante': 'bg-gray-100 text-gray-800',
      'procuracao': 'bg-indigo-100 text-indigo-800',
      'outro': 'bg-orange-100 text-orange-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: DocumentoProcessoTipo) => {
    const labels = {
      'inicial': 'Petição Inicial',
      'contestacao': 'Contestação',
      'sentenca': 'Sentença',
      'recurso': 'Recurso',
      'acordo': 'Acordo',
      'comprovante': 'Comprovante',
      'procuracao': 'Procuração',
      'outro': 'Outro'
    };
    return labels[tipo] || tipo;
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Tamanho desconhecido';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const filteredDocumentos = documentos.filter(doc => {
    const matchesSearch = doc.nome_documento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !tipoFilter || doc.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Aqui você implementaria o upload real para o Supabase Storage
    // Por agora, apenas simula o upload
    setTimeout(() => {
      setUploading(false);
      // Refresh documents after upload
      fetchDocumentos(processoId);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Documentos do Processo</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os documentos relacionados ao processo
          </p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="file-upload">
            <Button className="gap-2 cursor-pointer" disabled={uploading}>
              <Upload className="h-4 w-4" />
              {uploading ? 'Enviando...' : 'Upload Documento'}
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="inicial">Petição Inicial</option>
                <option value="contestacao">Contestação</option>
                <option value="sentenca">Sentença</option>
                <option value="recurso">Recurso</option>
                <option value="acordo">Acordo</option>
                <option value="comprovante">Comprovante</option>
                <option value="procuracao">Procuração</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="grid gap-4">
        {filteredDocumentos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">
                {searchTerm || tipoFilter ? 'Nenhum documento encontrado' : 'Nenhum documento adicionado'}
              </h4>
              <p className="text-muted-foreground mb-4">
                {searchTerm || tipoFilter 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Faça upload do primeiro documento para este processo'
                }
              </p>
              {!searchTerm && !tipoFilter && (
                <label htmlFor="file-upload-empty">
                  <Button className="gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Upload Documento
                  </Button>
                  <input
                    id="file-upload-empty"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredDocumentos.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base mb-1">
                            {documento.nome_documento}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTipoColor(documento.tipo)}>
                              {getTipoLabel(documento.tipo)}
                            </Badge>
                            {documento.tags && documento.tags.length > 0 && (
                              <div className="flex gap-1">
                                {documento.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {documento.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{documento.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Tamanho:</span>
                          <p>{formatFileSize(documento.tamanho_arquivo)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Data do Upload:</span>
                          <p>{new Date(documento.data_upload).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span>
                          <p>{documento.mime_type || 'Não especificado'}</p>
                        </div>
                      </div>
                      
                      {documento.observacoes && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <strong>Observações:</strong> {documento.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo */}
      {filteredDocumentos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredDocumentos.length} documento(s) encontrado(s)
              </span>
              <span>
                Total: {formatFileSize(
                  filteredDocumentos.reduce((sum, doc) => sum + (doc.tamanho_arquivo || 0), 0)
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}