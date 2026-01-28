import { writable } from "svelte/store";
import type { BookDetailType, DBSelect } from "../types";

export const bookmark = writable<DBSelect["bookmark_table"] | undefined>(
  undefined,
);
export const bookInfo = writable<BookDetailType | undefined>(undefined);
