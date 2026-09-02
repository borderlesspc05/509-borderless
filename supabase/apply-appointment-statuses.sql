-- Status clínicos da agenda (ABA e Convencional usam a mesma coluna)
-- Execute no SQL Editor do Supabase se Atendido / Faltante / Encaixe / Reagendado falharem ao salvar.

ALTER TABLE public.agenda_events
  DROP CONSTRAINT IF EXISTS agenda_events_status_check;

ALTER TABLE public.agenda_events
  ADD CONSTRAINT agenda_events_status_check
  CHECK (
    status IN (
      'agendado',
      'em_espera',
      'confirmado',
      'atendido',
      'faltante',
      'cancelado',
      'encaixe',
      'reagendado',
      'chamado'
    )
  );

COMMENT ON CONSTRAINT agenda_events_status_check ON public.agenda_events IS
  'Status clínicos da agenda + chamado (painel de recepção).';
