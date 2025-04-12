import { supabase } from "$lib/supabase";
import { json } from "@sveltejs/kit";

export async function POST({ request, cookies }) {
  const { error } = await supabase.auth.signOut();
  cookies.delete("session_id", { path: "/" });
  return json({ success: true, redirectTo: "/login" });
}
