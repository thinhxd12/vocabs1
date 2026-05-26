import { createServerClient } from "@supabase/ssr";
import { redirect, type Handle } from "@sveltejs/kit";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} from "$env/static/public";

const unProtectedRoutes = ["/login", "/logout"];

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet: any) => {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    },
  );

  event.locals.safeGetSession = async () => {
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { user: null };
    } else return { user: user.aud };
  };

  const sessionId = event.cookies.get("session_id");
  if (!sessionId && !unProtectedRoutes.includes(event.url.pathname)) {
    await event.locals.supabase.auth.signOut();
    throw redirect(303, "/login");
  }

  const { user } = await event.locals.safeGetSession();
  const isLoggingIn = event.url.pathname.startsWith("/login");
  const isLoggingOut = event.url.pathname.startsWith("/logout");
  if (user && isLoggingIn && !isLoggingOut) {
    throw redirect(303, "/vocab");
  }
  if (!user && !unProtectedRoutes.includes(event.url.pathname)) {
    throw redirect(303, "/login");
  }

  return await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
    preload: ({ type }) => {
      return type === "font" || type === "js" || type === "css";
    },
  });
};
