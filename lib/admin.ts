import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data } = await supabase
    .from("admin_users")
    .select("id,email,role")
    .eq("email", user.email)
    .eq("role", "admin")
    .maybeSingle();

  return data ? { user, admin: data } : null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
