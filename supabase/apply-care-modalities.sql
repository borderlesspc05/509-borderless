-- Execute no SQL Editor do Supabase (projeto 509 Borderless)
-- Corrige: Could not find the 'care_modalities' column of 'patients' in the schema cache
--
-- Dashboard: https://supabase.com/dashboard → seu projeto → SQL → New query → Run

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS care_modalities text[] NOT NULL DEFAULT '{}';

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS care_modalities text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN patients.care_modalities IS 'Modalidades de atendimento: ABA, CONVENTIONAL (pode conter ambas)';
COMMENT ON COLUMN user_profiles.care_modalities IS 'Métodos de atendimento do profissional: ABA, CONVENTIONAL (pode conter ambos)';

CREATE INDEX IF NOT EXISTS patients_care_modalities_gin_idx
  ON patients USING gin (care_modalities);

CREATE INDEX IF NOT EXISTS user_profiles_care_modalities_gin_idx
  ON user_profiles USING gin (care_modalities);

-- Após executar, recarregue a página do app (Ctrl+Shift+R).
