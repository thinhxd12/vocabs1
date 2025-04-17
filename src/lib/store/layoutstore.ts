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
    // -------------Bing-----------------
    // const url =
    //   "https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=en-IN";
    // const response = await fetch(url, {
    //   headers: { "User-Agent": "Mozilla/5.0" },
    // });
    // const data = await response.json();
    // layoutImage.set(data);
    // -------------Bing-----------------

    const endpoint = "https://arc.msn.com/v3/Delivery/Placement";
    const params = new URLSearchParams({
      pid: "338380",
      fmt: "json",
      cdm: "1",
      ctry: "US",
    });
    const url =
      "https://arc.msn.com/v3/Delivery/Placement?&pid=338380&fmt=json&cdm=1&ctry=US&bcnt=1";
    const response = await fetch(`${endpoint}?&${params}`);

    if (!response.ok) throw new Error("Failed to fetch images");
    const data = await response.json();
    const item = JSON.parse(data.batchrsp.items[0].item).ad;
    const image: BingImageType = {
      start_date: "",
      end_date: "",
      url: item.image_fullscreen_001_landscape.u,
      copyright: item.title_text?.tx,
      copyright_link: item.title_text?.tx,
    };
    layoutImage.set(image);
  }
}
