import { writable } from "svelte/store";
import type { LoginImageType } from "../types";

export const layoutImage = writable<LoginImageType | undefined>(undefined);
export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
