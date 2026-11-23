import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type StaffUser = {
  id: string;
  email: string;
};

export async function getStaffUser(): Promise<StaffUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) {
    return null;
  }
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}

export async function requireUser(): Promise<StaffUser> {
  const user = await getStaffUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
