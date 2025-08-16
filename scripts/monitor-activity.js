import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('activity_logs')
    .select('action, by_user, created_at')
    .gte('created_at', since);

  if (error) {
    console.error('Error fetching activity logs:', error.message);
    process.exit(1);
  }

  const counts = {};
  for (const row of data) {
    const key = `${row.by_user}:${row.action}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  const alerts = Object.entries(counts).filter(([, count]) => count > 100);

  if (alerts.length > 0) {
    console.log('Unusual activity detected:');
    for (const [k, c] of alerts) {
      console.log(`  ${k} -> ${c} events in last 24h`);
    }
    process.exit(1);
  } else {
    console.log('No unusual activity detected');
  }
}

main().catch((err) => {
  console.error('Monitoring failed:', err);
  process.exit(1);
});
