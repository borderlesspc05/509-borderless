import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { isInvalidRefreshTokenError } from "@/lib/supabase/auth-errors";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export { isSupabaseConfigured };

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;
let browserAuthRecoveryStarted = false;

function startBrowserAuthRecovery(
  client: ReturnType<typeof createBrowserClient<Database>>
) {
  if (browserAuthRecoveryStarted || typeof window === "undefined") {
    return;
  }

  browserAuthRecoveryStarted = true;

  void client.auth.getSession().then(({ error }) => {
    if (isInvalidRefreshTokenError(error)) {
      void client.auth.signOut({ scope: "local" });
    }
  });
}

export function createBrowserSupabaseClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
    startBrowserAuthRecovery(browserClient);
  }

  return browserClient;
}
