import { supabase } from '@/integrations/supabase/client';

export async function saveObservacao(colaboradorId: string, observacao: string, anexos: File[] = []) {
  const { data: historico, error } = await supabase
    .from('historico_colaborador')
    .insert({
      colaborador_id: colaboradorId,
      observacao,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select('*')
    .single();

  if (error || !historico) {
    throw error || new Error('Falha ao salvar observação');
  }

  const savedAnexos: { nome: string; url: string; tipo: string }[] = [];

  for (const file of anexos) {
    const path = `${historico.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('historico-anexos')
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('historico-anexos')
      .getPublicUrl(path);

    const { error: insertError } = await supabase
      .from('historico_anexos')
      .insert({
        historico_id: historico.id,
        nome: file.name,
        url: publicUrl,
        tipo: file.type,
      });

    if (insertError) throw insertError;

    savedAnexos.push({ nome: file.name, url: publicUrl, tipo: file.type });
  }

  return {
    id: historico.id,
    observacao: historico.observacao,
    data: historico.created_at,
    usuario: (await supabase.auth.getUser()).data.user?.id,
    anexos: savedAnexos,
    created_at: historico.created_at,
  };
}
