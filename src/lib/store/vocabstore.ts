import type { SelectVocab } from "$lib/db/schema";
import { writable } from "svelte/store";
import type { VocabularySearchType } from "../types";

export const renderWord = writable<SelectVocab | undefined>(undefined);
export const editWord = writable<SelectVocab | undefined>(undefined);
export const searchTerm = writable<string>("");
export const searchResults = writable<VocabularySearchType[]>([]);
export const modal = writable<any>(null);
export const showTranslate = writable<boolean>(false);
export const showEdit = writable<boolean>(false);
