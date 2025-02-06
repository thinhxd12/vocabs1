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

export async function GET({ url }) {
  const select = url.searchParams.get("select");
  const nextid = url.searchParams.get("nextid");
  const previd = url.searchParams.get("previd");
  const like = url.searchParams.get("like");
  const unlike = url.searchParams.get("unlike");
  const random = url.searchParams.get("random");

  try {
    if (like) {
      increaseBookmarkLikeById(like);
      return new Response(JSON.stringify(like));
    }
    if (unlike) {
      decreaseBookmarkLikeById(unlike);
      return new Response(JSON.stringify(like));
    }
    if (select == "true") {
      let bookmark = await getBookmarkBySelected();
      if (!bookmark) error(400, "not found");
      return new Response(JSON.stringify(bookmark));
    }
    if (nextid) {
      const data = await getNextBookmark(nextid);
      await updateBookmarkSelectFalse();
      if (data) {
        await updateBookmarkSelectById(data[0].id, true);
        return new Response(JSON.stringify(data[0]));
      }
      error(400, "not found");
    }
    if (previd) {
      const data = await getPreviousBookmark(previd);
      await updateBookmarkSelectFalse();
      if (data) {
        await updateBookmarkSelectById(data[0].id, true);
        return new Response(JSON.stringify(data[0]));
      }
      error(400, "not found");
    }

    if (random == "true") {
      const data = await getRandomBookmark();
      if (data) return new Response(JSON.stringify(data[0]));
    }
  } catch (e) {
    error(404);
  }
}
