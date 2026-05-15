import { SCRAPER_SECRET_KEY } from "$env/static/private";
import type { WikiTranslationType } from "$lib/types";
import { SCRAPER_API_URL } from "$lib/utils/constants";
import { error } from "@sveltejs/kit";
import { load } from "cheerio";

async function fetchGetText(url: string) {
  try {
    let response = await fetch(url, {
      headers: {
        "cache-control": "no-cache",
      },
    });
    let html = await response.text();
    if (html.includes("Wikimedia Error")) {
      throw new Error();
    }
    return html;
  } catch (error) {
    console.error(error);
  }
}

async function getHtmlMethod(pageurl: string) {
  try {
    const response = await fetch(`${SCRAPER_API_URL}/crawl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Scraper-Key": SCRAPER_SECRET_KEY,
      },
      body: JSON.stringify({ url: pageurl }),
    });
    const data = await response.json();
    if (data.success) {
      return data.html;
    } else throw new Error();
  } catch (error) {
    console.error(error);
  }
}

export async function GET({ url }) {
  const word = url.searchParams.get("word");
  if (!word) error(404);
  const urlWiki = `https://vi.wiktionary.org/w/rest.php/v1/page/${word}/html`;

  try {
    const html = await Promise.any([
      fetchGetText(urlWiki),
      getHtmlMethod(urlWiki),
    ]);
    let result: WikiTranslationType[] = [];
    const $ = load(html);
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
    return new Response(JSON.stringify([]));
  }
}
