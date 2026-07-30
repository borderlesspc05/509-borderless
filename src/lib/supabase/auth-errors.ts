import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type AnySupabaseClient = SupabaseClient<Database>;

export function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const authError = error as Pick<AuthError, "code" | "message" | "status">;
  const code = authError.code?.toLowerCase() ?? "";
  const message = authError.message?.toLowerCase() ?? "";

  return (
    code === "refresh_token_not_found" ||
    code === "refresh_token_already_used" ||
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found") ||
    message.includes("refresh token already used")
  );
}

/**
 * getUser() com limpeza de cookies quando o refresh token está inválido/expirado.
 * Evita loops de AuthApiError no servidor após logout parcial ou sessão stale.
 */
export async function getAuthUserSafely(
  supabase: AnySupabaseClient
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.getUser();

  if (!error) {
    return { user: data.user, error: null };
  }

  if (isInvalidRefreshTokenError(error)) {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Cookies podem já estar inconsistentes; segue como não autenticado.
    }
    return { user: null, error: null };
  }

  return { user: data.user, error };
}
