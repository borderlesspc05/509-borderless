-- Fisioterapia: cargo Fisioterapeuta, planejamento terapêutico por prazos e modelo de anamnese.

alter table public.user_profiles
  drop constraint if exists user_profiles_professional_role_check;

alter table public.user_profiles
  add constraint user_profiles_professional_role_check
  check (
    professional_role is null or professional_role in (
      'Psicólogo',
      'Psicólogo(a)',
      'Assistente Terapêutico (AT)',
      'Coordenador',
      'Fonoaudiólogo',
      'Terapeuta Ocupacional',
      'Supervisor Administrativo',
      'Musicoterapeuta',
      'Neuropsicólogo',
      'Psicopedagoga',
      'Fisioterapeuta'
    )
  );

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

create policy "Equipe lê planejamento terapêutico"
  on public.patient_therapeutic_plans
  for select
  to authenticated
  using (not public.is_familia());

create policy "Equipe cria planejamento terapêutico"
  on public.patient_therapeutic_plans
  for insert
  to authenticated
  with check (not public.is_familia());

create policy "Equipe atualiza planejamento terapêutico"
  on public.patient_therapeutic_plans
  for update
  to authenticated
  using (not public.is_familia())
  with check (not public.is_familia());

create policy "Equipe remove planejamento terapêutico"
  on public.patient_therapeutic_plans
  for delete
  to authenticated
  using (not public.is_familia());

insert into public.document_templates (id, name, category, body_html, status, created_at, updated_at)
values
  (
    'c1000007-0000-4000-8000-000000000007',
    'Anamnese Fisioterapia',
    'anamnese',
    $body_fisio_anamnese$
<h2>ANAMNESE — FISIOTERAPIA</h2>
<p>
Data da Anamnese: [DATA_SESSAO]<br>
Profissional: [NOME_PROFISSIONAL]<br>
Registro: [CONSELHO_PROFISSIONAL]
</p>

<h3>Identificação</h3>
<p>
Nome da criança: [NOME_PACIENTE]<br>
Data de nascimento: [DATA_NASCIMENTO] &nbsp; Idade: [IDADE]<br>
Responsáveis: [RESPONSAVEL]<br>
Telefone: [TELEFONE_RESPONSAVEL]<br>
E-mail: [EMAIL_RESPONSAVEL]
</p>

<h3>Diagnóstico e queixa principal</h3>
<p>[QUEIXA_PRINCIPAL]</p>

<h3>Queixa principal funcional</h3>
<p><em>(quedas, dificuldades de coordenação, autorregulação sensorial)</em></p>
<p>[QUEIXA_FUNCIONAL]</p>

<h3>Medicamentos em uso</h3>
<p>[MEDICAMENTOS]</p>

<h3>História pregressa — gestação/parto/puerpério e saúde</h3>
<p>
Idade gestacional: [IDADE_GESTACIONAL]<br>
Peso: [PESO_NASCIMENTO]<br>
Alta junto da mãe: [ALTA_JUNTO_MAE]<br>
Observações: [HISTORIA_PREGRESSA]
</p>

<h3>Histórico do desenvolvimento</h3>
<p>Rolou / Arrastou / Segurou objetos / Sentou / Engatinhou / Andou: [MARCOS_DESENVOLVIMENTO]</p>

<h3>Alterações musculoesqueléticas</h3>
<p>[ALTERACOES_MUSCULOESQUELETICAS]</p>

<h3>Componentes de desempenho motores</h3>
<p>[COMPONENTES_MOTORES]<br>
Dominância: [DOMINANCIA]</p>

<h3>Escola</h3>
<p>
Nome: [NOME_ESCOLA]<br>
Série: [SERIE]<br>
Contraturno: [CONTRATURNO]<br>
Queixas: [QUEIXAS_ESCOLARES]<br>
Atendente terapêutico/cuidador: [ATENDENTE_CUIDADOR]<br>
Material adaptado: [MATERIAL_ADAPTADO]
</p>

<h3>Compreensão / Imitação / Comportamento</h3>
<p>
Compreensão: [COMPREENSAO]<br>
Imitação motora: [IMITACAO_MOTORA]<br>
Comportamento: [COMPORTAMENTO]
</p>

<h3>Atividades de vida diária</h3>
<p>
Higiene: [AVD_HIGIENE]<br>
Banho: [AVD_BANHO]<br>
Higiene bucal: [AVD_HIGIENE_BUCAL]<br>
Pentear cabelo: [AVD_PENTEAR]<br>
Vestuário: [AVD_VESTUARIO]<br>
Alimentação: [AVD_ALIMENTACAO]
</p>

<h3>Rotina</h3>
<p>
Rotina geral: [ROTINA]<br>
Acordar: [ACORDAR]<br>
Brincar / TV: [BRINCAR_TV]<br>
Sono: [SONO]<br>
Tempo de telas: [TEMPO_TELAS]<br>
Brincar: [BRINCAR]
</p>

<h3>Objetivos e expectativas da família</h3>
<p>[OBJETIVOS_FAMILIA]</p>

<h3>Principais déficits-alvo / objetivos funcionais mensuráveis</h3>
<p>[OBJETIVOS_FUNCIONAIS]</p>
$body_fisio_anamnese$,
    'active',
    now(),
    now()
  )
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  body_html = excluded.body_html,
  status = excluded.status,
  updated_at = now();
