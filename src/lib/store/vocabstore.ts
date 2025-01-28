import type { SelectVocab } from "$lib/db/schema";
import { writable } from "svelte/store";
import type { VocabularySearchType } from "../../types";

const item = {
  id: "0194071f-90f8-75d6-85e1-a3a17c972910",
  word: "sham",
  phonetics: "ˈsham",
  number: 144,
  audio:
    "https://www.oxfordlearnersdictionaries.com/media/american_english/us_pron/s/sha/sham_/sham__us_1.mp3",
  meanings: [
    {
      partOfSpeech: "noun",
      definitions: [
        {
          definition: [
            {
              num: "",
              sense: ": a trick that deludes : hoax",
              letter: "",
            },
          ],
          example: {
            year: "28 July 2024",
            title: "Peoplemag",
            author: "Maggie Horton",
            sentence:
              "Complete the set with matching linen sheets, pillowcases, and <b>shams</b>, also on sale for an additional 20 percent off now.",
          },
          hash: "",
          image:
            "https://media.gettyimages.com/id/159307508/photo/job-interview.jpg?s=612x612&w=0&k=20&c=srvyVlB-9SUlIVuKpucAM0okoO5kdKJHDO7lpGtKjFM=",
        },
      ],
      synonyms: ["caricature", "cartoon", "farce"],
      translation: ["giả mạo", "adfasdf asdf"],
    },
    {
      partOfSpeech: "verb",
      definitions: [
        {
          definition: [
            {
              num: "",
              sense:
                ": to go through the external motions necessary to counterfeit",
              letter: "",
            },
          ],
          example: {
            year: "1 Aug. 2024",
            title: "Los Angeles Times",
            author: "Nathan Solis",
            sentence:
              "The <em>sham</em> citations claimed that residents had not moved their vehicles for scheduled street sweeping, which immediately raised red flags for those familiar with the local parking schedule.",
          },
          hash: "",
          image: "",
        },
      ],
      synonyms: ["act", "affect", "assume"],
      translation: ["giả mạo"],
    },
  ],
};

export const renderWord = writable<SelectVocab | undefined>(undefined);
export const searchTerm = writable<string>("");
export const searchResults = writable<VocabularySearchType[]>([]);
