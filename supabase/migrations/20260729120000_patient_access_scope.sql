-- Isolamento: acesso por responsáveis do paciente + clinical_areas em modelos.
-- MASTER / supervisor / admin: acesso amplo.

create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select up.is_master
      from public.user_profiles up
      where up.id = auth.uid()
      limit 1
    ),
    false
  );
$$;

create or replace function public.professional_can_access_patient(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_master()
    or public.is_supervisor_or_admin()
    or exists (
      select 1
      from public.professional_patient_assignments ppa
      where ppa.patient_id = p_patient_id
        and ppa.professional_id = auth.uid()
    );
$$;

grant execute on function public.is_master() to authenticated;
grant execute on function public.professional_can_access_patient(uuid) to authenticated;

-- document_templates: áreas clínicas
alter table public.document_templates
  add column if not exists clinical_areas text[] not null default array['geral']::text[];

create index if not exists idx_document_templates_clinical_areas
  on public.document_templates using gin (clinical_areas);

-- Seeds por nome conhecido
update public.document_templates
set clinical_areas = array['fisioterapia']
where name ilike '%fisioterapia%';

update public.document_templates
set clinical_areas = array['terapia_ocupacional']
where name ilike '%terapia ocupacional%'
   or name ilike '%ocupacional%';

update public.document_templates
set clinical_areas = array['fonoaudiologia']
where name ilike '%dicção%'
   or name ilike '%fono%';

update public.document_templates
set clinical_areas = array['aba', 'geral']
where name ilike '%aba%'
   or name ilike '%evolução clínica%';

update public.document_templates
set clinical_areas = array['psicopedagogia']
where name ilike '%psicopedag%';

update public.document_templates
set clinical_areas = array['psicologia']
where name ilike '%psicológ%'
   or name ilike '%unimed%'
   or name ilike '%parecer%';

-- patients: equipe só vê atribuídos (família segue regra própria se existir)
drop policy if exists "Equipe lê pacientes" on public.patients;
drop policy if exists "Authenticated users can read patients" on public.patients;
drop policy if exists "Leitura de pacientes" on public.patients;

do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'patients'
      and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.patients', r.policyname);
  end loop;
end $$;

create policy "Equipe lê pacientes atribuídos"
  on public.patients
  for select
  to authenticated
  using (
    not public.is_familia()
    and public.professional_can_access_patient(id)
  );

-- Se existir policy de família, recria leitura do próprio paciente
drop policy if exists "Família lê próprio paciente" on public.patients;
create policy "Família lê próprio paciente"
  on public.patients
  for select
  to authenticated
  using (
    public.is_familia()
    and exists (
      select 1
      from public.user_profiles up
      where up.id = auth.uid()
        and up.patient_id = patients.id
    )
  );

-- evaluations
drop policy if exists "Leitura de avaliações" on public.evaluations;
drop policy if exists "Equipe lê avaliações" on public.evaluations;

do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'evaluations' and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.evaluations', r.policyname);
  end loop;
end $$;

create policy "Equipe lê avaliações de pacientes atribuídos"
  on public.evaluations
  for select
  to authenticated
  using (
    not public.is_familia()
    and public.professional_can_access_patient(patient_id)
  );

do $$
begin
  if to_regprocedure('public.familia_can_read_patient(uuid)') is null then
    return;
  end if;

  execute 'drop policy if exists "Família lê avaliações finalizadas do próprio paciente" on public.evaluations';

  execute $policy$
    create policy "Família lê avaliações finalizadas do próprio paciente"
      on public.evaluations
      for select
      to authenticated
      using (
        public.is_familia()
        and status = 'finalized'
        and public.familia_can_read_patient(patient_id)
      )
  $policy$;
end $$;

-- clinical_evolution_records
do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'clinical_evolution_records' and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.clinical_evolution_records', r.policyname);
  end loop;
end $$;

create policy "Equipe lê evoluções de pacientes atribuídos"
  on public.clinical_evolution_records
  for select
  to authenticated
  using (
    not public.is_familia()
    and public.professional_can_access_patient(patient_id)
  );

-- patient_documents
do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'patient_documents' and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.patient_documents', r.policyname);
  end loop;
end $$;

create policy "Equipe lê documentos de pacientes atribuídos"
  on public.patient_documents
  for select
  to authenticated
  using (
    not public.is_familia()
    and public.professional_can_access_patient(patient_id)
  );

-- Garante tabelas clínicas recentes (caso migrations anteriores não tenham rodado no remoto)
create table if not exists public.patient_anamnesis (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  anamnesis_type text not null,
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_anamnesis_patient on public.patient_anamnesis(patient_id);
create index if not exists idx_patient_anamnesis_type on public.patient_anamnesis(anamnesis_type);
alter table public.patient_anamnesis enable row level security;

create table if not exists public.patient_body_marks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  view_side text not null check (view_side in ('front', 'back')),
  x_pct numeric(6, 3) not null check (x_pct >= 0 and x_pct <= 100),
  y_pct numeric(6, 3) not null check (y_pct >= 0 and y_pct <= 100),
  mark_type text not null check (
    mark_type in ('pain', 'lesion', 'missing_limb', 'scar', 'other')
  ),
  severity smallint check (severity is null or (severity >= 0 and severity <= 10)),
  notes text,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_body_marks_patient
  on public.patient_body_marks (patient_id, is_active);
create index if not exists idx_patient_body_marks_view
  on public.patient_body_marks (patient_id, view_side);
alter table public.patient_body_marks enable row level security;

create table if not exists public.patient_therapeutic_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  professional_id uuid not null references auth.users (id),
  short_term_goals text not null default '',
  medium_term_goals text not null default '',
  long_term_goals text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_therapeutic_plans_patient_unique unique (patient_id)
);

create index if not exists idx_patient_therapeutic_plans_patient
  on public.patient_therapeutic_plans (patient_id);
alter table public.patient_therapeutic_plans enable row level security;

-- patient_anamnesis
do $$
declare
  r record;
begin
  if to_regclass('public.patient_anamnesis') is null then
    return;
  end if;

  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'patient_anamnesis'
  loop
    execute format('drop policy if exists %I on public.patient_anamnesis', r.policyname);
  end loop;

  execute $policy$
    create policy "Equipe lê anamneses de pacientes atribuídos"
      on public.patient_anamnesis
      for select
      to authenticated
      using (
        not public.is_familia()
        and (
          public.professional_can_access_patient(patient_id)
          or auth.uid() = professional_id
        )
      )
  $policy$;

  execute $policy$
    create policy "Equipe cria anamneses de pacientes atribuídos"
      on public.patient_anamnesis
      for insert
      to authenticated
      with check (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe atualiza anamneses de pacientes atribuídos"
      on public.patient_anamnesis
      for update
      to authenticated
      using (
        not public.is_familia()
        and (
          public.professional_can_access_patient(patient_id)
          or auth.uid() = professional_id
        )
      )
      with check (
        not public.is_familia()
        and (
          public.professional_can_access_patient(patient_id)
          or auth.uid() = professional_id
        )
      )
  $policy$;
end $$;

-- patient_body_marks
do $$
declare
  r record;
begin
  if to_regclass('public.patient_body_marks') is null then
    return;
  end if;

  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'patient_body_marks'
  loop
    execute format('drop policy if exists %I on public.patient_body_marks', r.policyname);
  end loop;

  execute $policy$
    create policy "Equipe lê mapa corporal de pacientes atribuídos"
      on public.patient_body_marks
      for select
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe cria marcas no mapa de pacientes atribuídos"
      on public.patient_body_marks
      for insert
      to authenticated
      with check (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe atualiza marcas de pacientes atribuídos"
      on public.patient_body_marks
      for update
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
      with check (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe remove marcas de pacientes atribuídos"
      on public.patient_body_marks
      for delete
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;
end $$;

-- patient_therapeutic_plans
do $$
declare
  r record;
begin
  if to_regclass('public.patient_therapeutic_plans') is null then
    return;
  end if;

  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'patient_therapeutic_plans'
  loop
    execute format('drop policy if exists %I on public.patient_therapeutic_plans', r.policyname);
  end loop;

  execute $policy$
    create policy "Equipe lê planejamento de pacientes atribuídos"
      on public.patient_therapeutic_plans
      for select
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe cria planejamento de pacientes atribuídos"
      on public.patient_therapeutic_plans
      for insert
      to authenticated
      with check (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe atualiza planejamento de pacientes atribuídos"
      on public.patient_therapeutic_plans
      for update
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
      with check (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;

  execute $policy$
    create policy "Equipe remove planejamento de pacientes atribuídos"
      on public.patient_therapeutic_plans
      for delete
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;
end $$;

-- therapeutic_plans (legado): policies aplicadas só se a tabela existir
do $$
declare
  r record;
begin
  if to_regclass('public.therapeutic_plans') is null then
    return;
  end if;

  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'therapeutic_plans' and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.therapeutic_plans', r.policyname);
  end loop;

  execute $policy$
    create policy "Equipe lê planos terapêuticos de pacientes atribuídos"
      on public.therapeutic_plans
      for select
      to authenticated
      using (
        not public.is_familia()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;
end $$;

-- conventional_evolution: owner + acesso ao paciente
do $$
declare
  r record;
begin
  if to_regclass('public.conventional_evolution_records') is null then
    return;
  end if;

  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'conventional_evolution_records' and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.conventional_evolution_records', r.policyname);
  end loop;

  execute $policy$
    create policy "Profissional lê próprias evoluções convencionais de pacientes atribuídos"
      on public.conventional_evolution_records
      for select
      to authenticated
      using (
        professional_id = auth.uid()
        and public.professional_can_access_patient(patient_id)
      )
  $policy$;
end $$;

-- Atribuições: profissional vê os próprios vínculos; staff clínico gerencia
drop policy if exists "Equipe lê vínculos profissional-aprendiz" on public.professional_patient_assignments;
drop policy if exists "Admin/supervisor gerencia vínculos profissional-aprendiz" on public.professional_patient_assignments;
drop policy if exists "Profissional lê próprios vínculos ou admin lê todos" on public.professional_patient_assignments;
drop policy if exists "Staff gerencia vínculos profissional-aprendiz" on public.professional_patient_assignments;

create policy "Profissional lê próprios vínculos ou admin lê todos"
  on public.professional_patient_assignments
  for select
  to authenticated
  using (
    not public.is_familia()
    and (
      public.is_master()
      or public.is_supervisor_or_admin()
      or professional_id = auth.uid()
    )
  );

create policy "Staff gerencia vínculos profissional-aprendiz"
  on public.professional_patient_assignments
  for all
  to authenticated
  using (not public.is_familia())
  with check (not public.is_familia());
