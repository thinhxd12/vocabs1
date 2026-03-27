import type { ImageBackgroundType } from "$lib/types.js";
import { error } from "@sveltejs/kit";
import { load } from "cheerio";
import icescape from "$lib/assets/images/Icescape.jpg";

let index = "28991";

const defaultImage: ImageBackgroundType = {
  title: "Stunning Icelandic region of volcanoes, beaches, and glaciers.",
  url: icescape,
  place: "Snæfellsnes peninsula, Iceland",
};

export async function GET({ url }) {
  const startUrl = `https://windows10spotlight.com/images/${index}`;

  try {
    const response = await fetch(startUrl);
    if (response.status !== 200) error(400, "not found");
    const text = await response.text();
    const doc = load(text);
    const titleImg = doc("h1").text();
    const dateImg = doc(".date").text();
    const urlImg = doc(".entry").find("a").attr("href");

    const relatedItem = doc(".relatedthumb a").toArray();
    const randomItem =
      relatedItem[Math.floor(Math.random() * relatedItem.length)];
    const nextIndex = doc(randomItem).attr("href")?.split("/").pop();
    if (nextIndex) index = nextIndex;

    const image: ImageBackgroundType = {
      title: titleImg || "",
      url: urlImg || defaultImage.url,
      place: dateImg || "",
    };

    return new Response(JSON.stringify(image));
  } catch (e) {
    return new Response(JSON.stringify(defaultImage));
  }
}
