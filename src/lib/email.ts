import { supabase } from "@/integrations/supabase/client";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function enviarEmail(options: EmailOptions): Promise<{ success: boolean; error?: unknown }> {
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: options,
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Falha ao enviar email:", err);
    return { success: false, error: err };
  }
}
