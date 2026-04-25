import type { WikiTranslationType } from "$lib/types";
import { error } from "@sveltejs/kit";
import { load } from "cheerio";

async function fetchGetText(url: string) {
  try {
    let response = await fetch(url, {
      headers: {
        "cache-control": "no-cache",
      },
    });
    let text = await response.text();
    return text;
  } catch (error) {
    return "";
  }
}

export async function GET({ url }) {
  const word = url.searchParams.get("word");
  if (!word) error(404);

  try {
    const urlWiki = `https://vi.wiktionary.org/w/rest.php/v1/page/${word}/html`;

    const html = await fetchGetText(urlWiki);
    const $ = load(html);
    let result: WikiTranslationType[] = [];
    $("section").each((index, element) => {
      const partOfSpeech = $(element).find("h3").text();
      const translation = $(element)
        .find("h3 ~ ol li")
        .map((i, el) => $(el).text())
        .get();
      if (partOfSpeech && translation.length)
        result.push({ partOfSpeech, translation });
    });

    result = Object.values(
      result.slice(1).reduce((acc: any, current: any) => {
        const existing = acc[current.partOfSpeech];

        if (existing) {
          acc[current.partOfSpeech] = {
            ...existing,
            ...current,
            translation: [
              ...(existing.translation || []),
              ...(current.translation || []),
            ],
          };
        } else {
          acc[current.partOfSpeech] = current;
        }

        return acc;
      }, {}),
    );

    return new Response(JSON.stringify(result));
  } catch (error) {
    console.error(error);
  }
}
