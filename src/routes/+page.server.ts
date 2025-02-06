import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies }) => {
  if (!cookies.get("logged_in")) {
    redirect(303, `/login`);
  }
  redirect(308, `/vocab`);
};
