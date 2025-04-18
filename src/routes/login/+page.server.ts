import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { dev } from "$app/environment";
import type { LayoutServerLoad } from "../$types";

export const actions = {
  signin: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = import.meta.env.VITE_LOGIN_EMAIL;
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
      cookies.set("session_id", email, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: !dev,
        maxAge: 60 * 60 * 24 * 7,
      });
      throw redirect(303, "/vocab");
    }
  },
  signout: async ({ cookies, locals: { supabase, safeGetSession } }) => {
    cookies.delete("session_id", { path: "/" });
    const { user } = await safeGetSession();
    if (user) {
      await supabase.auth.signOut();
      redirect(303, "/login");
    }
  },
} satisfies Actions;

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  if (locals.user) {
    throw redirect(308, cookies.get("redirect_to") || "/vocab");
  }
};
