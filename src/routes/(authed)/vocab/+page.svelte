<script lang="ts">
  import Definition from "$lib/components/Definition.svelte";
  import Flipcard from "$lib/components/Flipcard.svelte";
  import Translate from "$lib/components/Translate.svelte";
  import Edit from "$lib/components/Edit.svelte";
  import type { SelectVocab } from "$lib/db/schema";
  import {
    renderWord,
    searchTerm,
    searchResults,
    showEdit,
  } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { untrack } from "svelte";
  import { showWeather, totalMemories } from "$lib/store/navstore";
  import { slide } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import Weather from "$lib/components/Weather.svelte";
  import { innerWidth } from "svelte/reactivity/window";

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
          inputVal = "";
          $searchResults = [];
          deleteIndex = 9;
        }, 1500);
        src0 = "/sounds/mp3_Boing.mp3";
        paused0 = false;
        break;
      case 1:
        searchTermFounded = true;
        $searchResults = result;
        deleteIndex = 9;
        if (str.length > 4) {
          checkTimeout = setTimeout(() => {
            handleSelectWordFromSearch(result[0].id);
          }, 1500);
        }
        break;
      default:
        searchTermFounded = true;
        $searchResults = result;
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
    const response = await fetch(`/server/getword?id=${id}`);
    if (response.status === 200) {
      const wordData = (await response.json()) as SelectVocab;
      $renderWord = wordData;
      inputVal = wordData.word;
      if (wordData.number > 1) {
        fetch(`/server/checkword?id=${id}`);
      } else {
        const response = await fetch(
          `/server/archiveword?word=${wordData.word}&id=${id}`
        );
        if (response.status == 201) $totalMemories += 1;
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
    const translations = $renderWord?.meanings
      .flatMap((item) => item.translation)
      .join(", ");

    src0 = `https://vocabs3.vercel.app/speech?text=${translations}`;
    paused0 = false;
    flipNumber = $renderWord!.number - 1;
  }

  async function confirmDelete(id: string) {
    const response = await fetch(`/server/deleteword?id=${id}`);
    const result = await response.json();

    if (result.status) {
      toast.success(result.message);
      searchTermFounded = true;
      $searchTerm = "";
      $searchResults = [];
    } else toast.error(result.message);
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

  let inputVal = $state<string>("");

  function handleSearchInput() {
    clearTimeout(debouncetimeout);
    if (inputVal.length > 2) {
      trigger(inputVal.toLowerCase());
    }
  }
</script>

<svelte:head>
  <title>{$renderWord ? `${$renderWord.word}` : "vocab"}</title>
  <meta name="Vocab" content="Some Vocab" />
</svelte:head>

<audio src={src0} bind:paused={paused0}></audio>
<audio src={src1} bind:paused={paused1} onended={handlePlaySoundMeanings}
></audio>

<div class="w-content h-[48px] flex justify-center items-center gap-6">
  {#if innerWidth.current && innerWidth.current > 450}
    {#if $renderWord}
      <Flipcard number={flipNumber} />
      <p
        style="color: {searchTermFounded ? 'white' : 'black'}"
        class="layout-white rounded-3 h-36 flex-1 pt-2 truncate text-center align-baseline font-constantine text-21 font-700 uppercase leading-36"
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
        style="color: {searchTermFounded ? 'white' : 'black'}"
        class="layout-white rounded-3 h-36 w-full pt-2 truncate text-center font-constantine text-21 font-700 uppercase leading-36 text-white"
      >
        {$searchTerm}
      </p>
    {/if}
  {:else}
    {#if $renderWord}
      <Flipcard number={flipNumber} />
    {/if}
    <input
      style="color: {searchTermFounded ? 'white' : 'black'}"
      class="layout-white rounded-3 h-36 flex-1 pt-2 truncate text-center align-baseline font-constantine text-21 font-700 uppercase leading-36 outline-none"
      type="text"
      bind:value={inputVal}
      oninput={handleSearchInput}
      onfocus={() => {
        inputVal = "";
        $searchResults = [];
      }}
      onblur={() => {
        if ($renderWord) inputVal = $renderWord.word;
      }}
    />
  {/if}
</div>
<div class="relative w-content h-[calc(100%-54px)] overflow-hidden">
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
              <Icon icon="hugeicons:delete-throw" width="14" height="14" />
            </button>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <Translate />
  <Edit id={editId} />

  {#if $showWeather}
    <Weather />
  {/if}
</div>

<svelte:window on:keydown|preventDefault={onKeyDown} />
