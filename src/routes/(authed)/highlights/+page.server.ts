import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
  parseKindleEntries,
  readKindleClipping,
} from "@darylserrano/kindle-clippings";
import { v7 as uuidv7 } from "uuid";

export const actions = {
  editBookmark: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const bookTile = formData.get("bookTile") as string;
    const authors = formData.get("authors") as string;
    const dateOfCreation = formData.get("dateOfCreation") as string;
    const content = formData.get("content") as string;
    const like = Number(formData.get("like"));

    if (
      id === "" ||
      bookTile === "" ||
      authors === "" ||
      dateOfCreation === "" ||
      content === "" ||
      !Number.isFinite(like)
    )
      return fail(422, { error: "Invalid data" });

    const { error } = await supabase
      .from("bookmark_table")
      .update({
        bookTile,
        authors,
        dateOfCreation,
        content,
        like,
      })
      .eq("id", id);

    if (error) {
      return fail(422, { error: error.message });
    } else
      return {
        type: "success",
        status: 200,
        data: {
          message: "Edit successfully",
        },
      } as ActionResult;
  },
  insertBookmark: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (content.length === 0) return fail(422, { error: "Invalid data" });

    let entries = readKindleClipping(content);
    let parsedEntries = parseKindleEntries(entries);

    if (parsedEntries.length === 0) return fail(422, { error: "Invalid data" });

    const rows = parsedEntries.map((entry) => ({
      authors: entry.authors,
      bookTile: entry.bookTile,
      page: entry.page,
      location: entry.location,
      dateOfCreation: entry.dateOfCreation,
      content: entry.content,
      type: entry.type,
      id: uuidv7(),
    }));

    const { error } = await supabase.from("bookmark_table").insert(rows);
    if (error) return fail(422, { error: error.message });

    return {
      type: "success",
      status: 200,
      data: {
        message: `Insert successfully ${parsedEntries.length} highlights.`,
      },
    } as ActionResult;
  },
} satisfies Actions;
