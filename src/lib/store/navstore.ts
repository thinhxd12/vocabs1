import type {
  SelectSchedule,
  SelectVocab,
  SelectWeather,
} from "$lib/db/schema";
import { writable } from "svelte/store";

export const isAutoPlay = writable<boolean>(false);
export const totalMemories = writable<number>(0);
export const todaySchedule = writable<
  | {
      start: SelectSchedule;
      end: SelectSchedule;
    }
  | undefined
>(undefined);
export const locationList = writable<SelectWeather[]>([]);
export const listContent = writable<SelectVocab[]>([]);
export const currentSchedule = writable<SelectSchedule | undefined>(undefined);
export const listCount = writable<number>(0);
export const quizCount = writable<number>(0);
export const quizRender = writable<SelectVocab | undefined>(undefined);
