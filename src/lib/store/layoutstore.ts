import { writable } from "svelte/store";
import type { BackgroundImageType } from "../types";

export const layoutImage = writable<BackgroundImageType | undefined>(undefined);
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");

export async function handleChangeLayoutImage() {
  const response = await fetch(`/server/getlayoutimage`);
  const data = await response.json();
  layoutImage.set(data);
}
