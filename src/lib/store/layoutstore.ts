import { get, writable } from "svelte/store";
import type { BingImageType } from "../types";

export const layoutImage = writable<BingImageType | undefined>(undefined);
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");

export async function handleChangeLayoutImage() {
  const url =
    "https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=en-IN";

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();
    layoutImage.set(data);
  } catch (error) {
    const apiKey = "EAEQdLT0Wze4Lhf_Xn2O-IAuow2Z-Rh2sHIEu7pTXms";
    const keyword = "beautiful";
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=${keyword}&count=1&orientation=landscape`,
      {
        headers: {
          "Accept-Version": "v1",
        },
      }
    );
    if (response.status == 200) {
      const data = await response.json();
      const image: BingImageType = {
        start_date: "",
        end_date: "",
        url: data[0].urls.raw,
        copyright: data[0].alt_description,
        copyright_link: "",
      };
      layoutImage.set(image);
    }
  }
}
