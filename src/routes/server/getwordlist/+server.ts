import { getVocabList } from "$lib/db/queries/select";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  const index = url.searchParams.get("index");
  if (!index) error(400, "not found index");

  try {
    let list = await getVocabList(Number(index));
    if (!list.length) error(400, "not found word");
    return new Response(JSON.stringify(list));
  } catch (e) {
    error(404);
  }
}
