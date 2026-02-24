import { createServerClient } from "@supabase/ssr";
import { redirect, type Handle } from "@sveltejs/kit";
const PUBLIC_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const unProtectedRoutes = ["/", "/login"];

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
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
    }

    return { user };
  };

  const sessionId = event.cookies.get("session_id");
  if (!sessionId && !unProtectedRoutes.includes(event.url.pathname)) {
    throw redirect(303, "/login");
  }

  const {
    data: { user },
    error,
  } = await event.locals.supabase.auth.getUser();

  if (error || !user) {
    if (!unProtectedRoutes.includes(event.url.pathname)) {
      throw redirect(303, "/login");
    }
  }

  if (user && sessionId === user?.email) {
    event.locals.user = {
      email: user.email,
    };
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
