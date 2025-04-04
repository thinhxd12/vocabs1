import { writable } from "svelte/store";
import type { BingImageType } from "../types";

export const layoutImage = writable<BingImageType | undefined>(undefined);
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");

export async function handleChangeLayoutImage() {
  try {
    const response = await fetch(`/server/getlayoutimage`);
    if (!response.ok) throw new Error("Failed to fetch images");
    const data = await response.json();
    const image: BingImageType = {
      start_date: "",
      end_date: "",
      url: data.landscapeImageUrl,
      copyright: data.title,
      copyright_link: data.copyright,
    };
    layoutImage.set(image);
  } catch (error) {
    const url =
      "https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=en-IN";
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();
    layoutImage.set(data);
  }
}
