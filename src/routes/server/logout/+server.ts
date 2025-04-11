import { supabase } from "$lib/supabase";
import { json } from "@sveltejs/kit";

export async function POST({ request, cookies }) {
  const { error } = await supabase.auth.signOut();
  cookies.delete("logged_in", { path: "/" });
  return json({ success: true, redirectTo: "/login" });
}
