import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/supabase";
import type { InsertVocab } from "$lib/db/schema";
import { insertVocab } from "$lib/db/queries/insert";

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
      return fail(422, {
        error: "Invalid data",
      });

    const insertWord: InsertVocab = {
      word: word,
      audio: audio,
      phonetics: phonetics,
      meanings: JSON.parse(meanings),
    };

    const result = await insertVocab(insertWord);
    if (result.status) {
      return {
        status: 200,
        body: {
          message: "Vocab inserted successfully",
        },
      };
    } else {
      return fail(423, {
        error: result.data.message,
      });
    }

    // const email = import.meta.env.VITE_LOGIN_EMAIL;
    // const password = formData.get("password") as string;

    // if (password.length < 6) {
    //   return fail(422, {
    //     error: "Passwords must be at least 6 characters long",
    //   });
    // }

    // const { error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // if (error) {
    //   return fail(422, {
    //     error: error.message,
    //   });
    // } else {
    //   cookies.set("logged_in", "true", { path: "/" });
    //   throw redirect(303, "/vocab");
    // }
  },
  //   logout: async ({ cookies }) => {
  //     const { error } = await supabase.auth.signOut();
  //     cookies.delete("logged_in", { path: "/" });
  //     throw redirect(303, "/");
  //   },
} satisfies Actions;
