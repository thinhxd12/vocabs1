import { supabase } from "$lib/supabase";
import { redirect, type Handle } from "@sveltejs/kit";
const unProtectedRoutes = ["/", "/login"];

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session_id");
  if (!sessionId && !unProtectedRoutes.includes(event.url.pathname)) {
    throw redirect(303, "/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && sessionId === session.user.email) {
    event.locals.user = {
      email: session.user.email!,
    };
  } else {
    if (!unProtectedRoutes.includes(event.url.pathname)) {
      return redirect(303, "/login");
    }
  }
  return await resolve(event, {
    preload: ({ type }) => {
      return type === "font" || type === "js" || type === "css";
    },
  });
};
