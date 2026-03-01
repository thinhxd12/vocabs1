import { writable } from "svelte/store";

export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");

export const currentMode = writable<"focus" | "shortbreak" | "longbreak">(
  "focus",
);
export const currentInterval = writable<number>(1);
export const secondsRemaining = writable<number>(7 * 60);
export const focusMinutes = writable<number>(7);
export const shortbreakMinutes = writable<number>(2);
export const longbreakMinutes = writable<number>(15);
export const intervals = writable<number>(3);
