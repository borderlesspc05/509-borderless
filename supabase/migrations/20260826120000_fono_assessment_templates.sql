-- Templates de avaliação — Fonoaudiologia (AMIOFE, Motricidade, Linguagem, ABFW, MBGR)

insert into public.assessment_templates (id, name, description, evaluation_type, status, created_at)
values
  (
    'b1000014-0000-4000-8000-000000000014',
    'AMIOFE — Avaliação Miofuncional Orofacial com Escores',
    'Protocolo AMIOFE: aparência/postura, mobilidade e funções orofaciais com escores.',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000015-0000-4000-8000-000000000015',
    'Motricidade Orofacial — Avaliação Fonoaudiológica Infantil',
    'Avaliação infantil de órgãos fonoarticulatórios e funções neurovegetativas (adaptação MBGR).',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000016-0000-4000-8000-000000000016',
    'Linguagem Infantil — PROC / TIPITI',
    'Observação comportamental de linguagem infantil baseada no PROC (Zorzi & Hage) e TIPITI.',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000017-0000-4000-8000-000000000017',
    'ABFW — Prova de Fonologia',
    'Prova de fonologia ABFW: emissão, recepção e quadro fonético.',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000018-0000-4000-8000-000000000018',
    'MBGR — Exame Miofuncional Orofacial',
    'Exame miofuncional orofacial MBGR. A história clínica correspondente fica na anamnese de Fonoaudiologia.',
    'acquisition',
    'active',
    now()
  )
on conflict (id) do nothing;

insert into public.clinical_area_ai_memory (clinical_area, status)
values
  ('AMIOFE — Avaliação Miofuncional Orofacial com Escores', 'not_started'),
  ('Motricidade Orofacial — Avaliação Fonoaudiológica Infantil', 'not_started'),
  ('Linguagem Infantil — PROC / TIPITI', 'not_started'),
  ('ABFW — Prova de Fonologia', 'not_started'),
  ('MBGR — Exame Miofuncional Orofacial', 'not_started')
on conflict (clinical_area) do nothing;
