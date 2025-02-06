import {
  getSchedule,
  getTotalMemories,
  getWeatherList,
} from "$lib/db/queries/select";
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies }) => {
  if (!cookies.get("logged_in")) {
    redirect(303, `/login`);
  }

  const length = await getTotalMemories();
  const schedule = await getSchedule();
  const weatherList = await getWeatherList();

  return {
    totalMemories: length,
    schedule: schedule,
    weather: weatherList,
  };
};
