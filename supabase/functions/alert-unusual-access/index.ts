import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const alertWebhookUrl = Deno.env.get("ALERT_WEBHOOK_URL")!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

interface AccessLogRecord {
  id: number;
  user_id: string;
  table_name: string;
  action: string;
  accessed_at: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.json();
  const record: AccessLogRecord = payload.record;

  let reason: string | null = null;

  const accessedAt = new Date(record.accessed_at);
  const hour = accessedAt.getUTCHours();
  if (hour < 8 || hour >= 18) {
    reason = "Access outside business hours";
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from<AccessLogRecord>("access_logs")
    .select("*", { head: true, count: "exact" })
    .eq("user_id", record.user_id)
    .eq("table_name", record.table_name)
    .gte("accessed_at", since);

  if (!reason && (count ?? 0) > 100) {
    reason = `High volume: ${count} accesses in last hour`;
  }

  if (reason) {
    await fetch(alertWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record, reason }),
    });
  }

  return new Response("ok", { status: 200 });
});
