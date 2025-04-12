import {
  getSchedule,
  getTotalMemories,
  getWeatherList,
} from "$lib/db/queries/select";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const length = await getTotalMemories();
  const schedule = await getSchedule();
  const weatherList = await getWeatherList();

  return {
    totalMemories: length,
    schedule: schedule,
    weather: weatherList,
  };
};
