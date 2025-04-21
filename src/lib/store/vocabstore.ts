import { writable } from "svelte/store";
import type { DBSelect, VocabType, VocabularySearchType } from "../types";

export const renderWord = writable<VocabType | undefined>(undefined);
export const editWord = writable<VocabType | undefined>(undefined);
export const searchTerm = writable<string>("");
export const searchResults = writable<VocabularySearchType[]>([]);
export const modal = writable<any>(null);
export const showTranslate = writable<boolean>(false);
export const showEdit = writable<boolean>(false);
export const cachedProgressLength = writable<number | null>(null);
export const cachedDiary = writable<DBSelect["diary_table"][] | null>(null);
