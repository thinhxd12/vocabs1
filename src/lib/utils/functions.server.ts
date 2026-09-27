import { SCRAPER_API_URL } from "$lib/utils/constants";
import { SECRET_FIRECRAWL_KEY, SECRET_SCRAPER_KEY } from "$env/static/private";

export async function getHtmlMethod1(pageurl: string) {
  const response = await fetch(`${SCRAPER_API_URL}/crawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Scraper-Key": SECRET_SCRAPER_KEY,
    },
    body: JSON.stringify({ url: pageurl }),
  });
  const data = await response.json();
  if (data.success) {
    return data.html;
  } else throw new Error();
}

export async function getHtmlMethod2(pageurl: string) {
  const url = "https://api.firecrawl.dev/v2/scrape";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_FIRECRAWL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: pageurl,
      onlyMainContent: false,
      maxAge: 172800000,
      parsers: ["pdf"],
      formats: ["html"],
    }),
  };
  const response = await fetch(url, options);
  if (response.status === 200) {
    const json = await response.json();
    const html = json.data.html;
    return html;
  } else throw new Error();
}
