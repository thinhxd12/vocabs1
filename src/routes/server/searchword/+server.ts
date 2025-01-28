import { getVocabByWord } from "$lib/db/queries/select";
import type { SelectVocab } from "$lib/db/schema";
import { error } from "@sveltejs/kit";

export async function GET({ cookies, request, locals, setHeaders, url }) {
  let searchResult: {
    id: SelectVocab["id"];
    word: SelectVocab["word"];
  }[] = [];
  const word = url.searchParams.get("word");
  if (!word) return new Response(JSON.stringify([]));

  try {
    searchResult = await getVocabByWord(word);
    return new Response(JSON.stringify(searchResult));
  } catch (e) {
    error(404);
  }
}
