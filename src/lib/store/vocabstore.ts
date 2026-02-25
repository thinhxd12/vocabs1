import { writable } from "svelte/store";
import type { VocabType, VocabularySearchType } from "../types";

export const renderWord = writable<VocabType | undefined>(undefined);
export const editWord = writable<VocabType | undefined>(undefined);
export const searchTerm = writable<string>("");
export const searchResults = writable<VocabularySearchType[]>([]);
export const showTranslate = writable<boolean>(false);
export const showEdit = writable<boolean>(false);
