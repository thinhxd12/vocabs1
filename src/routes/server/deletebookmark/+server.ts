import { deleteBookmarkById, deleteVocabById } from "$lib/db/queries/delete";
import { error, json } from "@sveltejs/kit";

export async function GET({ url }) {
  const id = url.searchParams.get("id");
  if (!id) return json({ message: "Id not found", status: false });
  const result = await deleteBookmarkById(id);
  if (result.status) {
    return json({ message: result.data.message, status: result.status });
  }
  error(404);
}
