<script lang="ts">
  import { enhance } from "$app/forms";
  import { renderWord, showEdit } from "$lib/store/vocabstore";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import type { DBSelect, VocabMeaningType } from "$lib/types";
  import { getTranslationArr } from "$lib/utils/functions";
  import Definition from "./Definition.svelte";
  import { page } from "$app/state";
  import SolarMagniferLinear from "~icons/solar/magnifer-linear";

  const { supabase } = page.data;

  let editWord = $state<DBSelect["vocab_table"]>({
    id: "",
    number: 0,
    word: "",
    audio: "",
    phonetics: "",
    meanings: [],
  });

  let editRenderWord = $state<DBSelect["vocab_table"]>({
    id: "",
    number: 0,
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
        const { data } = await supabase
          .from("vocab_table")
          .select("*")
          .eq("id", id)
          .limit(1);
        if (data) {
          editWord = data[0];
          meaningsText = JSON.stringify(editWord.meanings, null, "     ");
          translationText = makeTranslationText(editWord.meanings);
          getTextDataWebster(false);
        }
      }
    });
  });

  let meaningsText = $state<string>();
  let translationText = $state<string>();

  async function getTextDataWebster(isChange: boolean) {
    const response = await fetch(`/server/getwebster?word=${editWord.word}`);
    editRenderWord = await response.json();
    if (isChange) {
      editWord.audio = editRenderWord.audio;
      editWord.phonetics = editRenderWord.phonetics;
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

<div class="w-full h-full no-scrollbar overflow-x-scroll flex flex-wrap gap-2">
  <form
    name="editvocab"
    action="?/editVocab"
    method="post"
    class="w-full h-fit dark"
    use:enhance={({ formElement, formData, action, cancel }) => {
      return async ({ result }) => {
        if (result.type === "failure") {
          toast.error("Error!", {
            description: result.data?.error as string,
            class: "my-toast-error",
            classes: {
              title: "text-[#f70000] text-14",
              description: "text-black/80 text-12",
            },
          });
        } else {
          toast.success("Success!", {
            description: "Edit successfully.",
            class: "my-toast-success",
            classes: {
              title: "text-[#00c441] text-15 font-500",
              description: "text-black/70 text-12 font-400",
            },
          });

          if ($renderWord && $renderWord.id === editWord.id) {
            $renderWord = editWord;
          }
        }
      };
    }}
  >
    <div
      class="w-full h-36 mb-3 relative bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]"
    >
      <input hidden name="id" autocomplete="off" value={editWord.id} />
      <input
        name="word"
        autocomplete="off"
        onkeydown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            getTextDataWebster(true);
          }
        }}
        bind:value={editWord.word}
        class="absolute left-0 top-0 h-full w-full bg-transparent px-9 text-center font-constantine text-18 font-700 uppercase leading-30 outline-none"
      />
      <button
        type="button"
        onclick={(e) => {
          e.stopPropagation();
          getTextDataWebster(true);
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
      bind:value={editWord.audio}
    />

    <input
      class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 outline-none"
      name="phonetics"
      autocomplete="off"
      onkeydown={(e) => e.stopPropagation()}
      bind:value={editWord.phonetics}
    />

    <textarea
      class="w-full style-scrollbar border-0 bg-transparent p-6 text-12 font-400 leading-15 outline-none border-b border-white/30"
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
      class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 outline-none"
      name="number"
      autocomplete="off"
      type="number"
      max={240}
      min={1}
      onkeydown={(e) => e.stopPropagation()}
      bind:value={editWord.number}
    />

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

    <div class="w-full flex items-center justify-center gap-24 my-6">
      <button
        type="button"
        onclick={() => ($showEdit = false)}
        class="rounded-3 min-w-60 text-center text-13 shadow font-400 leading-18 bg-white/15 transition hover:bg-white/10 py-3 px-12"
      >
        Close
      </button>
      <button
        type="submit"
        class="rounded-3 min-w-60 text-center text-13 shadow font-400 leading-18 bg-white/15 transition hover:bg-white/10 py-3 px-12"
      >
        Save
      </button>
    </div>
  </form>

  <Definition item={editRenderWord} isEdit={true} onCheck={handleCheckEdit} />
</div>
