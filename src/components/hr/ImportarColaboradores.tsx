import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { useHR } from '@/context/HRContext';
import { Colaborador } from '@/types/hr';

interface ImportResult {
  success: number;
  errors: { line: number; error: string }[];
  total: number;
}

export function ImportarColaboradores({ onClose }: { onClose?: () => void }) {
  const { adicionarColaborador, empresas } = useHR();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'nome',
      'email', 
      'cargo',
      'departamento',
      'empresa_id',
      'status',
      'data_admissao',
      'data_nascimento',
      'sexo',
      'salario_base',
      'telefone',
      'celular',
      'endereco',
      'cep',
      'cidade',
      'estado',
      'estado_civil',
      'escolaridade',
      'nome_mae',
      'nome_pai',
      'contato_emergencia_nome',
      'contato_emergencia_telefone',
      'contato_emergencia_parentesco',
      'cpf',
      'rg',
      'rg_orgao_emissor',
      'ctps',
      'ctps_serie',
      'pis_pasep',
      'titulo_eleitor',
      'reservista',
      'vale_transporte',
      'vale_refeicao',
      'valor_vale_transporte',
      'valor_vale_refeicao',
      'plano_saude',
      'plano_odontologico',
      'tem_filhos_menores_14',
      'quantidade_filhos',
      'banco',
      'agencia',
      'conta',
      'tipo_conta',
      'pix'
    ];
    
    const csvContent = headers.join(',') + '\n' +
      'João Silva,joao@empresa.com,Desenvolvedor,Tecnologia,1,ATIVO,2024-01-15,1990-05-10,MASCULINO,8000,(11) 99999-9999,(11) 99999-9999,Rua A 123,01234-567,São Paulo,SP,SOLTEIRO,SUPERIOR,Maria Silva,José Silva,Maria Silva,(11) 98888-7777,Mãe,123.456.789-00,12.345.678-9,SSP/SP,1234567890,001,12345678901,123456789012,123456789,SIM,SIM,200,600,SIM,NAO,NAO,0,001 - Banco do Brasil,1234-5,12345-6,CORRENTE,joao@empresa.com';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_colaboradores_completo.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      row._lineNumber = i + 1;
      data.push(row);
    }
    
    return data;
  };

  const validateColaborador = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.nome) errors.push('Nome é obrigatório');
    if (!data.email) errors.push('Email é obrigatório');
    if (!data.cargo) errors.push('Cargo é obrigatório');
    if (!data.departamento) errors.push('Departamento é obrigatório');
    if (!data.empresa_id) errors.push('ID da empresa é obrigatório');
    if (!data.status || !['ATIVO', 'INATIVO', 'DEMITIDO'].includes(data.status)) {
      errors.push('Status deve ser ATIVO, INATIVO ou DEMITIDO');
    }
    if (!data.data_admissao) errors.push('Data de admissão é obrigatória');
    if (!data.data_nascimento) errors.push('Data de nascimento é obrigatória');
    if (!data.sexo || !['MASCULINO', 'FEMININO'].includes(data.sexo)) {
      errors.push('Sexo deve ser MASCULINO ou FEMININO');
    }
    if (!data.salario_base || isNaN(Number(data.salario_base))) {
      errors.push('Salário base deve ser um número válido');
    }
    if (!data.cpf) errors.push('CPF é obrigatório');
    
    // Verificar se empresa existe
    const empresaExiste = empresas.some(e => e.id === data.empresa_id);
    if (!empresaExiste) errors.push('Empresa não encontrada');
    
    return { valid: errors.length === 0, errors };
  };

  const processImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setProgress(0);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      const results: ImportResult = {
        success: 0,
        errors: [],
        total: data.length
      };
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const validation = validateColaborador(row);
        
        if (validation.valid) {
          const colaborador: Omit<Colaborador, 'id' | 'auditoria'> = {
            nome: row.nome,
            email: row.email,
            cargo: row.cargo,
            departamento: row.departamento,
            empresa: row.empresa_id,
            status: row.status as 'ATIVO' | 'INATIVO' | 'DEMITIDO',
            tipo_contrato: (row.tipo_contrato as 'CLT' | 'PJ' | 'PF') || 'CLT',
            data_admissao: row.data_admissao,
            data_nascimento: row.data_nascimento,
            sexo: row.sexo as 'MASCULINO' | 'FEMININO',
            salario_base: Number(row.salario_base),
            telefone: row.telefone || '',
            endereco: row.endereco || '',
            celular: row.celular || row.telefone || '',
            cep: row.cep || '',
            cidade: row.cidade || '',
            estado: row.estado || '',
            estado_civil: (row.estado_civil as any) || 'SOLTEIRO',
            escolaridade: (row.escolaridade as any) || 'MEDIO',
            nome_mae: row.nome_mae || '',
            nome_pai: row.nome_pai || '',
            contato_emergencia: {
              nome: row.contato_emergencia_nome || '',
              telefone: row.contato_emergencia_telefone || '',
              parentesco: row.contato_emergencia_parentesco || ''
            },
            documentos: {
              cpf: row.cpf,
              rg: row.rg || '',
              rg_orgao_emissor: row.rg_orgao_emissor || '',
              ctps: row.ctps || '',
              ctps_serie: row.ctps_serie || '',
              pis_pasep: row.pis_pasep || '',
              titulo_eleitor: row.titulo_eleitor || '',
              reservista: row.reservista || ''
            },
            beneficios: {
              vale_transporte: row.vale_transporte === 'SIM' || row.vale_transporte === true,
              vale_refeicao: row.vale_refeicao === 'SIM' || row.vale_refeicao === true,
              valor_vale_transporte: Number(row.valor_vale_transporte) || 0,
              valor_vale_refeicao: Number(row.valor_vale_refeicao) || 0,
              plano_saude: row.plano_saude === 'SIM' || row.plano_saude === true,
              plano_odontologico: row.plano_odontologico === 'SIM' || row.plano_odontologico === true
            },
            dependentes: {
              tem_filhos_menores_14: row.tem_filhos_menores_14 === 'SIM' || row.tem_filhos_menores_14 === true,
              quantidade_filhos: Number(row.quantidade_filhos) || 0,
              filhos: []
            },
            dados_bancarios: {
              banco: row.banco || '',
              agencia: row.agencia || '',
              conta: row.conta || '',
              tipo_conta: (row.tipo_conta as any) || 'CORRENTE',
              pix: row.pix || ''
            },
            documentos_arquivos: [],
            historico: []
          };
          
          adicionarColaborador(colaborador);
          results.success++;
        } else {
          results.errors.push({
            line: row._lineNumber,
            error: validation.errors.join(', ')
          });
        }
        
        setProgress((i + 1) / data.length * 100);
        
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      setResult(results);
    } catch (error) {
      setResult({
        success: 0,
        errors: [{ line: 0, error: 'Erro ao processar arquivo: ' + (error as Error).message }],
        total: 0
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
          Importar Colaboradores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Faça o upload de um arquivo CSV com os dados dos colaboradores. 
                Use nosso template para garantir o formato correto.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
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

            <div>
              <Label htmlFor="file">Arquivo CSV</Label>
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
                disabled={!file || importing}
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