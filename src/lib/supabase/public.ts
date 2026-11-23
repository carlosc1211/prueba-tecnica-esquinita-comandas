import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "../env";

export function createSupabasePublicClient() {
  const env = readSupabaseEnv();
  if (!env) {
    return null;
  }
  return createClient(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
