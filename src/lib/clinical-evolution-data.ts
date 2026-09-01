export type ClinicalPatient = {
  id: string;
  name: string;
  birthDate: string;
  guardian: string;
  diagnosis: string;
};

/** @deprecated Preferir getDocumentBrandingAction / DocumentBranding */
export const CLINIC_REPORT_HEADER = {
  name: "Nurse Care",
  legalName: "Nurse Care Soluções em Saúde",
  cnpj: "",
  address: "",
  phone: "",
  email: "",
} as const;

type PatientLike = {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_name: string | null;
  diagnosis: string | null;
};

export function mapPatientToClinicalPatient(patient: PatientLike): ClinicalPatient {
  return {
    id: patient.id,
    name: patient.full_name,
    birthDate: patient.birth_date ?? "",
    guardian: patient.guardian_name?.trim() || "—",
    diagnosis: patient.diagnosis?.trim() || "—",
  };
}

export function getClinicalPatient(
  patients: ClinicalPatient[],
  patientId: string
) {
  return patients.find((patient) => patient.id === patientId) ?? null;
}

export function parseClinicalDateKey(
  value: string | null | undefined
): Date | null {
  const match = value?.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatPatientBirthDate(
  birthDate: string | null | undefined
) {
  const date = parseClinicalDateKey(birthDate);
  if (!date) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
