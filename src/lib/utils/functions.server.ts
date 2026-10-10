import { SECRET_FIRECRAWL_KEY } from "$env/static/private";

const FIRECRAWL_MAX_AGE_MS = 1000 * 60 * 60 * 48;

export async function getHtml(pageurl: string): Promise<string> {
  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_FIRECRAWL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: pageurl,
      onlyMainContent: false,
      maxAge: FIRECRAWL_MAX_AGE_MS,
      parsers: ["pdf"],
      formats: ["html"],
    }),
  });

  if (response.status !== 200) {
    throw new Error(`Firecrawl responded with ${response.status}`);
  }

  const json = await response.json();
  const html = json?.data?.html;
  if (typeof html !== "string" || html.length === 0) {
    throw new Error(`Firecrawl returned no HTML for ${pageurl}`);
  }

  return html;
}
