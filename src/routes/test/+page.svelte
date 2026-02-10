<script lang="ts">
  import { sendNotification } from "$lib/store/navstore";
  import { fly } from "svelte/transition";

  const ratio = 1.61803398875;

  function name() {
    // sendNotification();
    count++;
  }
  function onKeyDown(e: KeyboardEvent) {}

  let count = $state(9);
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<section
  class="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pt-60 px-60 pb-90 z-[5]"
>
  <button class="text-white text-36 absolute bottom-0" onclick={name}>
    close
  </button>

  <div class="relative w-12 h-full flex flex-col">
    <div
      class="w-full h-14 flex justify-center text-9 leading-12 text-white/90 text-center overflow-hidden pt-2 bg-black/80 backdrop-blur-md"
    >
      {#key count}
        <span class="" in:fly={{ y: -12, duration: 150 }}>
          {count}
        </span>
      {/key}
    </div>
    <div
      class="w-full h-14 flex justify-center text-9 leading-12 text-white/90 text-center overflow-hidden bg-black/80 backdrop-blur-md"
    >
      {#key count}
        <span class="" in:fly={{ y: -12, duration: 150 }}>
          {count}
        </span>
      {/key}
    </div>
  </div>
</section>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
</style>
