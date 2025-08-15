import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHR } from "@/context/HRContext";
import { ImportarDevedores } from "@/components/debto/ImportarDevedores";
import { FileSpreadsheet, Plus } from "lucide-react";

const SystemData: React.FC = () => {
  const { empresas, colaboradores, loading, refetchEmpresas, refetchColaboradores } = useSupabaseData();
  const { criarDenuncia } = useHR();
  const { toast } = useToast();
  const [showImportDevedores, setShowImportDevedores] = useState(false);

  React.useEffect(() => {
    document.title = "Dados do Sistema - MRx Compliance";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Dados de empresas e colaboradores no MRx Compliance.");
  }, []);

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Utilidades para demo
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)];
  const pad = (n: number) => n.toString().padStart(2, '0');
  const randomDate = (startYear: number, endYear: number) => {
    const year = rand(startYear, endYear);
    const month = pad(rand(1, 12));
    const day = pad(rand(1, 28));
    return `${year}-${month}-${day}`;
  };

  const firstNames = ['Ana','Bruno','Carla','Diego','Eduarda','Felipe','Gabriela','Hugo','Isabela','João','Karina','Lucas','Marina','Nicolas','Olivia'];
  const lastNames = ['Silva','Souza','Oliveira','Santos','Pereira','Ferreira','Almeida','Gomes','Ribeiro','Martins'];
  const departments = ['RH','Financeiro','Vendas','Marketing','Operações','TI'];
  const cargos = ['Analista','Assistente','Coordenador','Gerente'];

  const fakeCNPJ = () => `${rand(10,99)}.${pad(rand(100,999))}.${pad(rand(100,999))}/${pad(rand(1000,9999))}-${pad(rand(10,99))}`;
  const fakeCPF = () => `${pad(rand(100,999))}.${pad(rand(100,999))}.${pad(rand(100,999))}-${pad(rand(10,99))}`;

  const createDemoData = async () => {
    try {
      // Obter usuário atual
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');
      // 1) Empresa
      const empresaPayload = {
        nome: 'Empresa Teste MRx',
        cnpj: fakeCNPJ(),
        endereco: 'Av. Exemplo, 123 - Centro, São Paulo/SP',
        responsavel: 'Responsável Demo',
        email: 'contato@empresa-teste-mrx.com',
        telefone: '(11) 3333-4444'
      } as any;

      const { data: empresa, error: empErr } = await supabase.from('empresas').insert(empresaPayload).select('*').single();
      if (empErr) throw empErr;

      // 2) Colaboradores
      const colaboradoresPayload = Array.from({ length: 10 }).map((_, i) => {
        const nome = `${pick(firstNames)} ${pick(lastNames)}`;
        const sexo = pick(['MASCULINO','FEMININO'] as const);
        const estadoCivil = pick(['SOLTEIRO','CASADO','DIVORCIADO','VIUVO','UNIAO_ESTAVEL'] as const);
        const escolaridade = pick(['FUNDAMENTAL','MEDIO','SUPERIOR','POS_GRADUACAO','MESTRADO','DOUTORADO'] as const);
        return {
          empresa_id: (empresa as any).id,
          nome,
          email: `${nome.toLowerCase().replace(/\s+/g,'.')}@empresa-teste-mrx.com`,
          cargo: pick(cargos),
          departamento: pick(departments),
          status: 'ATIVO',
          tipo_contrato: 'CLT',
          data_admissao: randomDate(2018, 2024),
          data_nascimento: randomDate(1978, 2005),
          sexo,
          salario_base: rand(2500, 12000),
          telefone: '(11) 90000-0000',
          celular: '(11) 90000-0000',
          endereco: 'Rua Fictícia, 456',
          cep: '01000-000',
          cidade: 'São Paulo',
          estado: 'SP',
          estado_civil: estadoCivil,
          escolaridade,
          nome_mae: 'Maria Exemplo',
          nome_pai: 'José Exemplo',
          contato_emergencia_nome: 'Contato Emergência',
          contato_emergencia_telefone: '(11) 95555-5555',
          contato_emergencia_parentesco: 'Parente',
          cpf: fakeCPF(),
          rg: `${rand(1000000,9999999)}`,
          rg_orgao_emissor: 'SSP-SP'
        } as any;
      });
      const { error: colErr } = await supabase.from('colaboradores').insert(colaboradoresPayload);
      if (colErr) throw colErr;

      // 3) Denúncias (DB + Contexto)
      const denunciasPayload = Array.from({ length: 4 }).map(() => ({
        empresa_id: (empresa as any).id,
        identificado: Math.random() < 0.5,
        nome: 'Autor Demo',
        email: 'autor@demo.com',
        relacao: pick(['COLABORADOR','EX_COLABORADOR','FORNECEDOR','CLIENTE','OUTRO'] as const),
        tipo: pick(['DISCRIMINACAO','ASSEDIO_MORAL','CORRUPCAO','VIOLACAO_TRABALHISTA','OUTRO'] as const),
        setor: pick(departments),
        conhecimento_fato: pick(['OUVI_FALAR','DOCUMENTO','COLEGA_TRABALHO','OUTRO'] as const),
        envolvidos_cientes: Math.random() < 0.3,
        descricao: 'Denúncia de demonstração para testes.',
        evidencias_descricao: 'Evidências de exemplo.',
        sugestao: 'Tomar providências cabíveis.'
      }));

      for (const d of denunciasPayload) {
        await criarDenuncia({
          empresaId: (empresa as any).id,
          identificado: d.identificado,
          nome: d.nome,
          email: d.email,
          relacao: d.relacao as any,
          tipo: d.tipo as any,
          setor: d.setor,
          conhecimentoFato: d.conhecimento_fato as any,
          envolvidosCientes: d.envolvidos_cientes,
          descricao: d.descricao,
          evidenciasDescricao: d.evidencias_descricao,
          sugestao: d.sugestao,
        });
      }

      // 4) Auditoria (localStorage)
      const itens = Array.from({ length: 12 }).map((_, i) => ({
        documento: `Documento ${i+1}`,
        status: Math.random() < 0.6 ? 'ENTREGUE' : 'PENDENTE'
      }));
      try { localStorage.setItem(`auditoria-${(empresa as any).id}`, JSON.stringify({ itens })); } catch {}

      // 5) Dados de Cobrança (Debto)
      // 5.1) Devedores
      const devedoresPayload = Array.from({ length: 8 }).map((_, i) => {
        const nome = `${pick(firstNames)} ${pick(lastNames)}`;
        const tipoPessoa = pick(['FISICA', 'JURIDICA']);
        return {
          empresa_id: (empresa as any).id,
          nome,
          documento: tipoPessoa === 'FISICA' ? fakeCPF() : fakeCNPJ(),
          tipo_pessoa: tipoPessoa,
          email_principal: `${nome.toLowerCase().replace(/\s+/g,'.')}@devedor.com`,
          telefone_principal: `(11) 9${rand(1000,9999)}-${rand(1000,9999)}`,
          telefone_whatsapp: `(11) 9${rand(1000,9999)}-${rand(1000,9999)}`,
          endereco_completo: `Rua ${pick(['das Flores', 'do Sol', 'da Paz', 'Central'])}, ${rand(100,999)}`,
          cidade: pick(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador']),
          estado: pick(['SP', 'RJ', 'MG', 'BA']),
          cep: `${rand(10000,99999)}-${rand(100,999)}`,
          score_recuperabilidade: rand(0, 100),
          canal_preferencial: pick(['whatsapp', 'telefone', 'email']),
          observacoes: 'Devedor criado automaticamente para demonstração'
        } as any;
      });

      const { data: devedores, error: devErr } = await supabase
        .from('devedores')
        .insert(devedoresPayload)
        .select('*');
      if (devErr) throw devErr;

      // 5.2) Dívidas
      const dividasPayload = devedores.map((devedor: any) => {
        const valorOriginal = rand(500, 50000);
        const dataVencimento = new Date();
        dataVencimento.setDate(dataVencimento.getDate() - rand(0, 180)); // 0 a 180 dias atrás
        
        return {
          empresa_id: (empresa as any).id,
          devedor_id: devedor.id,
          origem_divida: pick(['PRODUTO', 'SERVICO', 'FINANCIAMENTO', 'CARTAO', 'OUTROS']),
          valor_original: valorOriginal,
          valor_atualizado: valorOriginal * (1 + rand(5, 30) / 100), // 5% a 30% de juros
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: pick(['pendente', 'negociacao', 'acordado', 'pago', 'judicial']),
          estagio: pick(['vencimento_proximo', 'vencido', 'negociacao', 'formal', 'judicial']),
          urgency_score: rand(0, 100),
          numero_nf: `NF-${rand(1000, 9999)}`,
          numero_contrato: `CONT-${rand(1000, 9999)}`,
          created_by: user.user.id
        } as any;
      });

      const { data: dividasInseridas, error: divErr } = await supabase
        .from('dividas')
        .insert(dividasPayload)
        .select('*');
      if (divErr) throw divErr;

      // 5.3) Histórico de Cobranças
      const historicoPayload = dividasInseridas.slice(0, 5).map((divida: any, i: number) => ({
        divida_id: divida.id,
        devedor_id: divida.devedor_id,
        tipo_acao: pick(['LIGACAO', 'WHATSAPP', 'EMAIL', 'CARTA']),
        canal: pick(['telefone', 'whatsapp', 'email', 'correios']),
        descricao: pick([
          'Tentativa de contato via telefone',
          'Mensagem enviada pelo WhatsApp',
          'Email de cobrança enviado',
          'Proposta de acordo apresentada'
        ]),
        resultado: pick(['SUCESSO', 'SEM_RESPOSTA', 'PROMESSA', 'RECUSA', 'REAGENDADO']),
        data_compromisso: Math.random() < 0.5 ? randomDate(2024, 2025) : null,
        valor_negociado: Math.random() < 0.3 ? rand(100, divida.valor_original) : null,
        observacoes: 'Histórico gerado automaticamente para demonstração',
        created_by: user.user.id
      }));

      const { error: histErr } = await supabase.from('historico_cobrancas').insert(historicoPayload);
      if (histErr) throw histErr;

      // 5.4) Configuração de Cobrança da Empresa
      const configCobrancaPayload = {
        empresa_id: (empresa as any).id,
        multa_padrao: 2.0,
        juros_padrao: 1.0,
        correcao_padrao: 1.5,
        dias_negativacao: 30,
        dias_protesto: 45
      };

      const { error: configErr } = await supabase
        .from('empresa_cobranca_config')
        .insert(configCobrancaPayload);
      if (configErr) throw configErr;

      // 6) Acordos de Pagamento
      const acordosPayload = dividasInseridas.slice(0, 3).map((divida: any) => ({
        divida_id: divida.id,
        devedor_id: divida.devedor_id,
        valor_acordo: divida.valor_original * 0.8, // 20% desconto
        valor_entrada: divida.valor_original * 0.2,
        parcelas: rand(3, 12),
        valor_parcela: (divida.valor_original * 0.6) / rand(3, 12),
        data_primeira_parcela: randomDate(2024, 2025),
        forma_pagamento: pick(['PIX', 'BOLETO', 'CARTAO_CREDITO', 'TRANSFERENCIA']),
        status: 'ativo',
        observacoes: 'Acordo gerado automaticamente para demonstração',
        created_by: user.user.id
      }));

      const { error: acordErr } = await supabase.from('acordos').insert(acordosPayload);
      if (acordErr) throw acordErr;

      // 7) Pagamentos
      const pagamentosPayload = dividasInseridas.slice(0, 2).map((divida: any) => ({
        divida_id: divida.id,
        valor_pago: divida.valor_original,
        data_pagamento: randomDate(2024, 2025),
        forma_pagamento: pick(['PIX', 'BOLETO', 'CARTAO_CREDITO']),
        observacoes: 'Pagamento registrado para demonstração',
        created_by: user.user.id
      }));

      const { error: pagErr } = await supabase.from('pagamentos').insert(pagamentosPayload);
      if (pagErr) throw pagErr;

      // Atualizar status das dívidas pagas
      await supabase
        .from('dividas')
        .update({ status: 'pago' })
        .in('id', pagamentosPayload.map(p => p.divida_id));

      // 8) Documentos de Dívida
      const documentosPayload = dividasInseridas.slice(0, 4).map((divida: any) => ({
        divida_id: divida.id,
        tipo_documento: pick(['CONTRATO', 'NOTA_FISCAL', 'COMPROVANTE']),
        nome_arquivo: `documento_${divida.numero_nf}.pdf`,
        url_arquivo: `https://exemplo.com/docs/documento_${divida.numero_nf}.pdf`,
        mime_type: 'application/pdf',
        tamanho_arquivo: rand(100000, 2000000),
        uploaded_by: user.user.id
      }));

      const { error: docErr } = await supabase.from('documentos_divida').insert(documentosPayload);
      if (docErr) throw docErr;

      await Promise.all([refetchEmpresas(), refetchColaboradores()]);
      toast({ 
        title: 'Dados de demonstração expandidos criados!', 
        description: 'Empresa, colaboradores, denúncias, dívidas, acordos, pagamentos e documentos gerados com sucesso.' 
      });
    } catch (e: any) {
      console.error(e);
      toast({ 
        title: 'Erro ao criar dados de demonstração', 
        description: e?.message || 'Tente novamente.', 
        variant: 'destructive' 
      });
    }
  };
  const exportEmpresas = () => {
    const header = ["Nome", "CNPJ", "Responsável", "Email"];
    const rows = empresas.map((e) => [e.nome, e.cnpj, e.responsavel, e.email]);
    downloadCsv(`empresas.csv`, [header, ...rows]);
  };

  const exportColaboradores = () => {
    const header = ["Nome", "Email", "Cargo", "Empresa", "Status"];
    const rows = colaboradores.map((c) => [
      c.nome,
      c.email,
      c.cargo,
      empresas.find((e) => e.id === c.empresa_id)?.nome || c.empresa_id,
      c.status,
    ]);
    downloadCsv(`colaboradores.csv`, [header, ...rows]);
  };

  if (loading) {
    return (
      <main>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando dados...</span>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dados do Sistema</h1>
          <div className="flex gap-2">
            <Dialog open={showImportDevedores} onOpenChange={setShowImportDevedores}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Importar Devedores
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <ImportarDevedores 
                  empresas={empresas}
                  onClose={() => setShowImportDevedores(false)}
                  onSuccess={() => {
                    setShowImportDevedores(false);
                    toast({
                      title: 'Devedores importados',
                      description: 'Os devedores foram importados com sucesso.'
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button variant="default" onClick={createDemoData}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Dados de Demonstração
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Empresas ({empresas.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={exportEmpresas}>Exportar CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.nome}</TableCell>
                      <TableCell>{e.cnpj}</TableCell>
                      <TableCell>{e.responsavel}</TableCell>
                      <TableCell>{e.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Colaboradores ({colaboradores.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={exportColaboradores}>Exportar CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores.slice(0, 50).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nome}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.cargo}</TableCell>
                      <TableCell>{empresas.find((e) => e.id === c.empresa_id)?.nome || c.empresa_id}</TableCell>
                      <TableCell>{c.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {colaboradores.length > 50 && (
                <p className="mt-2 text-xs text-muted-foreground">Exibindo 50 de {colaboradores.length} registros.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default SystemData;
