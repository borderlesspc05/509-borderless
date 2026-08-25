import type { UserProfile } from "@/lib/auth";
import { userProfileOptions } from "@/lib/auth";
import { isRole, normalizeRole, ROLES } from "@/lib/rbac";
import type { UserProfileRow } from "@/lib/supabase/database.types";

export type AppUserSession = {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  profile: UserProfile;
  displayRole: string;
  isMaster: boolean;
  professionalRole: string | null;
  professionalCouncil: string | null;
  patientId: string | null;
};

export function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "US";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function getProfileLabel(profile: UserProfile) {
  return (
    userProfileOptions.find((option) => option.value === profile)?.label ??
    profile
  );
}

export function getDisplayRole(profile: UserProfile, isMaster: boolean) {
  if (isMaster) {
    return "Master da plataforma";
  }

  return getProfileLabel(profile);
}

/**
 * Resolve o perfil efetivo. Se o check do banco ainda não aceita COLABORADOR/
 * COORDENADOR, o Auth metadata mantém o perfil pretendido.
 */
export function resolveEffectiveProfile(
  dbProfile: string,
  authMetadata?: Record<string, unknown> | null
): UserProfile {
  const metaProfile = authMetadata?.profile;
  if (
    typeof metaProfile === "string" &&
    isRole(metaProfile) &&
    (metaProfile === ROLES.COLABORADOR || metaProfile === ROLES.COORDENADOR) &&
    dbProfile !== metaProfile
  ) {
    return metaProfile;
  }

  return normalizeRole(dbProfile);
}

export function mapUserProfileRow(
  authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown> | null;
  },
  profile: UserProfileRow
): AppUserSession {
  const fullName = profile.full_name;
  const normalizedProfile = resolveEffectiveProfile(
    profile.profile,
    authUser.user_metadata
  );

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    fullName,
    initials: getInitials(fullName),
    profile: normalizedProfile,
    displayRole: getDisplayRole(normalizedProfile, profile.is_master),
    isMaster: profile.is_master,
    professionalRole: profile.professional_role ?? null,
    professionalCouncil: profile.professional_council,
    patientId: profile.patient_id ?? null,
  };
}
