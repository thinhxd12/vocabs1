<script lang="ts">
  import {
    createEmptyCard,
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
    scheduler,
    timezone,
  } from "$lib/store/layoutstore";
  import BiTranslate from "~icons/bi/translate";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import type { WikiTranslationType } from "$lib/types";
  import { format } from "date-fns";
  import { enhance } from "$app/forms";
  import { saveUserSetting } from "$lib/store/localstore";
  import RiMagicFill from "~icons/ri/magic-fill";
  import PhListStar from "~icons/ph/list-star";
  import MaterialSymbolsVolumeUpRounded from "~icons/material-symbols/volume-up-rounded";
  import Circle from "$lib/components/Circle.svelte";

  let { data: layoutData }: PageProps = $props();
  let src0 = $state<string>("");
  let currentWord = $state<string>("");
  let paused0 = $state<boolean>(true);
  let translations = $state<WikiTranslationType[]>([]);
  let showTranslate = $state<boolean>(false);
  let activedButton = $state<number>(0);
  let startTime = $state<number>(0);
  const NUMBER_WORDS = 24;

  onMount(() => {
    if ($listCardContent.length) {
      currentWord = $listCardContent[$listCardCount].word;
      translations = [];
      showTranslate = false;
      prepareCard();
    }
  });

  async function getList() {
    $listCardContent = [];
    const now = new Date().getTime();
    const { data } = await layoutData.supabase
      .from("memories_table")
      .select("*")
      .order("due")
      .lte("due", now)
      .gt("due", 0)
      .limit(NUMBER_WORDS);
    if (data && data.length === 0) {
      const { data } = await layoutData.supabase
        .from("memories_table")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("due", 0)
        .limit(NUMBER_WORDS);
      if (data) {
        $listCardContent = data;
      }
    } else if (data && data.length < NUMBER_WORDS) {
      const { data: dataMore } = await layoutData.supabase
        .from("memories_table")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("due", 0)
        .limit(NUMBER_WORDS - data.length);
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
    previews = $scheduler.repeat(card, new Date());
    startTime = Date.now();
  }

  async function handleRate(card: Card | CardInput, rate: Grade) {
    const saved = $scheduler.next(card, new Date(), rate, ({ card, log }) => ({
      card: {
        ...card,
        due: card.due.getTime(),
        last_review: card.last_review?.getTime() ?? null,
      },
      log: {
        ...log,
        due: log.due.getTime(),
        review: log.review.getTime(),
      },
    }));

    // SaveCard
    const { error } = await layoutData.supabase
      .from("memories_table")
      .update({
        ...saved.card,
      })
      .eq("id", $listCardContent[$listCardCount].id);
    if (error)
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });

    // SaveLog
    const duration = Date.now() - startTime;
    const { error: errorLog } = await layoutData.supabase
      .from("reviewlogs_table")
      .insert({
        review_time: saved.log.review,
        card_id: $listCardContent[$listCardCount].id,
        review_rating: saved.log.rating,
        review_duration: duration,
        review_state: saved.log.state,
      });
    if (errorLog)
      addToast({
        type: "error",
        title: "Error!",
        message: errorLog.message as string,
      });

    handleSetNextWord();
  }

  function handleSetNextWord() {
    $listCardCount++;
    if ($listCardCount < $listCardContent.length) {
      currentWord = $listCardContent[$listCardCount].word;
      translations = [];
      showTranslate = false;
      prepareCard();
    } else {
      src0 = "/sounds/mp3_Ding.mp3";
      paused0 = false;
      currentWord = "";
      translations = [];
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
    if (translations.length === 0 && currentWord !== "") {
      const url = `/server/getwiktionary?word=${currentWord}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.length) {
        translations = data;
      } else {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=vi&q=${currentWord}`;
        const response = await fetch(url);
        const data = await response.json();
        translations = [
          {
            partOfSpeech: "Translation",
            translation: [data[0][0]],
          },
        ];
      }
    }
  }

  async function handlePlayAudio() {
    paused0 = true;
    src0 = `https://vocabs3.vercel.app/public/speech?text=${currentWord}`;
    paused0 = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
    switch (true) {
      case e.key === " ":
        handleShowTranslate();
        if (showTranslate) {
          handlePlayAudio();
        }
        break;
      case e.key === "1":
        handleRate(previews![Rating.Again].card, Rating.Again);
        activedButton = 1;
        break;
      case e.key === "2":
        handleRate(previews![Rating.Hard].card, Rating.Hard);
        activedButton = 2;
        break;
      case e.key === "3":
        handleRate(previews![Rating.Good].card, Rating.Good);
        activedButton = 3;
        break;
      case e.key === "4":
        handleRate(previews![Rating.Easy].card, Rating.Easy);
        activedButton = 4;
        break;
      default:
        break;
    }
    setTimeout(() => {
      activedButton = 0;
    }, 150);
  }

  async function setFSRSparams(data: number[]) {
    const { error } = await layoutData.supabase
      .from("dashboard_table")
      .update({ fsrsparams: JSON.stringify(data) })
      .eq("user", "thinh");
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      saveUserSetting();
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      startTime = Date.now();
    }
  }
</script>

<svelte:head>
  <title>❔</title>
  <meta name="fsrs" content="Free Spaced Repetition Scheduler!" />
</svelte:head>

<svelte:document onvisibilitychange={handleVisibilityChange} />

<audio src={src0} bind:paused={paused0} preload="auto"></audio>

<Container fullscreen>
  <div class="w-[368px] flex-1 flex justify-end items-start gap-3 pt-3">
    <form
      method="post"
      action="?/optimize"
      use:enhance={({ formElement, formData, action, cancel }) => {
        return async ({ result, update }) => {
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
              message: "Optimize successfully.",
            });
            setFSRSparams((result.data?.data as any)?.parameters);
          }
        };
      }}
    >
      <input
        type="text"
        name="tz"
        autocomplete="off"
        value={$timezone}
        hidden
      />
      <button
        class="setting-button"
        type="submit"
        onclick={(e) => {
          e.currentTarget.blur();
        }}
      >
        <RiMagicFill width="14" height="14" />
      </button>
    </form>

    <button
      class="setting-button"
      onclick={(e) => {
        e.currentTarget.blur();
        getList();
      }}
    >
      <PhListStar width="14" height="14" />
    </button>

    <div class="flex-1"></div>

    {#if currentWord !== ""}
      <button
        class="setting-button"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowTranslate();
        }}
      >
        <BiTranslate width="14" height="14" />
      </button>

      <button
        class="setting-button"
        onclick={(e) => {
          e.currentTarget.blur();
          handlePlayAudio();
        }}
      >
        <MaterialSymbolsVolumeUpRounded width="14" height="14" />
      </button>
    {/if}
  </div>

  <div class="flex-1 w-full flex items-center justify-center">
    <Circle>
      <div class="w-full h-full">
        {#if showTranslate && translations.length}
          <div
            class="relative z-3 text-white w-full h-full overflow-y-scroll no-scrollbar px-15 pt-90 pb-15"
            style="text-shadow: 0 0 3px black;"
          >
            {#each translations as item}
              <h3
                class="text-16 font-800 leading-24 italic [&:not(:first-of-type)]:mt-9"
              >
                {item.partOfSpeech}
              </h3>
              {#each item.translation as el}
                <p class="text-13 leading-18 indent-15 font-500">{el}</p>
              {/each}
            {/each}
          </div>
        {:else if currentWord}
          <div
            class="relative z-3 text-white w-full h-full flex items-center justify-center"
            style="text-shadow: 0 0 3px black;"
          >
            {#key currentWord}
              <p
                class="w-full break-words text-center font-constantine text-30 font-700 uppercase leading-36"
                in:fly={{ y: -30, duration: 600 }}
              >
                {currentWord}
              </p>
            {/key}

            <p
              class="absolute bottom-1 left-0 right-0 text-11 leading-15 font-500 text-center"
            >
              {format(
                $listCardContent[$listCardCount].created_at,
                "cccc, yyyy-MM-dd' at 'p",
              )}
            </p>
          </div>
        {/if}
      </div>
    </Circle>
  </div>

  <div class="w-main flex-1 flex items-end">
    <div class="w-full flex overflow-hidden gap-2">
      {#if previews}
        <button
          class="bg-green-900/60 btn-main"
          class:btnActive={activedButton === 1}
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Again].card, Rating.Again);
          }}
        >
          <div class="w-full text-11 leading-14 text-center">
            {calculateTimeDiff(previews[Rating.Again].card.due)}
          </div>
          <div class="w-full uppercase text-14 leading-18 font-600">Again</div>
        </button>
        <button
          class="bg-green-600/60 btn-main"
          class:btnActive={activedButton === 2}
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Hard].card, Rating.Hard);
          }}
        >
          <div class="w-full text-11 leading-14 text-center">
            {calculateTimeDiff(previews[Rating.Hard].card.due)}
          </div>
          <div class="w-full uppercase text-14 leading-18 font-600">Hard</div>
        </button>
        <button
          class="bg-green-400/60 btn-main"
          class:btnActive={activedButton === 3}
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Good].card, Rating.Good);
          }}
        >
          <div class="w-full text-11 leading-14 text-center">
            {calculateTimeDiff(previews[Rating.Good].card.due)}
          </div>
          <div class="w-full uppercase text-14 leading-18 font-600">Good</div>
        </button>
        <button
          class="bg-green-100/60 btn-main"
          class:btnActive={activedButton === 4}
          onclick={(e) => {
            e.currentTarget.blur();
            handleRate(previews![Rating.Easy].card, Rating.Easy);
          }}
        >
          <div class="w-full text-11 leading-14 text-center">
            {calculateTimeDiff(previews[Rating.Easy].card.due)}
          </div>
          <div class="w-full uppercase text-14 leading-18 font-600">Easy</div>
        </button>
      {/if}
    </div>
  </div>
</Container>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .btn-main {
    @apply hover:brightness-[1.1] active:scale-95 flex flex-col flex-1 items-center justify-center py-2 rounded-2 border border-white/10;
    backdrop-filter: blur(9px);
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
  }

  .btnActive {
    @apply scale-95 brightness-[1.1];
  }

  .setting-button {
    @apply size-18 flex items-center justify-center outline-none bg-white/15 border border-white/10 text-black text-12 leading-18 rounded-2 hover:bg-white/30;
    backdrop-filter: blur(12px);
  }
</style>
