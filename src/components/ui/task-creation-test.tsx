import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TaskModule, TaskStatus, TaskPriority } from '@/types/tarefas';

export function TaskCreationTest() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setLoading(true);
    setTestResult('');
    let result = '';

    try {
      // Test 1: User authentication
      result += '=== TESTE DE AUTENTICAÇÃO ===\n';
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (user) {
        result += `✅ Usuário autenticado: ${user.id}\n`;
      } else {
        result += '❌ Usuário não autenticado\n';
        setTestResult(result);
        setLoading(false);
        return;
      }

      // Test 2: Check user profile
      result += '\n=== TESTE DE PERFIL ===\n';
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        result += `❌ Erro ao buscar perfil: ${profileError.message}\n`;
      } else {
        result += `✅ Perfil encontrado: ${profile.full_name || profile.username}\n`;
        result += `   Role: ${profile.role}\n`;
        result += `   Empresas: ${profile.empresa_ids?.length || 0}\n`;
      }

      // Test 3: Test basic task creation (minimal data)
      result += '\n=== TESTE DE CRIAÇÃO BÁSICA ===\n';
      const basicTaskData = {
        titulo: `Teste ${Date.now()}`,
        descricao: 'Tarefa de teste criada pelo diagnóstico',
        modulo_origem: 'geral' as TaskModule,
        status: 'a_fazer' as TaskStatus,
        prioridade: 'media' as TaskPriority,
        created_by: user.id,
        ordem_na_coluna: 0,
        is_archived: false
      };

      const { data: createdTask, error: taskError } = await supabase
        .from('tarefas')
        .insert(basicTaskData)
        .select()
        .single();

      if (taskError) {
        result += `❌ Erro na criação: ${taskError.message}\n`;
        result += `   Código: ${taskError.code}\n`;
        result += `   Detalhes: ${taskError.details}\n`;
        result += `   Hint: ${taskError.hint}\n`;
      } else {
        result += `✅ Tarefa criada com sucesso: ${createdTask.id}\n`;
        
        // Clean up test task
        await supabase.from('tarefas').delete().eq('id', createdTask.id);
        result += '✅ Tarefa de teste removida\n';
      }

      // Test 4: Check table permissions
      result += '\n=== TESTE DE PERMISSÕES ===\n';
      const { data: tarefasData, error: countError } = await supabase
        .from('tarefas')
        .select('id')
        .limit(5);

      if (countError) {
        result += `❌ Erro ao contar tarefas: ${countError.message}\n`;
      } else {
        result += `✅ Permissão de leitura OK. Tarefas existentes: ${tarefasData?.length || 0}\n`;
      }

      // Test 5: Check empresa access
      if (profile?.empresa_ids?.length) {
        result += '\n=== TESTE COM EMPRESA ===\n';
        const empresaId = profile.empresa_ids[0];
        
        const taskWithEmpresa = {
          ...basicTaskData,
          titulo: `Teste com empresa ${Date.now()}`,
          empresa_id: empresaId
        };

        const { data: empresaTask, error: empresaError } = await supabase
          .from('tarefas')
          .insert(taskWithEmpresa)
          .select()
          .single();

        if (empresaError) {
          result += `❌ Erro com empresa: ${empresaError.message}\n`;
        } else {
          result += `✅ Tarefa com empresa criada: ${empresaTask.id}\n`;
          await supabase.from('tarefas').delete().eq('id', empresaTask.id);
          result += '✅ Tarefa com empresa removida\n';
        }
      }

      // Test 6: Test using hook method
      result += '\n=== TESTE DO HOOK ===\n';
      try {
        const hookTestData = {
          titulo: `Hook Test ${Date.now()}`,
          descricao: 'Teste do hook de criação',
          modulo_origem: 'geral' as TaskModule,
          status: 'a_fazer' as TaskStatus,
          prioridade: 'media' as TaskPriority
        };
        
        // This simulates what the hook does
        const processedData = {
          titulo: hookTestData.titulo.trim(),
          descricao: hookTestData.descricao?.trim() || null,
          modulo_origem: hookTestData.modulo_origem || 'geral',
          empresa_id: null,
          responsavel_id: null,
          status: hookTestData.status || 'a_fazer',
          prioridade: hookTestData.prioridade || 'media',
          data_vencimento: null,
          anexos: null,
          board_id: null,
          column_id: null,
          ordem_na_coluna: 0,
          created_by: user.id,
          is_archived: false
        };

        const { data: hookTask, error: hookError } = await supabase
          .from('tarefas')
          .insert(processedData)
          .select()
          .single();

        if (hookError) {
          result += `❌ Erro no teste do hook: ${hookError.message}\n`;
        } else {
          result += `✅ Método do hook funcionou: ${hookTask.id}\n`;
          await supabase.from('tarefas').delete().eq('id', hookTask.id);
          result += '✅ Tarefa do hook removida\n';
        }
      } catch (hookTestError: any) {
        result += `❌ Erro no teste do hook: ${hookTestError.message}\n`;
      }

      toast({
        title: 'Diagnóstico completo',
        description: 'Verifique os resultados no painel'
      });

    } catch (error: any) {
      result += `\n❌ ERRO GERAL: ${error.message}\n`;
      toast({
        title: 'Erro no diagnóstico',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTestResult(result);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔧 Diagnóstico do Sistema de Tarefas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Executando diagnóstico...' : 'Executar Diagnóstico Completo'}
        </Button>
        
        {testResult && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Resultados:</h3>
            <pre className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              {testResult}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}