import { writable } from "svelte/store";

export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");
export const currentState = writable<"focus" | "rest">("focus");
export const completedPomodoros = writable<number>(0);
export const countPomodoros = writable<number>(0);
