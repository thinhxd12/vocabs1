import { writable } from "svelte/store";
import type { LoginImageType } from "../types";

export const layoutImage = writable<LoginImageType | undefined>(undefined);
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);

export async function handleChangeLayoutImage() {
  const response = await fetch(`/server/getlayoutimage`);
  const data = await response.json();
  layoutImage.set(data);
}
