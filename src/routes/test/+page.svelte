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

  let dum = `<h1>Introduction to Programming</h1>
        <p>Programming is a way to talk to computers. A language like Hindi, English, or Bengali can be used to talk to a human, but for computers, we need straightforward instructions.</p>
        <h2>Computer is Dumb!</h2>
        <p>When was the last time you ordered some cereal and got DVDs of a serial?</p>`;

  import TwitterIcon from "~icons/devicon/twitter";
  import PhSolarRoofDuotone from '~icons/ph/solar-roof-duotone';
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<section
  class="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pt-60 px-60 pb-90 z-[5]"
>
  <button class="text-white text-36 absolute bottom-0" onclick={name}>
    <PhSolarRoofDuotone width={24} height={24}/>
    <!-- <iconify-icon icon="ph:solar-roof-duotone" width="256" height="256"></iconify-icon> -->
  </button>
</section>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
</style>
