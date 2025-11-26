<script lang="ts">
  import { onDestroy, untrack } from "svelte";
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
  import { archiveVocab } from "$lib/utils/functions";
  import { page } from "$app/state";
  import Container from "$lib/components/Container.svelte";

  let src0 = $state<string>("");
  let paused0 = $state<boolean>(true);
  let src1 = $state<string>("");
  let paused1 = $state<boolean>(true);
  let value = $state("");
  let options = $state<string[]>([]);
  let submitted = $state<boolean>(false);
  let timeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    const v = $listContent;
    untrack(() => {
      timeout = setTimeout(() => {
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
      timeout = setTimeout(() => {
        submitted = false;
        $quizRender = $listContent[$listCount];
        createOptions();
      }, 1000);
    } else {
      timeout = setTimeout(async () => {
        src0 = "/sounds/mp3_Ding.mp3";
        paused0 = false;
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

  onDestroy(() => {
    clearTimeout(timeout);
  });
</script>

<svelte:head>
  {#if $showTimer && $timerString}
    <title>🤔 {$timerString}</title>
  {:else if $listCount}
    <title>🤔 {Math.floor(($listCount / $listContent.length) * 100)}%</title>
  {:else}
    <title>🤔</title>
  {/if}

  <meta name="Quiz" content="Some Quiz" />
</svelte:head>
<audio src={src0} bind:paused={paused0} preload="auto"></audio>
<audio src={src1} bind:paused={paused1} preload="auto"></audio>

{#if $quizRender}
  <Container zIndex={6}>
    <div
      class="min-h-[120px] w-full mx-auto relative flex no-scrollbar dark select-none items-center overflow-hidden rounded-2"
    >
      <h1
        class="absolute left-1/2 -translate-x-1/2 bg-transparent text-center text-[168px] leading-[120px] text-white/30 font-200"
      >
        {$quizRender.number}
      </h1>
      <p
        class=" text-white bg-black/60 shadow-lg pb-3 shadow-black/60 backdrop-blur-xl w-full text-center"
      >
        {#if $quizRender.meanings.flatMap((item) => item.synonyms).length}
          {$quizRender.meanings.flatMap((item) => item.synonyms).join(", ")}
        {:else}
          {$quizRender.meanings.flatMap((item) => item.translation).join(", ")}
        {/if}
      </p>
    </div>
    <div
      class="flex flex-1 flex-col mx-auto overflow-y-scroll no-scrollbar gap-2"
    >
      {#each $quizRender.meanings as entry}
        {#each entry.definitions as el}
          {#if el.image}
            {#if el.image}
              <ImageLoader
                width={382}
                height={215}
                imageSrc={el.image}
                hash={el.hash}
                word={$quizRender}
                className="rounded-2"
              />
            {/if}
          {/if}
        {/each}
      {/each}
    </div>

    <div
      class="bg-transparent no-scrollbar w-full outline-none mx-auto grid grid-cols-2 grid-rows-2 gap-2"
    >
      {#each options as item}
        <button
          class={submitted
            ? item == value
              ? item === $quizRender.word
                ? "light quiz-choice-true"
                : "light quiz-choice-false"
              : item === $quizRender.word
                ? "light quiz-choice-true"
                : "light quiz-choice"
            : "light quiz-choice"}
          disabled={submitted}
          onclick={() => submitAnswer(item)}
        >
          {item}
        </button>
      {/each}
    </div>
  </Container>
{/if}

<style>
  .quiz-choice {
    @apply cursor-pointer w-full h-[48px] select-none overflow-hidden text-center text-14 leading-21 hover:!bg-white/40 transition-all font-400;
  }

  .quiz-choice-true {
    @apply cursor-pointer w-full h-[48px] select-none overflow-hidden text-center text-14 leading-21 !bg-green-400/60 font-400;
  }

  .quiz-choice-false {
    @apply cursor-pointer w-full h-[48px] select-none overflow-hidden text-center text-14 leading-21 !bg-red-500/60 font-400;
  }
</style>
