import { getTotalProgressByIndex } from "$lib/db/queries/select";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  const index = url.searchParams.get("index");
  if (!index) error(400, "not found index");

  try {
    let result = await getTotalProgressByIndex(Number(index));
    if (!result) error(400, "not found word");
    return new Response(JSON.stringify(result));
  } catch (e) {
    error(404);
  }
}
