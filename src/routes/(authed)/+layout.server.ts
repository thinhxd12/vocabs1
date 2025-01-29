import { getTotalMemories } from "$lib/db/queries/select";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
  if (!cookies.get("logged_in")) {
    redirect(303, `/login`);
  }

  const length = await getTotalMemories();
  return { totalMemories: length };
}
