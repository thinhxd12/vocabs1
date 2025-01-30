<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import type { InsertVocab } from "$lib/db/schema";
  import { showLayout } from "$lib/store/layoutstore";
  import { showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { Dialog } from "bits-ui";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Toaster, toast } from "svelte-sonner";
  import type { TranslateType, VocabMeaningType } from "$lib/types";
  import { getTranslationArr } from "$lib/functions";
  import Definition from "./Definition.svelte";

  let { formResult } = $props();
  let translateWord = $state<InsertVocab>({
    word: "",
    audio: "",
    phonetics: "",
    meanings: [],
  });
  let meaningsText = $state<string>();
  let translationText = $state<string>();

  async function getTranslateData(text: string) {
    const url = `https://mywebapp.abcworker.workers.dev/https://vocabs3.vercel.app/trans?text=${text}&from=auto&to=vi`;
    const response = await fetch(url);
    const data = await response.json();
    if (data) return data as TranslateType;
  }

  async function getTextDataWebster(text: string) {
    const response = await fetch(`/server/getwebster?word=${text}`);
    const data = await response.json();
    if (data) return data as InsertVocab;
  }

  async function handleGetTranslateWord() {
    const response = await fetch(
      `/server/searchmemories?word=${translateWord.word}`
    );
    const result = await response.json();
    if (result.status) toast.error(result.message);
    const data = await Promise.all([
      getTextDataWebster(translateWord.word),
      getTranslateData(translateWord.word),
    ]);

    translateWord = {
      ...data[0]!,
      meanings: data[0]!.meanings.map((item, index) => {
        if (index === 0)
          item.translation = [data[1]?.translation.toLowerCase() || ""];
        return {
          ...item,
        };
      }),
    };
    meaningsText = JSON.stringify(translateWord.meanings, null, "     ");
    translationText = makeTranslationText(translateWord.meanings);
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

<Dialog.Root bind:open={$showTranslate} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 50 }}
      class="fixed inset-0 z-50 bg-black/30"
    />
    <Dialog.Content
      class="fixed top-0 {$showLayout
        ? 'right-0 -translate-x-12'
        : 'left-[50%] -translate-x-[calc(50%+15px)]'} outline-none z-50 layout-light mt-[48px] h-[calc(100vh-96px)] overflow-y-scroll no-scrollbar rounded-6 p-6 w-content"
    >
      <form
        action="?/insertNewVocab"
        method="post"
        class="w-full mb-6"
        use:enhance={({ formElement, formData, action, cancel }) => {
          return async ({ result }) => {
            if (result.status === 422) {
              toast.error("Invalid data");
            } else if (result.status === 423) {
              toast.error(formResult.error);
            } else {
              toast.success("Vocab inserted successfully");
            }
          };
        }}
      >
        <div
          class="w-[330px] mx-auto h-30 relative rounded-full bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]"
        >
          <input
            name="word"
            autocomplete="off"
            onkeydown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                handleGetTranslateWord();
              }
            }}
            bind:value={translateWord.word}
            class="absolute left-0 top-0 h-full w-full rounded-9 bg-transparent px-9 text-center font-constantine text-18 font-700 uppercase leading-30 text-white outline-none"
          />
          <button
            type="button"
            onclick={(e) => {
              e.stopPropagation();
              handleGetTranslateWord();
            }}
            class="w-28 h-28 text-white/30 hover:text-white transition duration-100 absolute top-1 right-1"
            ><Icon
              icon="material-symbols:search-rounded"
              width="22"
              height="22"
            /></button
          >
        </div>

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="audio"
          autocomplete="off"
          onkeydown={(e) => e.stopPropagation()}
          bind:value={translateWord.audio}
        />

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="phonetics"
          autocomplete="off"
          onkeydown={(e) => e.stopPropagation()}
          bind:value={translateWord.phonetics}
        />

        <textarea
          class="mt-24 w-full rounded-6 border-0 bg-transparent p-6 text-12 font-400 leading-15 text-white outline-none ring-1 ring-white/30"
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

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="meaning"
          autocomplete="off"
          onkeydown={(e) => e.stopPropagation()}
          bind:value={translationText}
          onchange={(e) => {
            e.preventDefault();
            handleChangeTranslationTranslate(e.currentTarget.value);
          }}
        />

        <div class="flex w-full items-center justify-center gap-24 mt-6">
          <Dialog.Close
            class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white  bg-white/15 transition hover:bg-white/10 py-3 px-6"
            >Cancel</Dialog.Close
          >
          <button
            type="submit"
            class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white bg-white/15 transition hover:bg-white/10 py-3 px-6"
            >Submit</button
          >
        </div>
      </form>

      <Definition item={translateWord} />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
