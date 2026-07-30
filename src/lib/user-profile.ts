import type { UserProfile } from "@/lib/auth";
import { userProfileOptions } from "@/lib/auth";
import { normalizeRole } from "@/lib/rbac";
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

export function mapUserProfileRow(
  authUser: { id: string; email?: string },
  profile: UserProfileRow
): AppUserSession {
  const fullName = profile.full_name;

  const normalizedProfile = normalizeRole(profile.profile);

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
