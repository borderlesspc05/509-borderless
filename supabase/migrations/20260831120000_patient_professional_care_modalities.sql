-- Modalidades de atendimento (ABA / CONVENCIONAL) para aprendizes e profissionais

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
