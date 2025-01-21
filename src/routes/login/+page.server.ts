import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/supabase";

export const actions = {
  login: async ({ cookies, url, request }) => {
    const formData = await request.formData();
    const email = import.meta.env.VITE_LOGIN_EMAIL;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      // redirect(303, "/auth/error");
    } else {
      cookies.set("logged_in", "true", { path: "/" });
      redirect(303, "/vocab");
    }
  },
  logout: async ({ cookies }) => {
    const { error } = await supabase.auth.signOut();
    cookies.delete("logged_in", { path: "/" });
    redirect(303, "/");
  },
} satisfies Actions;

// async function handleSubmit() {
//   // Handle login logic here
//   // console.log("Username:", username);
//   // console.log("Password:", password);

//   const { error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     console.error("Error logging in:", error.message);
//   } else {
//     console.log("Login successful");
//     goto("/vocab");
//   }
// }
