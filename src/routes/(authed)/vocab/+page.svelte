<script lang="ts">
  import Definition from "$lib/components/Definition.svelte";
  import Flipcard from "$lib/components/Flipcard.svelte";
  import Translate from "$lib/components/Translate.svelte";
  import Edit from "$lib/components/Edit.svelte";
  import {
    renderWord,
    searchTerm,
    searchResults,
    showEdit,
  } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { untrack } from "svelte";
  import { showTimer, totalMemories, vocabInput } from "$lib/store/navstore";
  import { slide } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { innerWidth } from "svelte/reactivity/window";
  import { timerString } from "$lib/store/layoutstore";
  import type { PageProps } from "./$types";
  import { archiveVocab } from "$lib/functions";
  import { page } from "$app/state";

  let deleteSearchTimeout: ReturnType<typeof setTimeout>;
  let checkTimeout: ReturnType<typeof setTimeout>;
  const trigger = debounce(async (text: string) => {
    const { data } = await page.data.supabase
      .from("vocab_table")
      .select("id,word")
      .like("word", `${text}%`)
      .order("id", { ascending: true })
      .limit(9);

    if (!data) return;
    switch (data.length) {
      case 0:
        searchTermFounded = false;
        deleteSearchTimeout = setTimeout(() => {
          searchTermFounded = true;
          $searchTerm = "";
          $vocabInput = "";
          $searchResults = [];
          deleteIndex = 9;
        }, 1500);
        src0 = "/sounds/mp3_Boing.mp3";
        paused0 = false;
        break;
      case 1:
        searchTermFounded = true;
        $searchResults = data;
        deleteIndex = 9;
        if (text.length > 4) {
          checkTimeout = setTimeout(() => {
            handleSelectWordFromSearch(data[0].id);
          }, 1500);
        }
        break;
      default:
        searchTermFounded = true;
        $searchResults = data;
        deleteIndex = 9;
        break;
    }
  }, 300);

  let debouncetimeout: ReturnType<typeof setTimeout>;
  export function debounce(callback: Function, wait = 300) {
    return (...args: any[]) => {
      clearTimeout(debouncetimeout);
      debouncetimeout = setTimeout(() => callback(...args), wait);
    };
  }

  function onKeyDown(e: KeyboardEvent) {
    clearTimeout(debouncetimeout);
    clearTimeout(checkTimeout);
    clearTimeout(deleteSearchTimeout);
    switch (true) {
      case e.key === "Backspace":
        $searchTerm = $searchTerm.slice(0, -1);
        if ($searchTerm.length > 2) trigger($searchTerm.toLowerCase());
        break;
      case e.key === " ":
        searchTermFounded = true;
        $searchTerm = "";
        $searchResults = [];
        break;
      case /^[A-Za-z]$/.test(e.key):
        $searchTerm += e.key;
        if ($searchTerm.length > 2) {
          trigger($searchTerm.toLowerCase());
        }
        break;
      case /^[1-9]$/.test(e.key):
        if ($searchResults.length && Number(e.key) <= $searchResults.length) {
          handleSelectWordFromSearch($searchResults[Number(e.key) - 1].id);
        }
        break;
    }
  }

  function expand(node: Element, { duration = 150 }) {
    const style = getComputedStyle(node);
    const height = parseFloat(style.height);

    return {
      duration,
      css: (t: number) => `overflow: hidden; height: ${t * height}px;`,
    };
  }
  // handlecheck
  async function handleSelectWordFromSearch(id: string) {
    const { data } = await page.data.supabase
      .from("vocab_table")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (data) {
      $renderWord = data[0];
      $vocabInput = data[0].word;
      if (data[0].number > 1) {
        await page.data.supabase
          .from("vocab_table")
          .update({ number: data[0].number - 1 })
          .eq("id", id);
      } else {
        await archiveVocab(data[0].id, data[0].word, page.data.supabase);
      }
    }
    $searchTerm = "";
    $searchResults = [];
  }

  let searchTermFounded = $state<boolean>(true);
  let src0 = $state<string>("");
  let paused0 = $state<boolean>(true);
  let src1 = $state<string>("");
  let paused1 = $state<boolean>(true);
  let flipNumber = $state<number>(0);
  let deleteIndex = $state<number>(9);

  $effect(() => {
    const v = $renderWord?.id;
    untrack(() => {
      if ($renderWord) {
        flipNumber = $renderWord.number;
        src1 = $renderWord.audio;
        paused1 = false;
      }
    });
  });

  function handlePlaySoundMeanings() {
    const translations = Array.isArray($renderWord?.meanings)
      ? $renderWord.meanings.flatMap((item: any) => item.translation).join(", ")
      : "";
    src0 = `https://vocabs3.vercel.app/speech?text=${translations}`;
    setTimeout(() => {
      paused0 = false;
      flipNumber = $renderWord!.number - 1;
    }, 1000);
  }

  async function confirmDelete(id: string) {
    const { error } = await page.data.supabase
      .from("vocab_table")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error!", {
        class: "my-toast",
      });
    } else
      toast.success("Delete action was successful!", {
        class: "my-toast",
      });
    searchTermFounded = true;
    $searchTerm = "";
    $searchResults = [];
  }

  let editId = $state<string>("");

  function handleEditFromSearch(id: string) {
    $showEdit = true;
    editId = id;
  }

  function handleEditFromDefinition() {
    $showEdit = true;
    editId = $renderWord!.id;
  }

  function handleSearchInput() {
    clearTimeout(debouncetimeout);
    if ($vocabInput.length > 2) {
      trigger($vocabInput.toLowerCase());
    }
  }
</script>

<svelte:head>
  {#if $showTimer}
    <title>{$timerString}</title>
  {:else}
    <title>{$renderWord ? `${$renderWord.word}` : "vocab"}</title>
  {/if}

  <meta name="Vocab" content="Some Vocab" />
</svelte:head>

<audio src={src0} bind:paused={paused0}></audio>
<audio src={src1} bind:paused={paused1} onended={handlePlaySoundMeanings}>
</audio>

<div class="w-content h-[48px] flex justify-center items-center gap-6">
  {#if innerWidth.current && innerWidth.current > 450}
    {#if $renderWord}
      <Flipcard number={flipNumber} />
      <div
        style="color: {searchTermFounded ? 'black' : 'white'}"
        class="relative layout-white rounded-3 h-36 flex-1"
      >
        <div
          class="absolute top-0 left-0 z-30 w-full h-full truncate text-center align-baseline font-constantine text-21 font-700 uppercase leading-33"
        >
          {$searchTerm || $renderWord.word}
        </div>
        <span
          class="absolute z-10 font-sfpro left-0 bottom-0 w-full text-center text-9 opacity-50 leading-12 font-400 !lowercase"
        >
          {$renderWord.phonetics}
        </span>
      </div>
    {:else}
      <p
        style="color: {searchTermFounded ? 'black' : 'white'}"
        class="layout-white rounded-3 h-36 w-full pt-2 truncate text-center font-constantine text-21 font-700 uppercase leading-36 text-white"
      >
        {$searchTerm}
      </p>
    {/if}
  {:else}
    {#if $renderWord}
      <Flipcard number={flipNumber} />
    {/if}
    <div class="relative layout-white rounded-3 h-36 flex-1 overflow-hidden">
      <input
        style="color: {searchTermFounded ? 'black' : 'white'}"
        class="absolute top-0 left-0 z-30 w-full h-full bg-transparent truncate text-center align-baseline font-constantine text-21 font-700 uppercase leading-36 outline-none"
        type="text"
        bind:value={$vocabInput}
        oninput={handleSearchInput}
        onfocus={() => {
          $vocabInput = "";
          $searchResults = [];
        }}
        onblur={() => {
          if ($renderWord) $vocabInput = $renderWord.word;
        }}
      />
      {#if $renderWord}
        <span
          class="absolute z-10 font-sfpro left-0 bottom-0 w-full text-center text-9 opacity-50 leading-12 font-400 !lowercase"
        >
          {$renderWord.phonetics}
        </span>
      {/if}
    </div>
  {/if}
</div>
<div class="relative w-content h-[calc(100%-54px)]">
  {#if $renderWord}
    <div class="absolute w-full h-full z-10 no-scrollbar overflow-y-scroll">
      <Definition item={$renderWord} onEdit={handleEditFromDefinition} />
    </div>
  {/if}
  {#if $searchResults.length}
    <div
      transition:expand={{ duration: 150 }}
      class="layout-white p-6 rounded-3 absolute flex flex-col w-full h-full z-20 no-scrollbar overflow-y-scroll"
    >
      {#each $searchResults as item, i}
        {#if i === deleteIndex}
          <div
            transition:slide={{ duration: 300 }}
            class="flex items-center px-12 justify-between h-27 my-6 cursor-pointer rounded-3 bg-black/50 shadow-sm shadow-black/45"
          >
            <span class="text-12 text-white">Delete this word?</span>
            <button
              onclick={() => confirmDelete(item.id)}
              class="text-12 text-secondary-white hover:text-black hover:font-600"
              >Yes</button
            >
            <button
              onclick={() => (deleteIndex = 9)}
              class="text-12 text-secondary-white">No</button
            >
          </div>
        {:else}
          <div
            class="flex items-center justify-between h-27 my-6 cursor-pointer rounded-3 bg-black/50 shadow-sm shadow-black/45"
          >
            <button
              onclick={() => handleEditFromSearch(item.id)}
              class="text-secondary-white text-10 leading-10 w-27 h-full"
              >{i + 1}</button
            >
            <button
              style="text-shadow: 0 2px 3px black;"
              class="font-constantine text-24 font-700 leading-27 text-white hover:scale-[2] transition duration-100"
              onclick={() => handleSelectWordFromSearch(item.id)}
              >{item.word}</button
            >
            <button
              onclick={() => (deleteIndex = i)}
              class="text-secondary-white text-10 leading-10 w-27 h-full"
            >
              <Icon
                icon="solar:trash-bin-trash-outline"
                width="15"
                height="15"
              />
            </button>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <Translate />
  <Edit id={editId} />
</div>

<svelte:window on:keydown={onKeyDown} />
