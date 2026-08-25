-- Perfis: Administrador, Coordenador, Supervisor, AT, Recepção (+ legado)
-- Status de agenda: Acrescenta Atendido, Faltante, Encaixe, Reagendado

alter table public.user_profiles
  drop constraint if exists user_profiles_profile_check;

alter table public.user_profiles
  add constraint user_profiles_profile_check
  check (
    profile in (
      'ADMIN',
      'COORDENADOR',
      'SUPERVISOR',
      'RECEPCAO',
      'AT1',
      'AT2',
      'FAMILIA'
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  master_exists boolean;
  selected_profile text;
  selected_patient_id uuid;
begin
  select exists (
    select 1 from public.user_profiles where is_master = true
  ) into master_exists;

  selected_profile := coalesce(
    new.raw_user_meta_data ->> 'profile',
    'RECEPCAO'
  );

  if selected_profile not in (
    'ADMIN',
    'COORDENADOR',
    'SUPERVISOR',
    'RECEPCAO',
    'AT1',
    'AT2',
    'FAMILIA'
  ) then
    selected_profile := case lower(selected_profile)
      when 'administracao' then 'ADMIN'
      when 'administrador' then 'ADMIN'
      when 'coordenador' then 'COORDENADOR'
      when 'supervisor' then 'SUPERVISOR'
      when 'recepcao' then 'RECEPCAO'
      when 'at' then 'AT1'
      when 'familia' then 'FAMILIA'
      else 'RECEPCAO'
    end;
  end if;

  selected_patient_id := null;
  if selected_profile = 'FAMILIA' then
    begin
      selected_patient_id := (new.raw_user_meta_data ->> 'patient_id')::uuid;
    exception
      when others then
        selected_patient_id := null;
    end;

    if selected_patient_id is null then
      raise exception 'Perfil FAMILIA exige patient_id nos metadados do usuário.';
    end if;
  end if;

  insert into public.user_profiles (
    id,
    full_name,
    profile,
    is_master,
    professional_council,
    patient_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuário'),
    case
      when master_exists then selected_profile
      else 'ADMIN'
    end,
    not master_exists,
    new.raw_user_meta_data ->> 'professional_council',
    case
      when master_exists and selected_profile = 'FAMILIA' then selected_patient_id
      else null
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

alter table public.agenda_events
  drop constraint if exists agenda_events_status_check;

alter table public.agenda_events
  add constraint agenda_events_status_check
  check (
    status in (
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

comment on constraint agenda_events_status_check on public.agenda_events is
  'Status clínicos da agenda + chamado (painel de recepção).';
