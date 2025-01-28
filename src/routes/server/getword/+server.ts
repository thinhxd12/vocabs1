import { getVocabById } from "$lib/db/queries/select";
import { error } from "@sveltejs/kit";

export async function GET({ url }) {
  const id = url.searchParams.get("id");
  if (!id) error(400, "not found id");

  try {
    let word = await getVocabById(id);
    if (!word) error(400, "not found word");
    return new Response(JSON.stringify(word));
  } catch (e) {
    error(404);
  }
}
