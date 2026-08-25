-- Colaborador demo (rode no SQL Editor do Supabase)
-- Login: colaborador@clinica.demo / Demo@1234

create extension if not exists pgcrypto;

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

do $$
declare
  v_user_id uuid;
  v_user_email text := 'colaborador@clinica.demo';
  v_full_name text := 'Colaborador Demo';
begin
  select id into v_user_id from auth.users where email = v_user_email limit 1;

  if v_user_id is null then
    v_user_id := 'e1000008-0000-4000-8000-000000000008';

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_user_email,
      crypt('Demo@1234', gen_salt('bf')),
      now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_full_name, 'profile', 'COLABORADOR'),
      now(), now(), '', '', '', ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    )
    values (
      v_user_id, v_user_id, v_user_email,
      jsonb_build_object('sub', v_user_id::text, 'email', v_user_email),
      'email', now(), now(), now()
    )
    on conflict do nothing;
  else
    update auth.users
    set
      encrypted_password = crypt('Demo@1234', gen_salt('bf')),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', v_full_name, 'profile', 'COLABORADOR'),
      updated_at = now()
    where id = v_user_id;
  end if;

  insert into public.user_profiles (
    id, full_name, profile, is_master,
    professional_role, professional_council, status, patient_id
  )
  values (
    v_user_id,
    v_full_name,
    'COLABORADOR',
    false,
    null,
    null,
    'active',
    null
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    profile = excluded.profile,
    status = excluded.status,
    updated_at = now();
end $$;
