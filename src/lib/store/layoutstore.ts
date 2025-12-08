import { writable } from "svelte/store";

export const showLayout = writable<boolean>(false);
export const showBookmark = writable<boolean>(true);
export const timerString = writable<string>("");
export const currentState = writable<"focus" | "rest">("focus");
export const completedPomodoros = writable<number>(0);
export const countPomodoros = writable<number>(0);
export const pomodoro = writable<number>(7);
export const shortBreak = writable<number>(2);
export const longBreak = writable<number>(15);
export const longBreakInterval = writable<number>(3);
