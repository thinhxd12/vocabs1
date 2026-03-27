import { error } from "@sveltejs/kit";
import { load } from "cheerio";
import type { ArtImageType } from "$lib/types";
import { DEFAULT_CORS_PROXY } from "$lib/utils/constants";
import mainImage from "$lib/assets/images/main-image.webp";
import mainAuthor from "$lib/assets/images/main-author.webp";

let nextUrl = "https://www.getdailyart.com/en/24707/mykola-pymonenko/the-idyll";

const defaultArtImage: ArtImageType = {
  mainImage: mainImage,
  shareDate: "01 July 2023",
  title: "The Red Buoy, Saint-Tropez",
  attr: "Oil on canvas • 81 × 65 cm",
  authorImage: mainAuthor,
  author: "Paul Signac",
  authorYears: "1895",
  content:
    "<p>Hello July!</p> <p>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!</p> <p>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.</p> <p>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.</p> <p>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.</p> <p>P.S. Our sale is on! Save 20% on our <a href=\"https://shop.dailyartmagazine.com/product-category/prints/?utm_campaign=DailyArt-Prints&amp;utm_medium=text&amp;utm_source=DailyArtapp&amp;utm_term=fine-art-prints\">Prints Collection</a> and order a high-quality reproduction of the greatest masterpieces.&nbsp;</p>",
};

export async function GET({ url }) {
  try {
    const response = await fetch(DEFAULT_CORS_PROXY + nextUrl, {
      headers: {
        "cache-control": "no-cache",
      },
    });
    if (response.status !== 200) error(400, "not found");
    const pageImgHtml = await response.text();
    const $ = load(pageImgHtml);

    let mainImage = $(".main-image img")
      .attr("srcset")
      ?.trim()
      .replace(/\n/g, " ");
    const shareDate = $(".main-description__share-date").text().trim();
    const title = $(".main-description__title").text().trim();
    const attr = $(".main-description__attr").text().trim();
    const authorImage = $(".main-description__author img")
      .attr("src")
      ?.trim()
      .replace(/\n/g, " ");
    const author = $(".main-description__author").text().trim();
    const authorYears = $(".main-description__author-years").text().trim();
    const content = $(".main-description__text-content")
      .html()
      ?.trim()
      .replace(/\n/g, " ");

    const alsoItems = $(".also__item").toArray();
    const randomItem = alsoItems[Math.floor(Math.random() * alsoItems.length)];
    const nextImageUrl = $(randomItem).find("a").attr("href")?.trim();
    if (nextImageUrl) nextUrl = nextImageUrl;

    mainImage = mainImage?.split(" ")[0];

    const result: ArtImageType = {
      mainImage: mainImage || "",
      shareDate,
      title,
      attr,
      authorImage: authorImage || "",
      author,
      authorYears,
      content: content || "",
    };

    return new Response(JSON.stringify(result));
  } catch (e) {
    return new Response(JSON.stringify(defaultArtImage));
  }
}
