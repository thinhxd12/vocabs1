import { error } from "@sveltejs/kit";
import { load } from "cheerio";

export async function GET({ url }) {
  const link = url.searchParams.get("link");
  if (!link) error(404);

  try {
    let result = await getLives(link);
    if (!result) error(400, "not found");
    return new Response(JSON.stringify(result));
  } catch (e) {
    error(404);
  }
}

const getLives = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
    },
  });
  if (response.status !== 200) {
    return undefined;
  }
  const pageImgHtml = await response.text();
  const $ = load(pageImgHtml);

  let source = $("#streamIframe").attr("src");
  let streams: any = [];
  $(".stream-button").each((index, element) => {
    let name = $(element).text();
    let url = $(element).attr("data-embed-url");
    streams.push({ name, url });
  });

  return {
    source,
    streams,
  };
};
