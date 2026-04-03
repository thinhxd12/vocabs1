<script lang="ts">
  import { onMount } from "svelte";
  import {
    listContent,
    quizRender,
    listCount,
    updateTodayScheduleLocal,
    showTimer,
    handleCheckWord,
  } from "$lib/store/navstore";
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import { shuffle } from "$lib/utils/functions";
  import Container from "$lib/components/Container.svelte";
  import { fade } from "svelte/transition";
  import Flip from "$lib/components/Flip.svelte";

  let src0 = $state<string>("");
  let paused0 = $state<boolean>(true);
  let src1 = $state<string>("");
  let paused1 = $state<boolean>(true);
  let value = $state("");
  let options = $state<string[]>([]);
  let submitted = $state<boolean>(false);
  let answer = $state<string>("");
  let flipNumber = $state<number>(0);

  onMount(() => {
    if ($listContent.length) {
      $quizRender = $listContent[$listCount];
      flipNumber = $quizRender.number;
      createOptions();
      submitted = false;
    }
  });

  function createOptions() {
    answer = "";
    if ($listContent.length === 0 || !$quizRender) return;
    let sound = $quizRender!.meanings
      .flatMap((item) => item.translation)
      .join(", ");
    src0 = `https://vocabs3.vercel.app/speech?text=${sound}`;
    paused0 = false;
    const filterdOptions = $listContent.filter(
      (choice) => choice.id !== $quizRender!.id,
    );
    let randomChoices = shuffle(filterdOptions).slice(0, 3);
    randomChoices = shuffle([...randomChoices, $quizRender!]);
    options = randomChoices.map((item) => item.word);
  }

  function submitAnswer(answer: string) {
    submitted = true;
    if (!$quizRender) return;
    if (answer === $quizRender.word) {
      handleCheckWord($quizRender);
      flipNumber = $quizRender.number - 1;
      src1 = $quizRender.audio;
      paused1 = false;
    } else {
      src1 = "/sounds/mp3_Boing.mp3";
      paused1 = false;
    }
  }

  async function endQuiz() {
    $listContent = [];
    $listCount = 0;
    updateTodayScheduleLocal();
  }

  function handleSetNextLearningWord() {
    $listCount++;
    if ($listCount < $listContent.length) {
      submitted = false;
      $quizRender = $listContent[$listCount];
      flipNumber = $quizRender!.number;
      createOptions();
    } else {
      src0 = "/sounds/mp3_Ding.mp3";
      paused0 = false;
      submitted = false;
      $quizRender = undefined;
      endQuiz();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      e.metaKey ||
      answer === $quizRender?.word
    )
      return;

    switch (true) {
      case e.key === "Backspace":
        answer = answer.slice(0, -1);
        break;
      case /^[A-Za-z\-]$/.test(e.key):
        answer += e.key.toLowerCase();
        if (answer === $quizRender!.word) {
          submitAnswer(answer);
        }
        break;
      case e.key === " ":
        answer = "";
        break;
      default:
        break;
    }
  }
</script>

<svelte:head>
  {#if !$showTimer}
    <title>🤔</title>
  {/if}
  <meta name="Quiz" content="Some Quiz" />
</svelte:head>

<audio src={src0} bind:paused={paused0} preload="auto"></audio>
<audio
  src={src1}
  bind:paused={paused1}
  preload="auto"
  onended={handleSetNextLearningWord}
></audio>

{#if $quizRender}
  <Container>
    <Flip {flipNumber} />

    <div
      class="relative h-[calc(100vh-150px-100px-42px)] w-full flex flex-col gap-2 overflow-y-scroll no-scrollbar"
    >
      {#each $quizRender.meanings as entry}
        {#each entry.definitions as el}
          {#if el.image}
            {#if el.image}
              <div class="relative w-full h-215 rounded-2 overflow-hidden">
                {#key el.image}
                  <ImageLoader width={382} height={215} imageSrc={el.image} />
                {/key}
              </div>
            {/if}
          {/if}
        {/each}
      {/each}

      <div
        class="absolute py-3 z-30 text-white bg-black/60 shadow-md shadow-black/30 w-full"
      >
        {#if $quizRender.meanings.flatMap((item) => item.synonyms).length}
          {#each $quizRender.meanings as item}
            {#if item.synonyms.length}
              <p class="mb-3 px-6 leading-18">
                <i>{item.partOfSpeech}:</i>
                {item.synonyms.join(", ")}
              </p>
            {/if}
          {/each}
        {:else}
          {#each $quizRender.meanings as item}
            {#if item.translation.length}
              <p class="mb-3 px-6 leading-18">
                <i>{item.partOfSpeech}:</i>
                {item.translation.join(", ")}
              </p>
            {/if}
          {/each}
        {/if}
      </div>
    </div>

    <div
      class="relative no-scrollbar w-full outline-none mx-auto grid grid-cols-2 grid-rows-2 gap-2"
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

      {#if answer}
        <div
          class="dark absolute top-1/2 left-0 w-full -translate-y-1/2 text-center font-constantine text-21 font-700 uppercase leading-36 text-white shadow-md shadow-black/60"
          transition:fade={{ duration: 150 }}
        >
          {answer}
        </div>
      {/if}
    </div>
  </Container>
{/if}

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .quiz-choice {
    @apply cursor-pointer w-full h-48 rounded-2 select-none overflow-hidden text-center text-14 leading-21 hover:!bg-white/40 transition-all font-400;
  }

  .quiz-choice-true {
    @apply cursor-pointer w-full h-48 rounded-2 select-none overflow-hidden text-center text-14 leading-21 !bg-green-400/60 font-400;
  }

  .quiz-choice-false {
    @apply cursor-pointer w-full h-48 rounded-2 select-none overflow-hidden text-center text-14 leading-21 !bg-red-500/60 font-400;
  }
</style>
