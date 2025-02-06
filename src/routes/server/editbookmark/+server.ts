import {
  getBookmarkBySelected,
  getNextBookmark,
  getPreviousBookmark,
  getRandomBookmark,
} from "$lib/db/queries/select";
import {
  decreaseBookmarkLikeById,
  increaseBookmarkLikeById,
  updateBookmarkContentById,
  updateBookmarkSelectById,
  updateBookmarkSelectFalse,
} from "$lib/db/queries/update.js";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies, request }) => {
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const content = formData.get("content") as string;

  if (id.length === 0 || content.length === 0)
    return error(404, "Invalid data");

  const result = await updateBookmarkContentById(id, content);
  if (result.status) {
    return new Response(
      JSON.stringify({
        message: "Edit successfully",
      })
    );
  } else {
    return error(422, result.data.message);
  }
};
