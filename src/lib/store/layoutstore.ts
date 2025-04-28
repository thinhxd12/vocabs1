import { writable } from "svelte/store";
import type { BingImageType } from "../types";

export const layoutImage = writable<BingImageType>({
  start_date: "",
  end_date: "",
  url: "https://res.public.onecdn.static.microsoft/creativeservice/e19cb8ed-daf4-5da4-eb99-71650274e625_desktop-b018_ds_dalatlandscape_gettyimages-2150523963_3840x2160.jpg",
  copyright: "Stadt der vier Jahreszeiten",
  copyright_link: "",
});
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");

export async function handleChangeLayoutImage() {
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
}
