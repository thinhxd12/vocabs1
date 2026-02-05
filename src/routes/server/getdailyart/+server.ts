import { error } from "@sveltejs/kit";
import { load } from "cheerio";
import type { ArtImageType } from "$lib/types";
import { DEFAULT_CORS_PROXY } from "$lib/utils/constants";

export async function GET({ url }) {
  const link = url.searchParams.get("link");
  if (!link) error(404);

  try {
    let result = await getImageData(link);
    if (!result) error(400, "not found");
    return new Response(JSON.stringify(result));
  } catch (e) {
    error(404);
  }
}

const getImageData = async (url: string) => {
  const response = await fetch(DEFAULT_CORS_PROXY + url, {
    headers: {
      "cache-control": "no-cache",
    },
  });
  if (response.status !== 200) {
    return undefined;
  }
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

  mainImage = mainImage?.split(" ")[0];
  const result = {
    mainImage,
    shareDate,
    title,
    attr,
    authorImage,
    author,
    authorYears,
    content,
    nextImageUrl,
  };
  return result as ArtImageType;
};
