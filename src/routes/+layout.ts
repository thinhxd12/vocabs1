import {
  createBrowserClient,
  createServerClient,
  isBrowser,
} from "@supabase/ssr";
import type { LayoutLoad } from "./$types";
import type { Database } from "../lib/utils/supabase";
const PUBLIC_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends("supabase:auth");

  const supabase = isBrowser()
    ? createBrowserClient<Database>(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            fetch,
          },
        }
      )
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
        cookies: {
          getAll() {
            return data;
          },
        },
      });

  const [
    { count: totalMemories },
    { count: totalProgress },
    { data: schedule },
    { data: weatherList },
  ] = await Promise.all([
    supabase.from("memories_table").select("*", { count: "exact", head: true }),
    supabase.from("progress_table").select("*", { count: "exact", head: true }),
    supabase
      .from("schedule_table")
      .select("*")
      .order("id", { ascending: true }),
    supabase.from("weather_table").select("*").order("id", { ascending: true }),
  ]);

  return { supabase, totalMemories, totalProgress, schedule, weatherList };
};
