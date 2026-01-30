<script lang="ts">
  import { enhance } from "$app/forms";
  import { showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { toast } from "svelte-sonner";
  import type { DBInsert, TranslateType, VocabMeaningType } from "$lib/types";
  import { getTranslationArr } from "$lib/utils/functions";
  import Definition from "./Definition.svelte";
  import { v7 as uuidv7 } from "uuid";
  import { page } from "$app/state";
  import { dev } from "$app/environment";
  import { format } from "date-fns";

  const { supabase } = page.data;

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
    if (dev) return;
    const url = `https://vocabs3.vercel.app/trans?text=${text}&from=auto&to=vi`;
    const response = await fetch(url);
    const data = await response.json();
    if (data) return data as TranslateType;
  }

  async function getTextDataWebster(text: string) {
    const response = await fetch(`/server/getwebster?word=${text}`);
    const data = await response.json();
    if (data) return data as DBInsert["vocab_table"];
  }

  async function handleGetTranslateWord() {
    const { data: dataMemories } = await supabase
      .from("memories_table")
      .select("*")
      .like("word", `${translateWord.word}%`)
      .limit(1);

    if (dataMemories.length)
      toast.error(`Memorized "${dataMemories[0].word}"!`, {
        description: `${format(dataMemories[0].created_at, "cccc, yyyy-MM-dd' at 'p")}`,
        class: "my-toast-error",
        classes: {
          title: "text-[#f70000] text-14",
          description: "text-black/80 text-12",
        },
      });
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

<form
  name="insertvocab"
  action="?/insertNewVocab"
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
      } else if (result.type === "success") {
        toast.success("Success!", {
          description: "Add word successfully.",
          class: "my-toast-success",
          classes: {
            title: "text-[#00c441] text-15 font-500",
            description: "text-black/70 text-12 font-400",
          },
        });
      }
    };
  }}
>
  <!-- svelte-ignore a11y_autofocus -->
  <div
    class="w-full h-36 mb-3 relative bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]"
  >
    <input
      name="word"
      autocomplete="off"
      autofocus
      onkeydown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          handleGetTranslateWord();
        }
      }}
      bind:value={translateWord.word}
      class="absolute left-0 top-0 h-full w-full bg-transparent px-9 text-center font-constantine text-18 font-700 uppercase leading-30 outline-none"
    />
    <button
      type="button"
      onclick={(e) => {
        e.stopPropagation();
        handleGetTranslateWord();
      }}
      class="size-36 text-white/30 hover:text-white transition duration-100 absolute top-0 right-0 flex justify-center items-center"
    >
      <Icon icon="solar:magnifer-outline" width="16" height="16" />
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

<Definition isEdit={true} item={translateWord} />
