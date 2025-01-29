import { writable } from "svelte/store";

export const isAutoPlay = writable<boolean>(false);
export const totalMemories = writable<number>(0);
