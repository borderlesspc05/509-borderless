/**
 * Completa o perfil COORDENADOR após o check constraint estar liberado.
 * Pré-requisito: rodar supabase/seed_coordenador_user.sql no SQL Editor
 *   (pelo menos o ALTER CONSTRAINT).
 *
 * Uso: node scripts/ensure-coordenador.mjs
 */
const { createClient } = require("@supabase/supabase-js");
const { config } = require("dotenv");

config({ path: ".env.local" });

const email = "coordenador@clinica.demo";
const password = "Demo@1234";
const fullName = "Fernanda Oliveira";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw listError;
  }

  let user = listed.users.find((item) => item.email === email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, profile: "COORDENADOR" },
    });
    if (error) throw error;
    user = data.user;
    console.log("Auth criado:", user.id);
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { full_name: fullName, profile: "COORDENADOR" },
    });
    console.log("Auth já existia:", user.id);
  }

  const { error: profileError } = await admin.from("user_profiles").upsert({
    id: user.id,
    full_name: fullName,
    profile: "COORDENADOR",
    is_master: false,
    professional_role: "Coordenador",
    professional_council: "CRP 12/77889",
    cpf: "67890123456",
    status: "active",
    patient_id: null,
  });

  if (profileError) {
    console.error("\nFalha no perfil:", profileError.message);
    console.error(
      "Rode primeiro o SQL supabase/seed_coordenador_user.sql no SQL Editor do Supabase.\n"
    );
    process.exit(1);
  }

  console.log("Perfil COORDENADOR ok");

  const patientIds = [
    "a0000001-0000-4000-8000-000000000001",
    "a0000002-0000-4000-8000-000000000002",
    "a0000005-0000-4000-8000-000000000005",
  ];

  for (const patientId of patientIds) {
    const { error } = await admin.from("professional_patient_assignments").upsert(
      { professional_id: user.id, patient_id: patientId },
      { onConflict: "professional_id,patient_id", ignoreDuplicates: true }
    );
    if (error) {
      console.warn("Caseload aviso:", patientId, error.message);
    }
  }

  console.log("\nPronto.");
  console.log(`Login: ${email}`);
  console.log(`Senha: ${password}`);
  console.log("Área: ABA (cargo Coordenador)");
  console.log("Acesso: só aprendizes vinculados + módulos clínicos da área\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
