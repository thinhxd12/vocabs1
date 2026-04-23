<script lang="ts">
  import {
    createEmptyCard,
    fsrs,
    Rating,
    type Card,
    type CardInput,
    type IPreview,
  } from "ts-fsrs";
  import type { PageProps } from "./$types";
  import Container from "$lib/components/Container.svelte";
  import {
    addToast,
    listCardContent,
    listCardCount,
  } from "$lib/store/layoutstore";
  import { onMount } from "svelte";
  import BiTranslate from "~icons/bi/translate";
  import FluentList20Filled from "~icons/fluent/list-20-filled";

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

  onMount(() => {
    getList();
  });

  async function getList() {
    const now = new Date().toISOString();
    const { data } = await layoutData.supabase
      .from("memories_table")
      .select("*")
      .lte("due", now)
      .order("due", { ascending: true })
      .limit(30);
    if (data && data.length === 0) {
      const { data } = await layoutData.supabase
        .from("memories_table")
        .select("*")
        .is("due", null)
        .order("created_at", { ascending: true })
        .limit(30);
      if (data) {
        $listCardContent = data;
      }
    } else if (data && data.length < 30) {
      const { data: dataMore } = await layoutData.supabase
        .from("memories_table")
        .select("*")
        .is("due", null)
        .order("created_at", { ascending: true })
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
    currentWord = $listCardContent[$listCardCount].word;
  }

  let previews = $state<IPreview>();

  function prepareCard() {
    if ($listCardContent.length === 0) return;
    const now = new Date();
    let { id, word, created_at, ...card } = $listCardContent[$listCardCount];
    if (!card.due) card = createEmptyCard();
    previews = scheduler.repeat(card, now);
  }

  async function handleRate(card: Card | CardInput) {
    const saved = scheduler.next(
      card,
      new Date(),
      Rating.Good,
      ({ card, log }) => ({
        card: {
          ...card,
          due: card.due.toISOString(),
          last_review: card.last_review?.toISOString() ?? null,
        },
      }),
    );

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
    const now = new Date();
    let diffMs = due.getTime() - now.getTime();

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
</script>

<svelte:head>
  <title>🌟</title>
  <meta name="spaced" content="Spaced Repetition!" />
</svelte:head>

<audio src={src0} bind:paused={paused0} preload="auto"></audio>

<Container>
  {#if $listCardContent.length}
    <div class="dark w-full min-h-74 rounded-2 p-6 flex items-center">
      {#if showTranslate}
        <p
          class="w-full break-words text-center text-21 font-500 uppercase leading-28"
        >
          {translateWord}
        </p>
      {:else}
        <p
          class="w-full break-words text-center font-constantine text-21 font-700 uppercase leading-28"
        >
          {currentWord}
        </p>
      {/if}
    </div>
  {/if}
  <div class="flex-1 w-full flex gap-3 items-end justify-end">
    <button class="btn-layout" onclick={getList}>
      <FluentList20Filled width="16" height="16" />
    </button>
    <button class=" btn-layout" onclick={handleShowTranslate}>
      <BiTranslate width="14" height="14" />
    </button>
  </div>
  {#if previews}
    <div class="w-full flex">
      <button
        class="bg-green-800/80 hover:bg-green-800 py-6 flex flex-col flex-1 items-center justify-center gap-3"
        onclick={(e) => {
          e.currentTarget.blur();
          handleRate(previews![1].card);
        }}
      >
        <div class="w-full text-14 leading-18 text-center">
          {calculateTimeDiff(previews[1].card.due)}
        </div>
        <div class="h-24 w-full uppercase text-18 leading-18 font-600">
          Again
        </div>
      </button>
      <button
        class="bg-green-600/80 hover:bg-green-600 py-6 flex flex-col flex-1 items-center justify-center gap-3"
        onclick={(e) => {
          e.currentTarget.blur();
          handleRate(previews![2].card);
        }}
      >
        <div class="w-full text-14 leading-18 text-center">
          {calculateTimeDiff(previews[2].card.due)}
        </div>
        <div class="h-24 w-full uppercase text-18 leading-18 font-600">
          Hard
        </div>
      </button>
      <button
        class="bg-green-400/80 hover:bg-green-400 py-6 flex flex-col flex-1 items-center justify-center gap-3"
        onclick={(e) => {
          e.currentTarget.blur();
          handleRate(previews![3].card);
        }}
      >
        <div class="w-full text-14 leading-18 text-center">
          {calculateTimeDiff(previews[3].card.due)}
        </div>
        <div class="h-24 w-full uppercase text-18 leading-18 font-600">
          Good
        </div>
      </button>
      <button
        class="bg-green-200/80 hover:bg-green-200 py-6 flex flex-col flex-1 items-center justify-center gap-3"
        onclick={(e) => {
          e.currentTarget.blur();
          handleRate(previews![4].card);
        }}
      >
        <div class="w-full text-14 leading-18 text-center">
          {calculateTimeDiff(previews[4].card.due)}
        </div>
        <div class="h-24 w-full uppercase text-18 leading-18 font-600">
          Easy
        </div>
      </button>
    </div>
  {/if}
</Container>

<style lang="postcss">
  .btn-layout {
    @apply size-18 flex items-center justify-center outline-none bg-white/15 border border-white/10 text-black text-12 leading-18 rounded-2 hover:bg-white/30;
    backdrop-filter: blur(12px);
  }
</style>
