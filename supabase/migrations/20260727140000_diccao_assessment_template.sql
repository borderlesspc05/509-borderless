-- Avaliação da Dicção (Fonoaudiologia) — template + contexto de AI writing

insert into public.assessment_templates (id, name, description, evaluation_type, status, created_at)
values (
  'b1000013-0000-4000-8000-000000000013',
  'Avaliação da Dicção',
  'Protocolo adaptado para avaliação da dicção: articulação, intensidade vocal, tempo máximo de fonação, diadocinesia, fala automática, mobilidade orofacial e trava-línguas.',
  'acquisition',
  'active',
  now()
)
on conflict (id) do nothing;

insert into public.clinical_area_ai_memory (clinical_area, status)
values ('Avaliação da Dicção', 'not_started')
on conflict (clinical_area) do nothing;
