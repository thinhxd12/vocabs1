<script lang="ts">
  import { enhance } from "$app/forms";
  import type { InsertVocab, SelectVocab } from "$lib/db/schema";
  import { showLayout } from "$lib/store/layoutstore";
  import { renderWord, showEdit } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { Dialog } from "bits-ui";
  import { untrack } from "svelte";
  import { fly } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import type { VocabMeaningType } from "$lib/types";
  import { getTranslationArr } from "$lib/functions";
  import Definition from "./Definition.svelte";

  let editWord = $state<SelectVocab>({
    id: "",
    number: 0,
    word: "",
    audio: "",
    phonetics: "",
    meanings: [],
  });

  let editRenderWord = $state<InsertVocab>({
    word: "",
    audio: "",
    phonetics: "",
    meanings: [],
  });

  let { id } = $props();

  $effect(() => {
    const v = $showEdit;
    untrack(async () => {
      if (id && $showEdit) {
        const response = await fetch(`/server/getword?id=${id}`);
        editWord = (await response.json()) as SelectVocab;
        meaningsText = JSON.stringify(editWord.meanings, null, "     ");
        translationText = makeTranslationText(editWord.meanings);
        getTextDataWebster();
      }
    });
  });

  let meaningsText = $state<string>();
  let translationText = $state<string>();

  async function getTextDataWebster() {
    const response = await fetch(`/server/getwebster?word=${editWord.word}`);
    editRenderWord = await response.json();
    editWord.audio = editRenderWord.audio;
    editWord.phonetics = editRenderWord.phonetics;
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
    editWord.meanings = editWord.meanings.map((item, index) => {
      return {
        ...item,
        translation:
          arr.find((el) => el?.partOfSpeech === item.partOfSpeech)
            ?.translations || [],
      };
    });
    meaningsText = JSON.stringify(editWord.meanings, null, "     ");
  };

  function handleChangeTranslationMeanings(str: string) {
    editWord.meanings = JSON.parse(str);
    translationText = makeTranslationText(editWord.meanings);
    editRenderWord.meanings = JSON.parse(str);
  }

  function handleCheckEdit() {
    editWord.meanings = editRenderWord.meanings;
    editWord.phonetics = editRenderWord.phonetics;
    editWord.audio = editRenderWord.audio;
    meaningsText = JSON.stringify(editWord.meanings, null, "     ");
    translationText = makeTranslationText(editWord.meanings);
  }
</script>

<Dialog.Root bind:open={$showEdit} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fly}
      transitionConfig={{ duration: 50 }}
      class="fixed inset-0 z-30 bg-black/30"
    />
    <Dialog.Content
      class="fixed w-content {$showLayout
        ? 'inset-[48px_12px_48px_calc(100vw-390px)]'
        : 'inset-[48px_calc(50vw-189px)_48px_calc(50vw-189px)]'} z-50 overflow-y-scroll no-scrollbar rounded-6 p-6 outline-none layout-light"
    >
      <form
        name="editvocab"
        action="?/editVocab"
        method="post"
        class="w-full mb-6"
        use:enhance={({ formElement, formData, action, cancel }) => {
          return async ({ result }) => {
            if (result.type === "failure") {
              toast.error(result.data?.error as string);
            } else {
              toast.success("Edit successfully");
              if ($renderWord && $renderWord.id === editWord.id) {
                $renderWord = editWord;
              }
            }
          };
        }}
      >
        <div
          class="w-[330px] mx-auto h-30 relative rounded-full bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]"
        >
          <input hidden name="id" autocomplete="off" value={editWord.id} />
          <input
            name="word"
            autocomplete="off"
            onkeydown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                getTextDataWebster();
              }
            }}
            bind:value={editWord.word}
            class="absolute left-0 top-0 h-full w-full rounded-9 bg-transparent px-9 text-center font-constantine text-18 font-700 uppercase leading-30 text-white outline-none"
          />
          <button
            type="button"
            onclick={(e) => {
              e.stopPropagation();
              getTextDataWebster();
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
          bind:value={editWord.audio}
        />

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="phonetics"
          autocomplete="off"
          onkeydown={(e) => e.stopPropagation()}
          bind:value={editWord.phonetics}
        />

        <textarea
          class="mt-24 w-full style-1 rounded-6 border-0 bg-transparent p-6 text-12 font-400 leading-15 text-white outline-none ring-1 ring-white/30"
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
          name="number"
          autocomplete="off"
          type="number"
          max={240}
          min={1}
          onkeydown={(e) => e.stopPropagation()}
          bind:value={editWord.number}
        />

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

      <Definition
        item={editRenderWord}
        isEdit={true}
        onCheck={handleCheckEdit}
      />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
