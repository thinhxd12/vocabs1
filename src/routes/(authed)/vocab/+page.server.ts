import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
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
} satisfies Actions;
