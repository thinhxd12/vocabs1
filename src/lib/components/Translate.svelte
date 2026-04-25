<script lang="ts">
  import { enhance } from "$app/forms";
  import { showTranslate } from "$lib/store/vocabstore";
  import { addToast } from "$lib/store/layoutstore";
  import type {
    DBInsert,
    VocabMeaningType,
    WikiTranslationType,
  } from "$lib/types";
  import { autofocus, getTranslationArr } from "$lib/utils/functions";
  import Definition from "./Definition.svelte";
  import { v7 as uuidv7 } from "uuid";
  import { page } from "$app/state";
  import { format } from "date-fns";
  import SolarMagniferLinear from "~icons/solar/magnifer-linear";

  let translations = $state<WikiTranslationType[]>([]);
  let translateWord = $state<DBInsert["vocab_table"]>({
    id: uuidv7(),
    word: "",
    audio: "",
    phonetics: "",
    meanings: [],
  });
  let meaningsText = $state<string>();
  let translationText = $state<string>();

  async function getTranslateData(text: string) {
    // const url = `https://vocabs3.vercel.app/trans?text=${text}&from=auto&to=vi`;
    const url = `/server/getwiktionary?word=${text}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data) {
      translations = data;
    }
  }

  async function getTextDataWebster(text: string) {
    const response = await fetch(`/server/getwebster?word=${text}`);
    if (response.status === 200) {
      const data = await response.json();
      if (data) return data as DBInsert["vocab_table"];
    } else {
      addToast({
        type: "error",
        title: "Error!",
        message: "Can't find this word.",
      });
    }
  }

  async function handleGetTranslateWord(word: string) {
    const { data: dataMemories } = await page.data.supabase
      .from("memories_table")
      .select("word,created_at")
      .eq("word", word.toLowerCase());

    if (dataMemories.length)
      addToast({
        type: "error",
        title: `Memorized <b>"${dataMemories[0].word}"</b>!`,
        message: `${format(dataMemories[0].created_at, "cccc, yyyy-MM-dd' at 'p")}.`,
      });

    const { data: dataVocab } = await page.data.supabase
      .from("vocab_table")
      .select("*")
      .eq("word", word.toLowerCase())
      .limit(1);

    if (dataVocab.length)
      addToast({
        type: "error",
        title: "Error!",
        message: `There is a word <b>"${dataVocab[0].word}"</b> exist.`,
      });

    const data = await Promise.all([
      getTextDataWebster(word.toLowerCase()),
      getTranslateData(word.toLowerCase()),
    ]);
    if (data[0]) {
      translateWord = data[0];
      meaningsText = JSON.stringify(translateWord.meanings, null, "     ");
      translationText = makeTranslationText(translateWord.meanings);
    }
  }

  function makeTranslationText(arr: VocabMeaningType[]) {
    return arr
      .map((item) => {
        let part = item.partOfSpeech;
        let mean = item.translation.join("-");
        return " -" + part + "-" + mean;
      })
      .join("") as string;
  }

  const handleChangeTranslationTranslate = (str: string) => {
    const arr = getTranslationArr(str);
    if (!arr) return;
    translateWord.meanings = translateWord.meanings.map((item, index) => {
      return {
        ...item,
        translation:
          arr.find((el) => el?.partOfSpeech === item.partOfSpeech)
            ?.translations || [],
      };
    });
    meaningsText = JSON.stringify(translateWord.meanings, null, "     ");
  };

  function handleChangeTranslationMeanings(str: string) {
    translateWord.meanings = JSON.parse(str);
    translationText = makeTranslationText(translateWord.meanings);
  }
</script>

<div
  class="w-main h-[calc(100vh-44px)] overflow-y-scroll no-scrollbar flex flex-col gap-2"
>
  <form
    name="insertvocab"
    action="?/insertNewVocab"
    method="post"
    class="w-full dark"
    use:enhance={({ formElement, formData, action, cancel }) => {
      return async ({ result }) => {
        if (result.type === "failure") {
          addToast({
            type: "error",
            title: "Error!",
            message: result.data?.error as string,
          });
        } else if (result.type === "success") {
          addToast({
            type: "success",
            title: "Success!",
            message: "Add word successfully.",
          });
        }
      };
    }}
  >
    <div
      class="w-full h-36 mb-3 relative bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]"
    >
      <input
        name="word"
        autocomplete="off"
        type="text"
        use:autofocus
        onkeydown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            handleGetTranslateWord(e.currentTarget.value);
          }
        }}
        bind:value={translateWord.word}
        class="absolute left-0 top-0 h-full w-full bg-transparent px-9 text-center font-constantine text-18 font-700 uppercase leading-30 outline-none"
      />
      <button
        type="button"
        onclick={(e) => {
          e.stopPropagation();
          handleGetTranslateWord(translateWord.word);
        }}
        class="size-36 text-white/30 hover:text-white transition duration-100 absolute top-0 right-0 flex justify-center items-center"
      >
        <SolarMagniferLinear width="16" height="16" />
      </button>
    </div>

    <input
      class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 outline-none"
      name="audio"
      autocomplete="off"
      onkeydown={(e) => e.stopPropagation()}
      bind:value={translateWord.audio}
    />

    <input
      class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 outline-none"
      name="phonetics"
      autocomplete="off"
      onkeydown={(e) => e.stopPropagation()}
      bind:value={translateWord.phonetics}
    />

    <textarea
      class="w-full golden my-scrollbar cursor-auto border-0 bg-transparent p-6 text-12 font-400 leading-15 outline-none border-b border-white/30"
      name="meanings"
      autocomplete="off"
      onkeydown={(e) => e.stopPropagation()}
      rows="12"
      bind:value={meaningsText}
      onchange={(e) => {
        e.preventDefault();
        handleChangeTranslationMeanings(e.currentTarget.value);
      }}
    ></textarea>

    <div
      class="w-full max-h-150 my-scrollbar overflow-y-auto p-6 flex flex-col min-h-30 mb-3 border-0 border-b border-white/30"
    >
      {#each translations as item}
        <div class="w-full flex flex-col mb-6">
          <h3 class="text-14 font-600 leading-18 mb-3">{item.partOfSpeech}</h3>
          {#each item.translation as el}
            <p class="text-12 leading-15 indent-12">{el}</p>
          {/each}
        </div>
      {/each}
    </div>

    <input
      class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 outline-none"
      name="meaning"
      autocomplete="off"
      onkeydown={(e) => e.stopPropagation()}
      bind:value={translationText}
      onchange={(e) => {
        e.preventDefault();
        handleChangeTranslationTranslate(e.currentTarget.value);
      }}
    />

    <div class="w-full flex items-center justify-center gap-24 pt-3 pb-5">
      <button
        type="button"
        onclick={() => ($showTranslate = false)}
        class="rounded-3 min-w-60 text-center text-13 shadow font-400 leading-18 bg-white/15 transition hover:bg-white/10 py-3 px-6"
      >
        Close
      </button>
      <button
        type="submit"
        class="rounded-3 min-w-60 text-center text-13 shadow font-400 leading-18 bg-white/15 transition hover:bg-white/10 py-3 px-6"
      >
        Submit
      </button>
    </div>
  </form>

  <div class="w-full flex flex-col gap-2">
    <Definition item={translateWord} />
  </div>
</div>
