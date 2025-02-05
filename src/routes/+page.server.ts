import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  if (!cookies.get("logged_in")) {
    redirect(303, `/login`);
  }
  redirect(308, `/vocab`);
};
