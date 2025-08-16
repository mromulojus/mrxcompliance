-- Create processos table and add processo_id to dividas

create table if not exists public.processos (
  id uuid primary key default uuid_generate_v4(),
  devedor_id uuid references public.devedores(id) on delete cascade,
  numero text not null,
  descricao text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  created_by uuid
);

alter table public.processos enable row level security;

create policy "View processos with role" on public.processos
  for select using (
    exists (
      select 1 from public.devedores d
      where d.id = processos.devedor_id
      and user_can_access_empresa(d.empresa_id)
    ) and (
      has_role(auth.uid(), 'operacional'::user_role) or
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

create policy "Manage processos with finance roles" on public.processos
  for all using (
    exists (
      select 1 from public.devedores d
      where d.id = processos.devedor_id
      and user_can_access_empresa(d.empresa_id)
    ) and (
      has_role(auth.uid(), 'administrador'::user_role) or
      has_role(auth.uid(), 'financeiro'::user_role) or
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  ) with check (
    exists (
      select 1 from public.devedores d
      where d.id = processos.devedor_id
      and user_can_access_empresa(d.empresa_id)
    ) and (
      has_role(auth.uid(), 'administrador'::user_role) or
      has_role(auth.uid(), 'financeiro'::user_role) or
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  );

alter table public.dividas add column if not exists processo_id uuid references public.processos(id);

