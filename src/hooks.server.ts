import { redirect, type Handle } from "@sveltejs/kit";
const unProtectedRoutes = ["/", "/login"];

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session_id");
  if (!sessionId && !unProtectedRoutes.includes(event.url.pathname)) {
    throw redirect(303, "/login");
  }
  //alternative get supabase user
  const email = import.meta.env.VITE_LOGIN_EMAIL;
  if (sessionId === email) {
    event.locals.user = {
      email: email,
    };
  } else {
    if (!unProtectedRoutes.includes(event.url.pathname)) {
      throw redirect(303, "/login");
    }
  }
  return await resolve(event, {
    preload: ({ type }) => {
      return type === "font" || type === "js" || type === "css";
    },
  });
};
