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
  import {
    listContent,
    quizRender,
    listCount,
    totalMemories,
    updateTodayScheduleLocal,
    currentSchedule,
    startCountdown,
  } from "$lib/store/navstore";
  import { fade, fly, slide } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import arrayShuffle from "array-shuffle";

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
    if ($listContent.length === 0) return;
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
        if ($currentSchedule && $currentSchedule.count < 11) {
          startCountdown(5);
        }
      }, 1000);
    }
  }

  // handlecheck
  async function handleCheckQuizWord() {
    if (!$quizRender) return;
    if ($quizRender.number > 1) {
      fetch(`/server/checkword?id=${$quizRender.id}`);
    } else {
      const response = await fetch(
        `/server/archiveword?word=${$quizRender.word}&id=${$quizRender.id}`
      );
      if (response.status == 201) $totalMemories += 1;
    }
  }
</script>

<svelte:head>
  <title>🤔</title>
  <meta name="Quiz" content="Some Quiz" />
</svelte:head>
🤔
<audio {src} bind:paused></audio>

{#if $quizRender}
  <main class="w-content h-[calc(100%-42px)] flex flex-col">
    <div
      class="mx-auto mb-18 mt-27 h-[120px] w-2/3 relative flex no-scrollbar layout-light select-none items-center overflow-hidden rounded-3 !backdrop-blur-lg"
    >
      <h1
        class="absolute left-1/2 -translate-x-1/2 -top-9 bg-transparent text-center text-[168px] leading-[115px] text-white/20"
      >
        {$quizRender.number}
      </h1>
      <p
        class=" text-white bg-black/60 shadow-lg pb-3 shadow-black/60 backdrop-blur-xl w-full text-center"
      >
        {$quizRender.meanings.flatMap((item) => item.translation).join(", ")}
      </p>
    </div>

    <div class="bg-transparent no-scrollbar w-2/3 outline-none mx-auto">
      {#each options as item}
        <button
          class={submitted
            ? item == value
              ? item === $quizRender.word
                ? "quiz-choice-true"
                : "quiz-choice-false"
              : item === $quizRender.word
                ? "quiz-choice-true"
                : "quiz-choice"
            : "quiz-choice"}
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
    @apply relative mb-9 cursor-pointer w-full select-none overflow-hidden rounded-6 border-y border-b-white/10 border-t-white/15 bg-black/10 py-3 text-center text-15 leading-21 text-white shadow-md shadow-black/30 backdrop-blur-lg transition duration-100 hover:bg-black/15;
    text-shadow: 0 1px 3px black;
  }

  .quiz-choice-true {
    @apply relative mb-9 cursor-default w-full select-none overflow-hidden rounded-6 border-y border-b-white/10 border-t-white/15 !bg-green-400 py-3 text-center text-15 leading-21 text-white shadow-sm shadow-black/45 backdrop-blur-lg transition;
    text-shadow: 0 1px 3px black;
  }

  .quiz-choice-false {
    @apply relative mb-9 cursor-default w-full select-none overflow-hidden rounded-6 border-y border-b-white/10 border-t-white/15 !bg-red-500 py-3 text-center text-15 leading-21 text-white shadow-sm shadow-black/45 backdrop-blur-lg transition;
    text-shadow: 0 1px 3px black;
  }
</style>
