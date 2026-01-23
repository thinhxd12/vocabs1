import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
  parseKindleEntries,
  readKindleClipping,
} from "@darylserrano/kindle-clippings";
import { v7 as uuidv7 } from "uuid";

export const actions = {
  editBookmark: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const bookTile = formData.get("bookTile") as string;
    const authors = formData.get("authors") as string;
    const dateOfCreation = formData.get("dateOfCreation") as string;
    const content = formData.get("content") as string;
    const like = formData.get("like") as string;

    if (
      id === "" ||
      bookTile === "" ||
      authors === "" ||
      dateOfCreation === "" ||
      content === ""
    )
      return fail(422, { error: "Invalid data" });

    const { error } = await supabase
      .from("bookmark_table")
      .update({
        bookTile,
        authors,
        dateOfCreation,
        content,
        like: Number(like),
      })
      .eq("id", id);

    if (error) {
      return fail(422, { error: error.data.message });
    } else
      return {
        type: "success",
        status: 200,
        data: {
          message: "Edit successfully",
        },
      } as ActionResult;
  },
  insertBookmark: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (content.length === 0) return fail(422, { error: "Invalid data" });

    let entries = readKindleClipping(content);
    let parsedEntries = parseKindleEntries(entries);

    if (parsedEntries.length === 0) return fail(422, { error: "Invalid data" });

    for (let i = 0; i < parsedEntries.length; i++) {
      const row = {
        authors: parsedEntries[i].authors,
        bookTile: parsedEntries[i].bookTile,
        page: parsedEntries[i].page,
        location: parsedEntries[i].location,
        dateOfCreation: parsedEntries[i].dateOfCreation,
        content: parsedEntries[i].content,
        type: parsedEntries[i].type,
        id: uuidv7(),
      };

      const { error } = await supabase.from("bookmark_table").insert(row);
      if (error) throw fail(422, { error: "Error" });
    }

    return {
      type: "success",
      status: 200,
      data: {
        message: `Insert successfully ${parsedEntries.length} highlights.`,
      },
    } as ActionResult;
  },
} satisfies Actions;
