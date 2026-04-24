<script lang="ts">
  import {
    createEmptyCard,
    fsrs,
    Rating,
    type Card,
    type CardInput,
    type Grade,
    type IPreview,
  } from "ts-fsrs";
  import type { PageProps } from "./$types";
  import Container from "$lib/components/Container.svelte";
  import {
    addToast,
    listCardContent,
    listCardCount,
  } from "$lib/store/layoutstore";
  import BiTranslate from "~icons/bi/translate";
  import Fa7SolidListUl from "~icons/fa7-solid/list-ul";
  import { fly } from "svelte/transition";

  let { data: layoutData }: PageProps = $props();
  let src0 = $state<string>("");
  let currentWord = $state<string>("");
  let paused0 = $state<boolean>(true);
  let translateWord = $state<string>("");
  let showTranslate = $state<boolean>(false);

  const scheduler = fsrs({
    request_retention: 0.9,
    maximum_interval: 36500,
    enable_fuzz: true,
    enable_short_term: true,
    learning_steps: ["15m"],
    relearning_steps: ["10m"],
  });

  async function getList() {
    $listCardContent = [];
    const now = new Date().getTime();
    const { data } = await layoutData.supabase
      .from("memories_table")
      .select("*")
      .order("created_at", { ascending: false })
      .lte("due", now)
      .gt("due", 0)
      .limit(30);
    if (data && data.length === 0) {
      const { data } = await layoutData.supabase
        .from("memories_table")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("due", 0)
        .limit(30);
      if (data) {
        $listCardContent = data;
      }
    } else if (data && data.length < 30) {
      const { data: dataMore } = await layoutData.supabase
        .from("memories_table")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("due", 0)
        .limit(30 - data.length);
      if (dataMore) {
        $listCardContent = [...data, ...dataMore];
      }
    } else {
      if (data) {
        $listCardContent = data;
      }
    }
    prepareCard();
    showTranslate = false;
    $listCardCount = 0;
    currentWord = $listCardContent[0].word;
  }

  let previews = $state<IPreview>();

  function prepareCard() {
    if ($listCardContent.length === 0) return;
    let { id, word, created_at, ...card } = $listCardContent[$listCardCount];
    if (!card.due) card = createEmptyCard();
    previews = scheduler.repeat(card, new Date());
  }

  async function handleRate(card: Card | CardInput, rate: Grade) {
    const saved = scheduler.next(card, new Date(), rate, ({ card, log }) => ({
      card: {
        ...card,
        due: card.due.getTime(),
        last_review: card.last_review?.getTime() ?? null,
      },
    }));

    const { error } = await layoutData.supabase
      .from("memories_table")
      .update({ ...saved.card })
      .eq("id", $listCardContent[$listCardCount].id);
    if (error)
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    handleSetNextWord();
  }

  function handleSetNextWord() {
    $listCardCount++;
    if ($listCardCount < $listCardContent.length) {
      currentWord = $listCardContent[$listCardCount].word;
      translateWord = "";
      showTranslate = false;
      prepareCard();
    } else {
      src0 = "/sounds/mp3_Ding.mp3";
      paused0 = false;
      currentWord = "";
      translateWord = "";
      previews = undefined;
      $listCardContent = [];
      $listCardCount = 0;
    }
  }

  function calculateTimeDiff(due: Date) {
    let diffMs = due.getTime() - new Date().getTime();

    const diffMin = Math.round(diffMs / (1000 * 60));
    const diffHour = Math.round(diffMs / (1000 * 60 * 60));
    const diffDay = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffMin < 60) return diffMin + "m";
    if (diffHour < 24) return diffHour + "h";
    return diffDay + "d";
  }

  async function handleShowTranslate() {
    showTranslate = !showTranslate;
    if (translateWord === "" && currentWord !== "") {
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=vi&q=${currentWord}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data) {
        translateWord = data[0][0];
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
    switch (true) {
      case e.key === " ":
        handleShowTranslate();
        break;
      case e.key === "1":
        handleRate(previews![Rating.Again].card, Rating.Again);
        break;
      case e.key === "2":
        handleRate(previews![Rating.Hard].card, Rating.Hard);
        break;
      case e.key === "3":
        handleRate(previews![Rating.Good].card, Rating.Good);
        break;
      case e.key === "4":
        handleRate(previews![Rating.Easy].card, Rating.Easy);
        break;
      default:
        break;
    }
  }
</script>

<svelte:head>
  <title>✨</title>
  <meta name="spaced" content="Spaced Repetition!" />
</svelte:head>

<audio src={src0} bind:paused={paused0} preload="auto"></audio>

<Container>
  <div class="flex-1"></div>

  <div
    class="relative dark min-h-178 mainContent w-full rounded-2 p-6 flex items-center"
  >
    {#if showTranslate}
      <p class="w-full break-words text-center text-21 font-500 leading-28">
        {translateWord}
      </p>
    {:else}
      {#key currentWord}
        <p
          class="w-full break-words text-center font-constantine text-21 font-700 uppercase leading-28"
          in:fly={{ y: -30, duration: 600 }}
          style="text-shadow: 0 0 6px rgba(0,0,0,0.9);"
        >
          {currentWord}
        </p>
      {/key}
    {/if}

    <button
      class="btn-layout absolute left-3 bottom-3"
      onclick={(e) => {
        e.currentTarget.blur();
        getList();
      }}
    >
      <Fa7SolidListUl width="16" height="16" />
    </button>

    {#if currentWord !== ""}
      <button
        class=" btn-layout absolute right-3 bottom-3"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowTranslate();
        }}
      >
        <BiTranslate width="14" height="14" />
      </button>
    {/if}
  </div>

  <div class="w-full flex-1 flex items-end">
    <div class="w-full flex rounded-2 overflow-hidden">
      {#if previews}
        <button
          class="bg-green-800/80 hover:bg-green-800 py-6 flex flex-col flex-1 items-center justify-center"
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Again].card, Rating.Again);
          }}
        >
          <div class="w-full text-14 leading-18 text-center">
            {calculateTimeDiff(previews[Rating.Again].card.due)}
          </div>
          <div class="h-24 w-full uppercase text-18 leading-24 font-600">
            Again
          </div>
          <span class="text-10 leading-10">(1)</span>
        </button>
        <button
          class="bg-green-600/80 hover:bg-green-600 py-6 flex flex-col flex-1 items-center justify-center"
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Hard].card, Rating.Hard);
          }}
        >
          <div class="w-full text-14 leading-18 text-center">
            {calculateTimeDiff(previews[Rating.Hard].card.due)}
          </div>
          <div class="h-24 w-full uppercase text-18 leading-24 font-600">
            Hard
          </div>
          <span class="text-10 leading-10">(2)</span>
        </button>
        <button
          class="bg-green-400/80 hover:bg-green-400 py-6 flex flex-col flex-1 items-center justify-center"
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Good].card, Rating.Good);
          }}
        >
          <div class="w-full text-14 leading-18 text-center">
            {calculateTimeDiff(previews[Rating.Good].card.due)}
          </div>
          <div class="h-24 w-full uppercase text-18 leading-24 font-600">
            Good
          </div>
          <span class="text-10 leading-10">(3)</span>
        </button>
        <button
          class="bg-green-200/80 hover:bg-green-200 py-6 flex flex-col flex-1 items-center justify-center"
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Easy].card, Rating.Easy);
          }}
        >
          <div class="w-full text-1Rating.Easy leading-18 text-center">
            {calculateTimeDiff(previews[Rating.Easy].card.due)}
          </div>
          <div class="h-24 w-full uppercase text-18 leading-24 font-600">
            Easy
          </div>
          <span class="text-10 leading-10">(4)</span>
        </button>
      {/if}
    </div>
  </div>
</Container>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .btn-layout {
    @apply size-18 flex items-center justify-center outline-none overflow-hidden bg-white/15 border border-white/10 text-black text-12 leading-18 rounded-2 hover:bg-white/30;
    backdrop-filter: blur(12px);
  }

  .mainContent {
    background: url("$lib/assets/images/sky.webp");
    background-size: cover;
    background-position: left center;
  }
</style>
