import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Upload, CheckCircle, XCircle, AlertCircle, Download, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: number;
  errors: { line: number; error: string }[];
  total: number;
  devedores?: number;
  dividas?: number;
}

interface Empresa {
  id: string;
  nome: string;
}

interface ImportarDadosProps {
  onClose?: () => void;
  empresas: Empresa[];
  onSuccess?: () => void;
}

type ImportType = 'devedores' | 'dividas' | 'combinado';

export function ImportarDados({ onClose, empresas, onSuccess }: ImportarDadosProps) {
  const [importType, setImportType] = useState<ImportType>('devedores');
  const [file, setFile] = useState<File | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getTemplateHeaders = (type: ImportType) => {
    const devedorHeaders = [
      'nome', 'documento', 'tipo_pessoa', 'email_principal', 'email_secundario',
      'telefone_principal', 'telefone_whatsapp', 'telefones_outros',
      'endereco_completo', 'cep', 'cidade', 'estado', 'score_recuperabilidade',
      'canal_preferencial', 'local_trabalho', 'contato_emergencia_nome',
      'contato_emergencia_telefone', 'observacoes'
    ];

    const dividaHeaders = [
      'documento_devedor', 'numero_contrato', 'numero_nf', 'origem_divida',
      'data_vencimento', 'valor_original', 'valor_multa', 'valor_juros',
      'valor_correcao', 'valor_atualizado', 'status', 'estagio',
      'data_negativacao', 'data_protesto', 'urgency_score'
    ];

    switch (type) {
      case 'devedores':
        return devedorHeaders;
      case 'dividas':
        return dividaHeaders;
      case 'combinado':
        return [...devedorHeaders, ...dividaHeaders];
      default:
        return devedorHeaders;
    }
  };

  const generateTemplateContent = (type: ImportType) => {
    const headers = getTemplateHeaders(type);
    
    const examples: Record<ImportType, string> = {
      devedores: 'João Silva,123.456.789-00,FISICA,joao@email.com,joao2@email.com,(11) 99999-9999,(11) 99999-9999,"(11) 88888-8888;(11) 77777-7777",Rua das Flores 123,01234-567,São Paulo,SP,75,whatsapp,Empresa ABC,Maria Silva,(11) 95555-5555,Cliente com histórico de atraso',
      dividas: '123.456.789-00,CONT-001,NF-12345,Fatura de serviços,2024-03-15,1500.00,30.00,45.00,22.50,1597.50,pendente,vencimento_proximo,2024-04-15,2024-05-15,85',
      combinado: 'João Silva,123.456.789-00,FISICA,joao@email.com,joao2@email.com,(11) 99999-9999,(11) 99999-9999,"(11) 88888-8888",Rua das Flores 123,01234-567,São Paulo,SP,75,whatsapp,Empresa ABC,Maria Silva,(11) 95555-5555,Cliente com histórico,123.456.789-00,CONT-001,NF-12345,Fatura de serviços,2024-03-15,1500.00,30.00,45.00,22.50,1597.50,pendente,vencimento_proximo,2024-04-15,2024-05-15,85'
    };

    return headers.join(',') + '\n' + examples[type];
  };

  const downloadTemplate = () => {
    const csvContent = generateTemplateContent(importType);
    const fileName = `template_${importType}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
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
    
    if (data.tipo_pessoa === 'FISICA' && data.documento) {
      const cpf = data.documento.replace(/\D/g, '');
      if (cpf.length !== 11) errors.push('CPF deve ter 11 dígitos');
    }
    if (data.tipo_pessoa === 'JURIDICA' && data.documento) {
      const cnpj = data.documento.replace(/\D/g, '');
      if (cnpj.length !== 14) errors.push('CNPJ deve ter 14 dígitos');
    }

    if (data.score_recuperabilidade && (isNaN(Number(data.score_recuperabilidade)) || Number(data.score_recuperabilidade) < 0 || Number(data.score_recuperabilidade) > 100)) {
      errors.push('Score de recuperabilidade deve ser um número entre 0 e 100');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const validateDivida = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.documento_devedor) errors.push('CPF/CNPJ do devedor é obrigatório');
    if (!data.origem_divida) errors.push('Origem da dívida é obrigatória');
    if (!data.data_vencimento) errors.push('Data de vencimento é obrigatória');
    if (!data.valor_original || isNaN(Number(data.valor_original))) {
      errors.push('Valor original deve ser um número válido');
    }
    
    const statusValidos = ['pendente', 'negociacao', 'vencido', 'pago', 'cancelado'];
    if (data.status && !statusValidos.includes(data.status)) {
      errors.push(`Status deve ser: ${statusValidos.join(', ')}`);
    }
    
    return { valid: errors.length === 0, errors };
  };

  const findOrCreateDevedor = async (documento: string, userData?: any) => {
    // Buscar devedor existente
    const { data: existingDevedor } = await supabase
      .from('devedores')
      .select('id')
      .eq('documento', documento)
      .eq('empresa_id', selectedEmpresa)
      .single();

    if (existingDevedor) {
      return existingDevedor.id;
    }

    // Criar novo devedor se não existe e temos dados
    if (userData) {
      const { data: user } = await supabase.auth.getUser();
      
      const devedorData = {
        empresa_id: selectedEmpresa,
        nome: userData.nome,
        documento: userData.documento,
        tipo_pessoa: userData.tipo_pessoa,
        email_principal: userData.email_principal || null,
        email_secundario: userData.email_secundario || null,
        telefone_principal: userData.telefone_principal || null,
        telefone_whatsapp: userData.telefone_whatsapp || null,
        telefones_outros: userData.telefones_outros ? userData.telefones_outros.split(';') : null,
        endereco_completo: userData.endereco_completo || null,
        cep: userData.cep || null,
        cidade: userData.cidade || null,
        estado: userData.estado || null,
        score_recuperabilidade: userData.score_recuperabilidade ? Number(userData.score_recuperabilidade) : 0,
        canal_preferencial: userData.canal_preferencial || 'whatsapp',
        local_trabalho: userData.local_trabalho || null,
        contato_emergencia_nome: userData.contato_emergencia_nome || null,
        contato_emergencia_telefone: userData.contato_emergencia_telefone || null,
        observacoes: userData.observacoes || null,
        created_by: user.user?.id
      };

      const { data: newDevedor, error } = await supabase
        .from('devedores')
        .insert(devedorData)
        .select('id')
        .single();

      if (error) throw error;
      return newDevedor.id;
    }

    throw new Error(`Devedor com documento ${documento} não encontrado`);
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
        total: data.length,
        devedores: 0,
        dividas: 0
      };
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          if (importType === 'devedores') {
            const validation = validateDevedor(row);
            if (!validation.valid) {
              results.errors.push({
                line: row._lineNumber,
                error: validation.errors.join(', ')
              });
              continue;
            }

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

            const { error } = await supabase.from('devedores').insert(devedorData);
            if (error) throw error;
            
            results.success++;
            results.devedores!++;

          } else if (importType === 'dividas') {
            const validation = validateDivida(row);
            if (!validation.valid) {
              results.errors.push({
                line: row._lineNumber,
                error: validation.errors.join(', ')
              });
              continue;
            }

            const devedorId = await findOrCreateDevedor(row.documento_devedor);
            
            const dividaData = {
              devedor_id: devedorId,
              empresa_id: selectedEmpresa,
              numero_contrato: row.numero_contrato || null,
              numero_nf: row.numero_nf || null,
              origem_divida: row.origem_divida,
              data_vencimento: row.data_vencimento,
              valor_original: Number(row.valor_original),
              valor_multa: row.valor_multa ? Number(row.valor_multa) : 0,
              valor_juros: row.valor_juros ? Number(row.valor_juros) : 0,
              valor_correcao: row.valor_correcao ? Number(row.valor_correcao) : 0,
              valor_atualizado: row.valor_atualizado ? Number(row.valor_atualizado) : Number(row.valor_original),
              status: row.status || 'pendente',
              estagio: row.estagio || 'vencimento_proximo',
              data_negativacao: row.data_negativacao || null,
              data_protesto: row.data_protesto || null,
              urgency_score: row.urgency_score ? Number(row.urgency_score) : 0,
              created_by: user.user.id
            };

            const { error } = await supabase.from('dividas').insert(dividaData);
            if (error) throw error;
            
            results.success++;
            results.dividas!++;

          } else if (importType === 'combinado') {
            const devedorValidation = validateDevedor(row);
            const dividaValidation = validateDivida(row);
            
            if (!devedorValidation.valid || !dividaValidation.valid) {
              const allErrors = [...devedorValidation.errors, ...dividaValidation.errors];
              results.errors.push({
                line: row._lineNumber,
                error: allErrors.join(', ')
              });
              continue;
            }

            const devedorId = await findOrCreateDevedor(row.documento, row);
            
            const dividaData = {
              devedor_id: devedorId,
              empresa_id: selectedEmpresa,
              numero_contrato: row.numero_contrato || null,
              numero_nf: row.numero_nf || null,
              origem_divida: row.origem_divida,
              data_vencimento: row.data_vencimento,
              valor_original: Number(row.valor_original),
              valor_multa: row.valor_multa ? Number(row.valor_multa) : 0,
              valor_juros: row.valor_juros ? Number(row.valor_juros) : 0,
              valor_correcao: row.valor_correcao ? Number(row.valor_correcao) : 0,
              valor_atualizado: row.valor_atualizado ? Number(row.valor_atualizado) : Number(row.valor_original),
              status: row.status || 'pendente',
              estagio: row.estagio || 'vencimento_proximo',
              data_negativacao: row.data_negativacao || null,
              data_protesto: row.data_protesto || null,
              urgency_score: row.urgency_score ? Number(row.urgency_score) : 0,
              created_by: user.user.id
            };

            const { error } = await supabase.from('dividas').insert(dividaData);
            if (error) throw error;
            
            results.success++;
            results.dividas!++;
          }
        } catch (dbError: any) {
          results.errors.push({
            line: row._lineNumber,
            error: `Erro ao processar: ${dbError.message}`
          });
        }
        
        setProgress((i + 1) / data.length * 100);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setResult(results);
      
      if (results.success > 0) {
        toast({
          title: 'Importação concluída',
          description: `${results.success} registro(s) importado(s) com sucesso.`
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

  const resetForm = () => {
    setResult(null);
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importação Unificada de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Escolha o tipo de importação e faça o upload do arquivo CSV. 
                Use nossos templates para garantir o formato correto.
              </AlertDescription>
            </Alert>

            <Tabs value={importType} onValueChange={(value) => setImportType(value as ImportType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="devedores" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Devedores
                </TabsTrigger>
                <TabsTrigger value="dividas" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Dívidas
                </TabsTrigger>
                <TabsTrigger value="combinado" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Combinado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="devedores">
                <Alert>
                  <AlertDescription>
                    Importa apenas devedores. Ideal para cadastro inicial de clientes.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="dividas">
                <Alert>
                  <AlertDescription>
                    Importa apenas dívidas. Os devedores devem existir previamente (busca por CPF/CNPJ).
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="combinado">
                <Alert>
                  <AlertDescription>
                    Importa devedores e suas dívidas simultaneamente. Cria o devedor se não existir.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

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
                  Baixar Template {importType}
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
                <CheckCircle className="h-3 w-3 text-success" />
                {result.success} Sucesso
              </Badge>
              {result.devedores! > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {result.devedores} Devedores
                </Badge>
              )}
              {result.dividas! > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {result.dividas} Dívidas
                </Badge>
              )}
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
                    <div key={index} className="text-sm p-2 bg-destructive/10 border border-destructive/20 rounded">
                      <strong>Linha {error.line}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={resetForm}>
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