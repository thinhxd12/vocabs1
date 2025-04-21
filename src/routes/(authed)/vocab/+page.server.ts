import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
import {
  parseKindleEntries,
  readKindleClipping,
} from "@darylserrano/kindle-clippings";
import { v7 as uuidv7 } from "uuid";
import type { DBInsert, VocabMeaningType } from "$lib/types";

function makeTranslationText(arr: VocabMeaningType[]) {
  return arr
    .map((item) => {
      return item.translation.join("");
    })
    .join("") as string;
}

export const actions = {
  insertNewVocab: async ({ cookies, request, locals: { supabase } }) => {
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

    const translation = makeTranslationText(JSON.parse(meanings));
    if (translation.length == 0) return fail(422, { error: "Invalid data" });

    const insertWord: DBInsert["vocab_table"] = {
      id: uuidv7(),
      word: word,
      audio: audio,
      phonetics: phonetics,
      meanings: JSON.parse(meanings),
    };

    const { error } = await supabase.from("vocab_table").insert(insertWord);

    if (error) {
      return fail(422, { error: error.message });
    } else {
      return {
        type: "success",
        status: 200,
        data: {
          message: "Vocab inserted successfully",
        },
      } as ActionResult;
    }
  },
  editVocab: async ({ cookies, request, locals: { supabase } }) => {
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

    const { error } = await supabase
      .from("vocab_table")
      .update({
        word: word,
        audio: audio,
        phonetics: phonetics,
        number: Number(number),
        meanings: JSON.parse(meanings),
      })
      .eq("id", id);

    if (error) {
      return fail(422, { error: error.data.message });
    } else {
      return {
        type: "success",
        status: 200,
        data: {
          message: "Edit successfully",
        },
      } as ActionResult;
    }
  },

  editBookmark: async ({ cookies, request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const content = formData.get("content") as string;

    if (id.length === 0 || content.length === 0)
      return fail(422, { error: "Invalid data" });

    const { error } = await supabase
      .from("bookmark_table")
      .update({ content: content })
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
        message: "Insert successfully",
      },
    } as ActionResult;
  },
} satisfies Actions;
