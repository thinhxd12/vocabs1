import { getTotalMemories } from "$lib/db/queries/select";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const length = await getTotalMemories();
    if (!length) error(400, "not found word");
    return new Response(JSON.stringify(length));
  } catch (e) {
    error(404);
  }
}
