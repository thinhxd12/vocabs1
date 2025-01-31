import {
  increaseScheduleById,
  updateDateScheduleById,
} from "$lib/db/queries/update.js";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  const id = url.searchParams.get("id");
  const date = url.searchParams.get("date");
  if (!id || !date) error(400, "not found id");

  try {
    const result = await increaseScheduleById(id);
    if (result[0].count < 9) return new Response(JSON.stringify(result[0]));
    if (!result[0].date) {
      const updated = await updateDateScheduleById(id, date);
      return new Response(JSON.stringify(updated[0]));
    }
    return new Response(JSON.stringify(result[0]));
  } catch (e) {
    error(404);
  }
}
