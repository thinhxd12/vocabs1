import { writable } from "svelte/store";
import type { BookSearchType, DBSelect } from "../types";

export const bookmark = writable<DBSelect["bookmark_table"] | undefined>(
  undefined
);
export const bookInfo = writable<BookSearchType | undefined>(undefined);
