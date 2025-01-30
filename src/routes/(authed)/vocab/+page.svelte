<script lang="ts">
  import Definition from "$lib/components/Definition.svelte";
  import Flipcard from "$lib/components/Flipcard.svelte";
  import Translate from "$lib/components/Translate.svelte";
  import Edit from "$lib/components/Edit.svelte";
  import type { SelectVocab } from "$lib/db/schema";
  import { renderWord, searchTerm, searchResults } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { untrack } from "svelte";
  import { totalMemories } from "$lib/store/navstore";

  let { data, form } = $props();
  let deleteSearchTimeout: ReturnType<typeof setTimeout>;
  let checkTimeout: ReturnType<typeof setTimeout>;
  const trigger = debounce(async (str: string) => {
    const response = await fetch(`/server/searchword?word=${str}`);
    const result = await response.json();
    switch (result.length) {
      case 0:
        searchTermFounded = false;
        deleteSearchTimeout = setTimeout(() => {
          searchTermFounded = true;
          $searchTerm = "";
          $searchResults = [];
        }, 1500);
        src0 = "src/lib/assets/sounds/mp3_Boing.mp3";
        paused0 = false;
        break;
      case 1:
        searchTermFounded = true;
        $searchResults = result;
        if (str.length > 3) {
          checkTimeout = setTimeout(() => {
            handleSelectWordFromSearch(result[0].id);
          }, 1500);
        }
        break;
      default:
        searchTermFounded = true;
        $searchResults = result;
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
    const response = await fetch(`/server/getword?id=${id}`);
    if (response.status === 200) {
      const wordData = (await response.json()) as SelectVocab;
      if (wordData) {
        $renderWord = wordData;
        if (wordData.number > 1) {
          await fetch(`/server/checkword?id=${id}`);
        } else {
          $totalMemories += 1;
          await fetch(`/server/archiveword?word=${wordData.word}&id=${id}`);
        }
      }
    }
    $searchTerm = "";
    $searchResults = [];
  }

  let searchTermFounded = $state<boolean>(false);
  let src0 = $state<string>("");
  let paused0 = $state<boolean>(true);
  let src1 = $state<string>("");
  let paused1 = $state<boolean>(true);
  let flipNumber = $state<number>(0);

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
    const translations = $renderWord?.meanings
      .flatMap((item) => item.translation)
      .join(", ");

    src0 = `https://vocabs3.vercel.app/speech?text=${translations}`;
    paused0 = false;
    flipNumber = $renderWord!.number - 1;
  }
</script>

<audio src={src0} bind:paused={paused0}></audio>
<audio src={src1} bind:paused={paused1} onended={handlePlaySoundMeanings}
></audio>

<div class="w-content h-[48px] flex justify-center items-center gap-6">
  {#if $renderWord}
    <Flipcard number={flipNumber} />
    <p
      class="layout-white {searchTermFounded
        ? 'text-white'
        : ''} rounded-3 h-36 flex-1 pt-2 truncate text-center align-baseline font-constantine text-21 font-700 uppercase leading-36"
    >
      {$searchTerm || $renderWord.word}
      <small
        class="pl-3 pt-9 font-opensans text-center align-baseline text-9 font-600 !lowercase leading-12 text-secondary-white"
      >
        {$renderWord.phonetics}
      </small>
    </p>
  {:else}
    <p
      class="layout-white rounded-3 h-36 w-full pt-2 truncate text-center font-constantine text-21 font-700 uppercase leading-36 text-white"
    >
      {$searchTerm}
    </p>
  {/if}
</div>
<div class="relative w-content h-[calc(100%-54px)]">
  {#if $renderWord}
    <div class="absolute w-full h-full z-10 no-scrollbar overflow-y-scroll">
      <Definition item={$renderWord} />
    </div>
  {/if}
  {#if $searchResults.length}
    <div
      transition:expand={{ duration: 150 }}
      class="layout-white p-6 rounded-3 absolute flex flex-col w-full h-full z-20 no-scrollbar overflow-y-scroll"
    >
      {#each $searchResults as item, i}
        <div
          class="flex items-center justify-between h-27 my-6 cursor-pointer rounded-3 bg-black/50 shadow-sm shadow-black/45"
        >
          <button class="text-secondary-white text-10 leading-10 w-27 h-full"
            >{i + 1}</button
          >
          <button
            style="text-shadow: 0 2px 3px black;"
            class="font-constantine text-24 font-700 leading-27 text-white hover:scale-[2] transition duration-100"
            onclick={() => handleSelectWordFromSearch(item.id)}
            >{item.word}</button
          >
          <button class="text-secondary-white text-10 leading-10 w-27 h-full">
            <Icon icon="iconamoon:trash" width="14" height="14" />
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <Translate formResult={form} />
  <Edit />
</div>

<svelte:window on:keydown|preventDefault={onKeyDown} />
