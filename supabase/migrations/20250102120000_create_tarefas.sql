-- Tabela de tarefas Kanban
create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'A_FAZER' check (status in ('A_FAZER','EM_ANDAMENTO','EM_REVISAO','CONCLUIDO')),
  priority text not null default 'MEDIA' check (priority in ('ALTA','MEDIA','BAIXA')),
  due_date date null,
  origin_module text not null check (origin_module in ('OUVIDORIA','AUDITORIA','COBRANCAS')),
  empresa_id uuid null references public.empresas(id) on delete set null,
  processo_id uuid null references public.processos_judiciais(id) on delete set null,
  denuncia_id uuid null references public.denuncias(id) on delete set null,
  divida_id uuid null references public.dividas(id) on delete set null,
  responsavel_user_id uuid null,
  order_index int not null default 1,
  anexos text[] null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists tarefas_status_idx on public.tarefas(status);
create index if not exists tarefas_empresa_idx on public.tarefas(empresa_id);
create index if not exists tarefas_responsavel_idx on public.tarefas(responsavel_user_id);

-- Tabela de tarefas Kanban
create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'A_FAZER' check (status in ('A_FAZER','EM_ANDAMENTO','EM_REVISAO','CONCLUIDO')),
  priority text not null default 'MEDIA' check (priority in ('ALTA','MEDIA','BAIXA')),
  due_date date null,
  origin_module text not null check (origin_module in ('OUVIDORIA','AUDITORIA','COBRANCAS')),
  empresa_id uuid null references public.empresas(id) on delete set null,
  processo_id uuid null references public.processos_judiciais(id) on delete set null,
  denuncia_id uuid null references public.denuncias(id) on delete set null,
  divida_id uuid null references public.dividas(id) on delete set null,
  responsavel_user_id uuid null,
  order_index int not null default 1,
  anexos text[] null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists tarefas_status_idx on public.tarefas(status);
create index if not exists tarefas_empresa_idx on public.tarefas(empresa_id);
create index if not exists tarefas_responsavel_idx on public.tarefas(responsavel_user_id);

