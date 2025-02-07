import {
  error,
  fail,
  redirect,
  type ActionFailure,
  type ActionResult,
} from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/supabase";
import type { InsertBookmark, InsertVocab, SelectVocab } from "$lib/db/schema";
import { insertBookmark, insertVocab } from "$lib/db/queries/insert";
import {
  updateBookmarkContentById,
  updateVocabById,
} from "$lib/db/queries/update";
import {
  parseKindleEntries,
  readKindleClipping,
} from "@darylserrano/kindle-clippings";

export const actions = {
  insertNewVocab: async ({ cookies, request }) => {
    const formData = await request.formData();
    const word = formData.get("word") as string;
    const audio = formData.get("audio") as string;
    const phonetics = formData.get("phonetics") as string;
    const meanings = formData.get("meanings") as string;
    if (
      JSON.parse(meanings).length === 0 ||
      word === "" ||
      audio === "" ||
      phonetics === ""
    )
      return fail(422, { error: "Invalid data" });

    const insertWord: InsertVocab = {
      word: word,
      audio: audio,
      phonetics: phonetics,
      meanings: JSON.parse(meanings),
    };

    const result = await insertVocab(insertWord);
    if (result.status) {
      return {
        type: "success",
        status: 200,
        data: {
          message: "Vocab inserted successfully",
        },
      } as ActionResult;
    } else {
      return fail(422, { error: result.data.message });
    }
  },
  editVocab: async ({ cookies, request }) => {
    const formData = await request.formData();
    const word = formData.get("word") as string;
    const audio = formData.get("audio") as string;
    const phonetics = formData.get("phonetics") as string;
    const meanings = formData.get("meanings") as string;
    const number = formData.get("number") as string;
    const id = formData.get("id") as string;

    if (
      JSON.parse(meanings).length === 0 ||
      word === "" ||
      audio === "" ||
      phonetics === ""
    )
      return fail(422, { error: "Invalid data" });

    const editedWord: SelectVocab = {
      word: word,
      audio: audio,
      phonetics: phonetics,
      meanings: JSON.parse(meanings),
      number: Number(number),
      id: id,
    };

    const result = await updateVocabById(editedWord);
    if (result.status) {
      return {
        type: "success",
        status: 200,
        data: {
          message: "Edit successfully",
        },
      } as ActionResult;
    } else {
      return fail(422, { error: result.data.message });
    }
  },

  editBookmark: async ({ cookies, request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const content = formData.get("content") as string;

    if (id.length === 0 || content.length === 0)
      return fail(422, { error: "Invalid data" });

    const result = await updateBookmarkContentById(id, content);
    if (result.status) {
      return {
        type: "success",
        status: 200,
        data: {
          message: "Edit successfully",
        },
      } as ActionResult;
    } else {
      return fail(422, { error: result.data.message });
    }
  },
  insertBookmark: async ({ cookies, request }) => {
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (content.length === 0) return fail(422, { error: "Invalid data" });

    let entries = readKindleClipping(content);
    let parsedEntries = parseKindleEntries(entries);

    for (let i = 0; i < parsedEntries.length; i++) {
      const row: InsertBookmark = {
        authors: parsedEntries[i].authors,
        bookTile: parsedEntries[i].bookTile,
        page: parsedEntries[i].page,
        location: parsedEntries[i].location,
        dateOfCreation: parsedEntries[i].dateOfCreation,
        content: parsedEntries[i].content,
        type: parsedEntries[i].type,
      };
      const res = await insertBookmark(row);
      if (res) return fail(422, { error: "Error" });
    }

    return {
      type: "success",
      status: 200,
      data: {
        message: "Insert successfully",
      },
    } as ActionResult;
  },
} satisfies Actions;
