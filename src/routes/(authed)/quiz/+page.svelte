<script lang="ts">
  import { untrack } from "svelte";
  import {
    listContent,
    quizRender,
    listCount,
    totalMemories,
    updateTodayScheduleLocal,
    currentSchedule,
    showTimer,
  } from "$lib/store/navstore";
  import arrayShuffle from "array-shuffle";
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import { timerString } from "$lib/store/layoutstore";

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
        if ($currentSchedule && $currentSchedule.count < 11) {
          $showTimer = true;
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
  {#if $showTimer}
    <title>🤔 {$timerString}</title>
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
      class="my-9 min-h-[120px] w-2/3 mx-auto relative flex no-scrollbar layout-light select-none items-center overflow-hidden rounded-3 !backdrop-blur-lg"
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
                ? "quiz-choice-true"
                : "quiz-choice-false"
              : item === $quizRender.word
                ? "quiz-choice-true"
                : "quiz-choice"
            : "quiz-choice"}
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
    @apply relative mb-9 cursor-pointer w-full select-none overflow-hidden rounded-6 border-y border-b-white/10 border-t-white/15 bg-black/10 py-3 text-center text-15 leading-21 text-white shadow-md shadow-black/30 backdrop-blur-lg hover:bg-black/15 transition-all sm:hover:text-16 hover:text-15;
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
