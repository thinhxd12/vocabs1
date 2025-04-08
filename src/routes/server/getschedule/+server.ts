import { getDiary, getTotalProgress } from "$lib/db/queries/select";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const progressLength = await getTotalProgress();
    let index = Math.ceil(progressLength / 5);
    const diary = await getDiary();

    const result = {
      progressLength: index,
      diary,
    };
    return new Response(JSON.stringify(result));
  } catch (e) {
    error(404);
  }
}
