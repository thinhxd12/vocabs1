import { deleteVocabById } from "$lib/db/queries/delete";
import { error, json } from "@sveltejs/kit";

export async function GET({ url }) {
  const id = url.searchParams.get("id");
  if (!id) throw error(400, "not found id");
  const result = await deleteVocabById(id);
  return json({ data: result.data.message }, { status: 201 });
}
