import { updateVocabById } from "$lib/db/queries/update";
import { error } from "@sveltejs/kit";

export async function POST({ request, cookies, url }) {
  const { vocab } = await request.json();
  if (!vocab) error(400, "not found");

  try {
    const result = await updateVocabById(vocab);
    if (!result.status) error(400, result.data.message);
    // return new Response("Update successful");
    return new Response(JSON.stringify(vocab));
  } catch (e) {
    error(404);
  }
}
