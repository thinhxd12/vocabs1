import {
  error,
  fail,
  redirect,
  type ActionFailure,
  type ActionResult,
} from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/supabase";
import type { InsertVocab, SelectVocab } from "$lib/db/schema";
import { insertVocab } from "$lib/db/queries/insert";
import { updateVocabById } from "$lib/db/queries/update";

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
} satisfies Actions;
