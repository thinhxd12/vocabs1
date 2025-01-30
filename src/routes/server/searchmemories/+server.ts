import { getMemoriesByWord } from "$lib/db/queries/select";
import { error } from "@sveltejs/kit";

export async function GET({ cookies, request, locals, setHeaders, url }) {
  let searchResult: { status: boolean; message: string };
  const word = url.searchParams.get("word");
  if (!word) error(404);

  try {
    searchResult = await getMemoriesByWord(word);
    return new Response(JSON.stringify(searchResult));
  } catch (e) {
    error(404);
  }
}
