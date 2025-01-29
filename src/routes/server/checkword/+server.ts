import { decreaseNumberVocabById } from "$lib/db/queries/update";
import { error, json } from "@sveltejs/kit";

export async function GET({ url }) {
  const id = url.searchParams.get("id");
  if (!id) throw error(400, "not found id");
  await decreaseNumberVocabById(id);
  return json({ id }, { status: 201 });
}
