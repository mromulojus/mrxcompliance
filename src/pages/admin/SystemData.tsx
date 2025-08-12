import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHR } from "@/context/HRContext";

const SystemData: React.FC = () => {
  const { empresas, colaboradores, loading, refetchEmpresas, refetchColaboradores } = useSupabaseData();
  const { criarDenuncia } = useHR();
  const { toast } = useToast();

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
      const { error: denErr } = await supabase.from('denuncias').insert(denunciasPayload);
      if (denErr) throw denErr;

      // Atualizar dashboards locais
      denunciasPayload.forEach(d => {
        criarDenuncia({
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
          sugestao: d.sugestao
        });
      });

      // 4) Auditoria (localStorage)
      const itens = Array.from({ length: 12 }).map((_, i) => ({
        documento: `Documento ${i+1}`,
        status: Math.random() < 0.6 ? 'ENTREGUE' : 'PENDENTE'
      }));
      try { localStorage.setItem(`auditoria-${(empresa as any).id}`, JSON.stringify({ itens })); } catch {}

      await Promise.all([refetchEmpresas(), refetchColaboradores()]);
      toast({ title: 'Dados de demonstração criados!', description: 'Empresa, 10 colaboradores e denúncias geradas.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erro ao criar dados de demonstração', description: e?.message || 'Tente novamente.', variant: 'destructive' });
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
          <Button variant="default" onClick={createDemoData}>Criar Dados de Demonstração</Button>
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
