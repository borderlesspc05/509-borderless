-- Perfil COLABORADOR: mesmos acessos do ADMIN, sem atendimento convencional.
-- Também libera COORDENADOR se ainda não estiver no check.

alter table public.user_profiles
  drop constraint if exists user_profiles_profile_check;

alter table public.user_profiles
  add constraint user_profiles_profile_check
  check (
    profile in (
      'ADMIN',
      'COLABORADOR',
      'COORDENADOR',
      'SUPERVISOR',
      'RECEPCAO',
      'AT1',
      'AT2',
      'FAMILIA'
    )
  );

-- RLS amplo: colaborador age como admin/supervisor (exceto telas convencionais no app)
create or replace function public.is_supervisor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profile in ('ADMIN', 'COLABORADOR', 'SUPERVISOR') or is_master = true
      from public.user_profiles
      where id = auth.uid()
    ),
    false
  );
$$;

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
    'COLABORADOR',
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
      when 'colaborador' then 'COLABORADOR'
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
