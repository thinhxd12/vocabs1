import { error } from "@sveltejs/kit";
import { load } from "cheerio";

export async function GET({ fetch }) {
  const endpoint = "https://allstream.cc";

  try {
    const response = await fetch(endpoint, {
      headers: {
        "cache-control": "no-cache",
      },
    });
    if (response.status !== 200) {
      error(400, "not found");
    }
    const pageImgHtml = await response.text();
    const $ = load(pageImgHtml);
    let results: any = [];
    $(".match-card").each((index, element) => {
      let name = $(element).find(".match-title").text();
      let url = $(element)
        .attr("onclick")
        ?.replace("location.href='", endpoint)
        .slice(0, -1);
      results.push({ name, url });
    });

    return new Response(JSON.stringify(results));
  } catch (error) {
    console.error("Error fetching Spotlight images:", error);
    return new Response(JSON.stringify([]));
  }
}
