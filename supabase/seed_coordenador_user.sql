-- =============================================================================
-- Coordenador demo — rode no SQL Editor do Supabase (projeto cpcewloprzyxhqdrttfu)
-- Depois: login coordenador@clinica.demo / Demo@1234
-- =============================================================================

create extension if not exists pgcrypto;

-- 1) Libera o perfil COORDENADOR
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

-- 2) Garante usuário Auth + perfil + caseload
do $$
declare
  v_user_id uuid;
  v_user_email text := 'coordenador@clinica.demo';
  v_full_name text := 'Fernanda Oliveira';
begin
  select id into v_user_id
  from auth.users
  where email = v_user_email
  limit 1;

  if v_user_id is null then
    v_user_id := 'e1000007-0000-4000-8000-000000000007';

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
      jsonb_build_object('full_name', v_full_name, 'profile', 'COORDENADOR'),
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
        || jsonb_build_object('full_name', v_full_name, 'profile', 'COORDENADOR'),
      updated_at = now()
    where id = v_user_id;
  end if;

  insert into public.user_profiles (
    id, full_name, profile, is_master,
    professional_role, professional_council, cpf, status, patient_id
  )
  values (
    v_user_id,
    v_full_name,
    'COORDENADOR',
    false,
    'Coordenador',
    'CRP 12/77889',
    '67890123456',
    'active',
    null
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    profile = excluded.profile,
    professional_role = excluded.professional_role,
    professional_council = excluded.professional_council,
    status = excluded.status,
    updated_at = now();

  insert into public.user_presence (user_id, last_seen_at)
  values (v_user_id, now())
  on conflict (user_id) do update set last_seen_at = excluded.last_seen_at;

  insert into public.professional_patient_assignments (professional_id, patient_id)
  select v_user_id, p.id
  from public.patients p
  where p.id in (
    'a0000001-0000-4000-8000-000000000001',
    'a0000002-0000-4000-8000-000000000002',
    'a0000005-0000-4000-8000-000000000005'
  )
  on conflict (professional_id, patient_id) do nothing;
end $$;
