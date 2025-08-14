import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: number;
  errors: { line: number; error: string }[];
  total: number;
}

interface Empresa {
  id: string;
  nome: string;
}

interface ImportarDevedoresProps {
  onClose?: () => void;
  empresas: Empresa[];
  onSuccess?: () => void;
}

export function ImportarDevedores({ onClose, empresas, onSuccess }: ImportarDevedoresProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      'nome',
      'documento', 
      'tipo_pessoa',
      'email_principal',
      'email_secundario',
      'telefone_principal',
      'telefone_whatsapp',
      'telefones_outros',
      'endereco_completo',
      'cep',
      'cidade',
      'estado',
      'score_recuperabilidade',
      'canal_preferencial',
      'local_trabalho',
      'contato_emergencia_nome',
      'contato_emergencia_telefone',
      'observacoes'
    ];
    
    const csvContent = headers.join(',') + '\n' +
      'João Silva Devedor,123.456.789-00,FISICA,joao@email.com,joao2@email.com,(11) 99999-9999,(11) 99999-9999,"(11) 88888-8888;(11) 77777-7777",Rua das Flores 123,01234-567,São Paulo,SP,75,whatsapp,Empresa ABC,Maria Silva,(11) 95555-5555,Cliente com histórico de atraso\n' +
      'Empresa XYZ LTDA,12.345.678/0001-90,JURIDICA,contato@empresaxyz.com,,14 3333-4444,14 99999-8888,,Av. Comercial 456,14000-000,Bauru,SP,60,email,Setor Financeiro,José Santos,14 98888-7777,Empresa de médio porte';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_devedores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      row._lineNumber = i + 1;
      data.push(row);
    }
    
    return data;
  };

  const validateDevedor = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.nome) errors.push('Nome é obrigatório');
    if (!data.documento) errors.push('CPF/CNPJ é obrigatório');
    if (!data.tipo_pessoa || !['FISICA', 'JURIDICA'].includes(data.tipo_pessoa)) {
      errors.push('Tipo pessoa deve ser FISICA ou JURIDICA');
    }
    
    // Validação básica de CPF/CNPJ
    if (data.tipo_pessoa === 'FISICA' && data.documento) {
      const cpf = data.documento.replace(/\D/g, '');
      if (cpf.length !== 11) errors.push('CPF deve ter 11 dígitos');
    }
    if (data.tipo_pessoa === 'JURIDICA' && data.documento) {
      const cnpj = data.documento.replace(/\D/g, '');
      if (cnpj.length !== 14) errors.push('CNPJ deve ter 14 dígitos');
    }

    if (data.canal_preferencial && !['whatsapp', 'telefone', 'email'].includes(data.canal_preferencial)) {
      errors.push('Canal preferencial deve ser whatsapp, telefone ou email');
    }

    if (data.score_recuperabilidade && (isNaN(Number(data.score_recuperabilidade)) || Number(data.score_recuperabilidade) < 0 || Number(data.score_recuperabilidade) > 100)) {
      errors.push('Score de recuperabilidade deve ser um número entre 0 e 100');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const processImport = async () => {
    if (!file || !selectedEmpresa) return;
    
    setImporting(true);
    setProgress(0);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const text = await file.text();
      const data = parseCSV(text);
      
      const results: ImportResult = {
        success: 0,
        errors: [],
        total: data.length
      };
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const validation = validateDevedor(row);
        
        if (validation.valid) {
          try {
            const devedorData = {
              empresa_id: selectedEmpresa,
              nome: row.nome,
              documento: row.documento,
              tipo_pessoa: row.tipo_pessoa,
              email_principal: row.email_principal || null,
              email_secundario: row.email_secundario || null,
              telefone_principal: row.telefone_principal || null,
              telefone_whatsapp: row.telefone_whatsapp || null,
              telefones_outros: row.telefones_outros ? row.telefones_outros.split(';') : null,
              endereco_completo: row.endereco_completo || null,
              cep: row.cep || null,
              cidade: row.cidade || null,
              estado: row.estado || null,
              score_recuperabilidade: row.score_recuperabilidade ? Number(row.score_recuperabilidade) : 0,
              canal_preferencial: row.canal_preferencial || 'whatsapp',
              local_trabalho: row.local_trabalho || null,
              contato_emergencia_nome: row.contato_emergencia_nome || null,
              contato_emergencia_telefone: row.contato_emergencia_telefone || null,
              observacoes: row.observacoes || null,
              created_by: user.user.id
            };

            const { error } = await supabase
              .from('devedores')
              .insert(devedorData);

            if (error) throw error;
            results.success++;
          } catch (dbError: any) {
            results.errors.push({
              line: row._lineNumber,
              error: `Erro ao salvar: ${dbError.message}`
            });
          }
        } else {
          results.errors.push({
            line: row._lineNumber,
            error: validation.errors.join(', ')
          });
        }
        
        setProgress((i + 1) / data.length * 100);
        
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setResult(results);
      
      if (results.success > 0) {
        toast({
          title: 'Importação concluída',
          description: `${results.success} devedores importados com sucesso.`
        });
        onSuccess?.();
      }
      
    } catch (error) {
      setResult({
        success: 0,
        errors: [{ line: 0, error: 'Erro ao processar arquivo: ' + (error as Error).message }],
        total: 0
      });
      toast({
        title: 'Erro na importação',
        description: 'Falha ao processar o arquivo.',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Devedores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Faça o upload de um arquivo CSV com os dados dos devedores. 
                Use nosso template para garantir o formato correto.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa">Empresa *</Label>
                <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Template
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="file">Arquivo CSV *</Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={importing}
              />
            </div>

            {file && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Arquivo selecionado:</strong> {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tamanho: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processando...</span>
                  <span className="text-sm">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processImport}
                disabled={!file || !selectedEmpresa || importing}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Processando...' : 'Importar'}
              </Button>
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              )}
            </div>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {result.success} Sucesso
              </Badge>
              {result.errors.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {result.errors.length} Erros
                </Badge>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Erros encontrados:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                      <strong>Linha {error.line}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setProgress(0);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Importar Novamente
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}