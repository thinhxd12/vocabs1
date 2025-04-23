<script lang="ts">
  import { untrack } from "svelte";
  import {
    listContent,
    quizRender,
    listCount,
    totalMemories,
    updateTodayScheduleLocal,
    showTimer,
  } from "$lib/store/navstore";
  import arrayShuffle from "array-shuffle";
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import { timerString } from "$lib/store/layoutstore";
  import { archiveVocab } from "$lib/functions";
  import type { PageProps } from "./$types";
  import { page } from "$app/state";

  let src = $state<string>("");
  let paused = $state<boolean>(true);
  let value = $state("");
  let options = $state<string[]>([]);
  let submitted = $state<boolean>(false);

  $effect(() => {
    const v = $listContent;
    untrack(() => {
      setTimeout(() => {
        createOptions();
        submitted = false;
      }, 500);
    });
  });

  function createOptions() {
    if ($listContent.length === 0 || !$quizRender) return;
    const filterdOptions = $listContent.filter(
      (choice) => choice.id !== $quizRender!.id
    );
    let randomChoices = arrayShuffle(filterdOptions).slice(0, 3);
    randomChoices = arrayShuffle([...randomChoices, $quizRender!]);
    options = randomChoices.map((item) => item.word);
  }

  function submitAnswer(answer: string) {
    value = answer;
    submitted = true;
    if (!$quizRender) return;
    if (value == $quizRender.word) {
      handleCheckQuizWord();
      $quizRender = { ...$quizRender, number: $quizRender.number - 1 };
      src = $quizRender.audio;
      paused = false;
    } else {
      src = "/sounds/mp3_Boing.mp3";
      paused = false;
    }
    $listCount += 1;
    if ($listCount < $listContent.length) {
      setTimeout(() => {
        submitted = false;
        $quizRender = $listContent[$listCount];
        createOptions();
      }, 1000);
    } else {
      setTimeout(async () => {
        src = "/sounds/mp3_Ding.mp3";
        paused = false;
        $quizRender = undefined;
        $listContent = [];
        $listCount = 0;
        submitted = false;
        updateTodayScheduleLocal();
      }, 1000);
    }
  }

  // handlecheck
  async function handleCheckQuizWord() {
    if (!$quizRender) return;
    if ($quizRender.number > 1) {
      await page.data.supabase
        .from("vocab_table")
        .update({ number: $quizRender.number - 1 })
        .eq("id", $quizRender.id);
    } else {
      await archiveVocab($quizRender.id, $quizRender.word, page.data.supabase);
    }
  }
</script>

<svelte:head>
  {#if $showTimer}
    <title>🤔 {$timerString}</title>
  {:else if $listCount}
    <title>🤔 {Math.floor(($listCount / $listContent.length) * 100)}%</title>
  {:else}
    <title>🤔</title>
  {/if}

  <meta name="Quiz" content="Some Quiz" />
</svelte:head>
<audio {src} bind:paused></audio>

{#if $quizRender}
  <main
    class="w-content h-[calc(100vh-42px)] flex flex-col overflow-y-scroll no-scrollbar"
  >
    <div
      class="my-9 min-h-[120px] w-2/3 mx-auto relative flex no-scrollbar layout-black select-none items-center overflow-hidden rounded-3 !backdrop-blur-lg"
    >
      <h1
        class="absolute left-1/2 -translate-x-1/2 bg-transparent text-center text-[168px] leading-[120px] text-white/20 font-200"
      >
        {$quizRender.number}
      </h1>
      <p
        class=" text-white bg-black/60 shadow-lg pb-3 shadow-black/60 backdrop-blur-xl w-full text-center"
      >
        {$quizRender.meanings.flatMap((item) => item.translation).join(", ")}
      </p>
    </div>
    <div class="flex flex-1 flex-col mx-auto overflow-y-scroll no-scrollbar">
      {#each $quizRender.meanings as entry}
        {#each entry.definitions as el}
          {#if el.image}
            {#if el.image}
              <ImageLoader
                width={252}
                height={142}
                imageSrc={el.image}
                hash={el.hash}
                word={$quizRender}
                className="mb-9 shadow-sm shadow-black/45"
              />
            {/if}
          {/if}
        {/each}
      {/each}
    </div>

    <div class="bg-transparent no-scrollbar w-2/3 outline-none mx-auto">
      {#each options as item}
        <button
          class={submitted
            ? item == value
              ? item === $quizRender.word
                ? "layout-white quiz-choice-true"
                : "layout-white quiz-choice-false"
              : item === $quizRender.word
                ? "layout-white quiz-choice-true"
                : "layout-white quiz-choice"
            : "layout-white quiz-choice"}
          disabled={submitted}
          onclick={() => submitAnswer(item)}
        >
          {item}
        </button>
      {/each}
    </div>
  </main>
{/if}

<style>
  .quiz-choice {
    @apply mb-9 cursor-pointer w-full select-none overflow-hidden rounded-3 text-white py-3 text-center text-15 leading-21 !bg-white/5 hover:!bg-white/15 transition-all;
  }

  .quiz-choice-true {
    @apply mb-9 cursor-pointer w-full select-none overflow-hidden rounded-3 text-white py-3 text-center text-15 leading-21 !bg-green-400;
  }

  .quiz-choice-false {
    @apply mb-9 cursor-pointer w-full select-none overflow-hidden rounded-3 text-white py-3 text-center text-15 leading-21 !bg-red-500;
  }
</style>
