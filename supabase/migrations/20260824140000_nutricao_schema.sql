-- Módulo de Nutrição — schema completo

-- Anamnese nutricional (por consulta)
create table if not exists public.patient_nutrition_anamnesis (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  consultation_date date not null default current_date,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_nutrition_anamnesis_patient
  on public.patient_nutrition_anamnesis(patient_id);

-- Antropometria (adulto, criança, gestante)
create table if not exists public.patient_nutrition_anthropometry (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  record_type text not null check (record_type in ('adult', 'child', 'pregnant')),
  consultation_date date not null default current_date,
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_nutrition_anthropometry_patient
  on public.patient_nutrition_anthropometry(patient_id);
create index if not exists idx_patient_nutrition_anthropometry_type
  on public.patient_nutrition_anthropometry(record_type);

-- Cálculos energéticos salvos
create table if not exists public.patient_nutrition_energy (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  population text not null check (population in ('adult', 'child', 'pregnant')),
  formula text not null,
  form_data jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_nutrition_energy_patient
  on public.patient_nutrition_energy(patient_id);

-- Banco de alimentos
create table if not exists public.nutrition_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text not null default 'custom' check (source in ('tbca', 'tucunduva', 'custom')),
  serving_size_g numeric(8,2) not null default 100,
  calories_kcal numeric(8,2) not null default 0,
  carbs_g numeric(8,2) not null default 0,
  protein_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0,
  created_by uuid references auth.users(id),
  is_custom boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_nutrition_foods_name on public.nutrition_foods(name);

-- Planos alimentares
create table if not exists public.patient_nutrition_meal_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  title text not null default 'Plano alimentar',
  meals jsonb not null default '[]'::jsonb,
  macros jsonb not null default '{}'::jsonb,
  notes text,
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_nutrition_meal_plans_patient
  on public.patient_nutrition_meal_plans(patient_id);

-- Biblioteca de orientações nutricionais
create table if not exists public.nutrition_orientation_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  condition_tag text,
  content text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orientações aplicadas ao paciente
create table if not exists public.patient_nutrition_orientations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  title text not null,
  content text not null default '',
  template_id uuid references public.nutrition_orientation_templates(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_nutrition_orientations_patient
  on public.patient_nutrition_orientations(patient_id);

-- Biblioteca de prescrições de manipulados
create table if not exists public.nutrition_prescription_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  condition_tag text,
  content text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prescrições aplicadas ao paciente
create table if not exists public.patient_nutrition_prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid not null references auth.users(id),
  title text not null,
  content text not null default '',
  template_id uuid references public.nutrition_prescription_templates(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_nutrition_prescriptions_patient
  on public.patient_nutrition_prescriptions(patient_id);

-- RLS
alter table public.patient_nutrition_anamnesis enable row level security;
alter table public.patient_nutrition_anthropometry enable row level security;
alter table public.patient_nutrition_energy enable row level security;
alter table public.nutrition_foods enable row level security;
alter table public.patient_nutrition_meal_plans enable row level security;
alter table public.nutrition_orientation_templates enable row level security;
alter table public.patient_nutrition_orientations enable row level security;
alter table public.nutrition_prescription_templates enable row level security;
alter table public.patient_nutrition_prescriptions enable row level security;

-- Políticas genéricas por paciente
create policy "Nutrição anamnese — leitura"
  on public.patient_nutrition_anamnesis for select
  using (public.is_supervisor_or_admin() or public.professional_can_access_patient(patient_id));

create policy "Nutrição anamnese — escrita"
  on public.patient_nutrition_anamnesis for insert
  with check (auth.role() = 'authenticated' and public.professional_can_access_patient(patient_id));

create policy "Nutrição anamnese — atualização"
  on public.patient_nutrition_anamnesis for update
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Nutrição anamnese — exclusão"
  on public.patient_nutrition_anamnesis for delete
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Nutrição antropometria — leitura"
  on public.patient_nutrition_anthropometry for select
  using (public.is_supervisor_or_admin() or public.professional_can_access_patient(patient_id));

create policy "Nutrição antropometria — escrita"
  on public.patient_nutrition_anthropometry for insert
  with check (auth.role() = 'authenticated' and public.professional_can_access_patient(patient_id));

create policy "Nutrição antropometria — atualização"
  on public.patient_nutrition_anthropometry for update
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Nutrição antropometria — exclusão"
  on public.patient_nutrition_anthropometry for delete
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Nutrição energia — leitura"
  on public.patient_nutrition_energy for select
  using (public.is_supervisor_or_admin() or public.professional_can_access_patient(patient_id));

create policy "Nutrição energia — escrita"
  on public.patient_nutrition_energy for insert
  with check (auth.role() = 'authenticated' and public.professional_can_access_patient(patient_id));

create policy "Nutrição energia — exclusão"
  on public.patient_nutrition_energy for delete
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Alimentos — leitura"
  on public.nutrition_foods for select
  using (auth.role() = 'authenticated');

create policy "Alimentos — escrita"
  on public.nutrition_foods for insert
  with check (auth.role() = 'authenticated');

create policy "Alimentos — atualização"
  on public.nutrition_foods for update
  using (auth.role() = 'authenticated');

create policy "Planos alimentares — leitura"
  on public.patient_nutrition_meal_plans for select
  using (
    is_template = true
    or public.is_supervisor_or_admin()
    or (patient_id is not null and public.professional_can_access_patient(patient_id))
  );

create policy "Planos alimentares — escrita"
  on public.patient_nutrition_meal_plans for insert
  with check (auth.role() = 'authenticated');

create policy "Planos alimentares — atualização"
  on public.patient_nutrition_meal_plans for update
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Planos alimentares — exclusão"
  on public.patient_nutrition_meal_plans for delete
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Templates orientação — leitura"
  on public.nutrition_orientation_templates for select
  using (auth.role() = 'authenticated');

create policy "Templates orientação — escrita"
  on public.nutrition_orientation_templates for insert
  with check (auth.role() = 'authenticated');

create policy "Templates orientação — atualização"
  on public.nutrition_orientation_templates for update
  using (auth.role() = 'authenticated');

create policy "Orientações paciente — leitura"
  on public.patient_nutrition_orientations for select
  using (public.is_supervisor_or_admin() or public.professional_can_access_patient(patient_id));

create policy "Orientações paciente — escrita"
  on public.patient_nutrition_orientations for insert
  with check (auth.role() = 'authenticated' and public.professional_can_access_patient(patient_id));

create policy "Orientações paciente — exclusão"
  on public.patient_nutrition_orientations for delete
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

create policy "Templates prescrição — leitura"
  on public.nutrition_prescription_templates for select
  using (auth.role() = 'authenticated');

create policy "Templates prescrição — escrita"
  on public.nutrition_prescription_templates for insert
  with check (auth.role() = 'authenticated');

create policy "Templates prescrição — atualização"
  on public.nutrition_prescription_templates for update
  using (auth.role() = 'authenticated');

create policy "Prescrições paciente — leitura"
  on public.patient_nutrition_prescriptions for select
  using (public.is_supervisor_or_admin() or public.professional_can_access_patient(patient_id));

create policy "Prescrições paciente — escrita"
  on public.patient_nutrition_prescriptions for insert
  with check (auth.role() = 'authenticated' and public.professional_can_access_patient(patient_id));

create policy "Prescrições paciente — exclusão"
  on public.patient_nutrition_prescriptions for delete
  using (public.is_supervisor_or_admin() or auth.uid() = professional_id);

-- Alimentos base (referência TBCA simplificada)
insert into public.nutrition_foods (name, source, serving_size_g, calories_kcal, carbs_g, protein_g, fat_g, is_custom)
values
  ('Arroz branco cozido', 'tbca', 100, 128, 28.1, 2.5, 0.2, false),
  ('Feijão carioca cozido', 'tbca', 100, 76, 13.6, 4.8, 0.5, false),
  ('Frango grelhado (peito)', 'tbca', 100, 159, 0, 32.0, 3.6, false),
  ('Ovo cozido', 'tbca', 100, 155, 1.1, 13.0, 11.0, false),
  ('Banana prata', 'tbca', 100, 98, 26.0, 1.3, 0.1, false),
  ('Maçã com casca', 'tbca', 100, 56, 15.2, 0.3, 0.1, false),
  ('Leite integral', 'tbca', 100, 61, 4.7, 3.2, 3.3, false),
  ('Pão francês', 'tbca', 100, 300, 58.6, 8.0, 3.1, false),
  ('Batata cozida', 'tbca', 100, 52, 11.9, 1.2, 0.0, false),
  ('Azeite de oliva', 'tbca', 100, 884, 0, 0, 100.0, false),
  ('Alface crua', 'tbca', 100, 11, 1.7, 1.4, 0.2, false),
  ('Tomate cru', 'tbca', 100, 15, 3.1, 1.1, 0.2, false),
  ('Iogurte natural integral', 'tbca', 100, 61, 4.7, 3.5, 3.3, false),
  ('Carne bovina magra grelhada', 'tbca', 100, 219, 0, 32.0, 9.0, false),
  ('Peixe tilápia grelhada', 'tbca', 100, 128, 0, 26.0, 2.7, false);

-- Templates iniciais de orientações
insert into public.nutrition_orientation_templates (title, condition_tag, content)
values
  ('Diabetes mellitus — orientações gerais', 'diabetes',
   'Distribuir carboidratos ao longo do dia; priorizar alimentos in natura; evitar ultraprocessados; associar fibras às refeições; manter hidratação adequada; respeitar horários das refeições.'),
  ('Dislipidemia — redução de gorduras', 'dislipidemia',
   'Reduzir gorduras saturadas e trans; priorizar peixes, azeite, castanhas; aumentar fibras solúveis; limitar frituras e embutidos; incluir vegetais em todas as refeições.'),
  ('Síndrome do intestino irritável — FODMAPs', 'sii',
   'Identificar alimentos desencadeantes; fracionar refeições; evitar excesso de fibras insolúveis em crises; manter registro alimentar; reintroduzir grupos gradualmente.');

-- Templates iniciais de prescrições
insert into public.nutrition_prescription_templates (title, condition_tag, content)
values
  ('Suporte vitamínico — deficiência de vitamina D', 'vitamina_d',
   'Vitamina D3 — conforme dosagem prescrita pelo médico/nutricionista. Tomar junto à refeição principal. Reavaliar níveis séricos em 90 dias.'),
  ('Probiótico — disbiose intestinal', 'disbiose',
   'Probiótico multicepa — 1 cápsula ao dia, em jejum ou conforme orientação da farmácia de manipulação. Manter por 30 a 60 dias.'),
  ('Ômega 3 — perfil inflamatório', 'omega3',
   'Óleo de peixe EPA/DHA — dose conforme avaliação clínica. Preferir tomada junto à refeição para melhor absorção.');
