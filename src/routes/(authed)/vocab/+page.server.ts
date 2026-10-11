import { fail, type ActionResult } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { v7 as uuidv7 } from "uuid";
import type { DBInsert, VocabMeaningType } from "$lib/types";

function makeTranslationText(arr: VocabMeaningType[]) {
  return arr.map((item) => item.translation.join("")).join("");
}

export const actions = {
  insertNewVocab: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const word = formData.get("word") as string;
    const audio = formData.get("audio") as string;
    const phonetics = formData.get("phonetics") as string;
    const meanings = formData.get("meanings") as string;

    const parsedMeanings = JSON.parse(meanings) as VocabMeaningType[];

    if (
      word === "" ||
      audio === "" ||
      phonetics === "" ||
      parsedMeanings.length === 0 ||
      makeTranslationText(parsedMeanings) === ""
    ) {
      return fail(422, { error: "Invalid data" });
    }

    const insertWord: DBInsert["vocab_table"] = {
      id: uuidv7(),
      word,
      audio,
      phonetics,
      meanings: parsedMeanings,
    };

    const { error } = await supabase.from("vocab_table").insert(insertWord);

    if (error) {
      return fail(422, { error: error.message });
    }
    return {
      type: "success",
      status: 200,
      data: {
        message: "Vocab inserted successfully",
      },
    } as ActionResult;
  },
  editVocab: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const word = formData.get("word") as string;
    const audio = formData.get("audio") as string;
    const phonetics = formData.get("phonetics") as string;
    const meanings = formData.get("meanings") as string;
    const number = formData.get("number") as string;
    const id = formData.get("id") as string;

    const parsedMeanings = JSON.parse(meanings) as VocabMeaningType[];

    if (
      parsedMeanings.length === 0 ||
      word === "" ||
      audio === "" ||
      phonetics === ""
    ) {
      return fail(422, { error: "Invalid data" });
    }

    const { error } = await supabase
      .from("vocab_table")
      .update({
        word,
        audio,
        phonetics,
        number: Number(number),
        meanings: parsedMeanings,
      })
      .eq("id", id);

    if (error) {
      return fail(422, { error: error.message });
    }
    return {
      type: "success",
      status: 200,
      data: {
        message: "Edit successfully",
      },
    } as ActionResult;
  },
} satisfies Actions;
