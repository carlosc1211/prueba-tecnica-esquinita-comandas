import "server-only";
import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "../env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  // El cliente lee la hora (validación de expiración del JWT); io() la excluye de cualquier prerender, incluido el de runtime donde cookies() ya resolvió.
  await io();
  const { url, publishableKey } = requireSupabaseEnv();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          return;
        }
      },
    },
  });
}
