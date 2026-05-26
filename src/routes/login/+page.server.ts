import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { dev } from "$app/environment";
import { SECRET_LOGIN_EMAIL } from "$env/static/private";

export const actions = {
  default: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = SECRET_LOGIN_EMAIL;
    const password = formData.get("password") as string;

    if (password.length < 6) {
      return fail(422, {
        error: "Passwords must be at least 6 characters long",
      });
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return fail(422, {
        error: error.message,
      });
    } else {
      cookies.set("session_id", "thinh", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7,
      });
      throw redirect(303, "/vocab");
    }
  },
} satisfies Actions;
