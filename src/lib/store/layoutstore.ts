import { writable } from "svelte/store";
import type { LoginImageType } from "../types";

export const layoutImage = writable<LoginImageType | undefined>(undefined);
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");

export async function handleChangeLayoutImage() {
  const apiKey = "EAEQdLT0Wze4Lhf_Xn2O-IAuow2Z-Rh2sHIEu7pTXms";
  const keyword = "landscapes";
  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${keyword}&count=1&orientation=landscape&client_id=${apiKey}`
  );
  if (response.status == 200) {
    const data = await response.json();
    let result: LoginImageType = {
      title: "",
      hs1_title: data[0].alt_description,
      hs2_title: "",
      image_L: data[0].urls.raw,
      image_P: data[0].urls.raw,
      hash: data[0].blur_hash,
    };
    layoutImage.set(result);
  } else {
    const response = await fetch(`/server/getlayoutimage`);
    const data = await response.json();
    layoutImage.set(data);
  }
}
