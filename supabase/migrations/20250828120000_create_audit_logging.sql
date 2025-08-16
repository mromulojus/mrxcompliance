-- Create audit schema and access log table
create schema if not exists audit;

create table audit.access_logs (
  id bigserial primary key,
  user_id uuid not null,
  table_name text not null,
  action text not null,
  accessed_at timestamptz not null default now()
);

comment on table audit.access_logs is 'Logs access to sensitive tables';

-- Function to insert log entries
create or replace function audit.log_access() returns trigger
language plpgsql security definer as $$
begin
  insert into audit.access_logs (user_id, table_name, action)
  values (auth.uid(), TG_TABLE_NAME, TG_OP);
  return new;
end;
$$;

-- Triggers for sensitive tables
create trigger log_access_denuncias
after insert or update or delete on public.denuncias
for each statement execute function audit.log_access();

create trigger log_access_documentos_divida
after insert or update or delete on public.documentos_divida
for each statement execute function audit.log_access();

create trigger log_access_documentos_colaborador
after insert or update or delete on public.documentos_colaborador
for each statement execute function audit.log_access();
