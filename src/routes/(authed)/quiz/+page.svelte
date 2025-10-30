<script lang="ts">
  import { untrack } from "svelte";
  import {
    listContent,
    quizRender,
    listCount,
    updateTodayScheduleLocal,
    showTimer,
  } from "$lib/store/navstore";
  import arrayShuffle from "array-shuffle";
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import { timerString } from "$lib/store/layoutstore";
  import { archiveVocab } from "$lib/functions";
  import { page } from "$app/state";

  let src0 = $state<string>("");
  let paused0 = $state<boolean>(true);
  let src1 = $state<string>("");
  let paused1 = $state<boolean>(true);
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
    let sound = $quizRender!.meanings
      .flatMap((item) => item.translation)
      .join(", ");
    src0 = `https://vocabs3.vercel.app/speech?text=${sound}`;
    paused0 = false;
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
      src1 = $quizRender.audio;
      paused1 = false;
    } else {
      src1 = "/sounds/mp3_Boing.mp3";
      paused1 = false;
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
        src1 = "/sounds/mp3_Ding.mp3";
        paused1 = false;
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
<audio src={src0} bind:paused={paused0}></audio>
<audio src={src1} bind:paused={paused1}></audio>

{#if $quizRender}
  <main
    class="w-content h-[calc(100vh-42px)] flex flex-col overflow-y-scroll no-scrollbar"
  >
    <div
      class="my-6 min-h-[120px] w-full mx-auto relative flex no-scrollbar layout-black select-none items-center overflow-hidden rounded-3 !backdrop-blur-lg"
    >
      <h1
        class="absolute left-1/2 -translate-x-1/2 bg-transparent text-center text-[168px] leading-[120px] text-white/30 font-200"
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
                width={378}
                height={213}
                imageSrc={el.image}
                hash={el.hash}
                word={$quizRender}
                className="mb-6 shadow-sm shadow-black/45 rounded-3"
              />
            {/if}
          {/if}
        {/each}
      {/each}
    </div>

    <div
      class="bg-transparent no-scrollbar w-full mb-3 outline-none mx-auto grid grid-cols-2 grid-rows-2 gap-3"
    >
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
    @apply cursor-pointer w-full h-[48px] select-none overflow-hidden rounded-3 text-center text-14 leading-21 hover:!bg-white/30 transition-all text-black/90 font-400;
  }

  .quiz-choice-true {
    @apply cursor-pointer w-full h-[48px] select-none overflow-hidden rounded-3 text-center text-14 leading-21 !bg-green-400/60 text-black/90 font-400;
  }

  .quiz-choice-false {
    @apply cursor-pointer w-full h-[48px] select-none overflow-hidden rounded-3 text-center text-14 leading-21 !bg-red-500/60 text-black/90 font-400;
  }
</style>
