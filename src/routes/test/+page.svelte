<script lang="ts">
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import TickFlip from "$lib/components/TickFlip.svelte";
  import { toast } from "svelte-sonner";

  let flipNumber = $state<number>(0);

  function name() {
    toast.error("Error", {
      description: "erorrrrrr",
      class: "my-toast my-toast-error",
    });
  }

  function selectOnMount(node: any) {
    node.focus();
  }

  let srcImg = $state<string>("");
  let aa =
    "https://media.gettyimages.com/id/672158567/photo/mixed-race-boy-drawing-on-wall-with-crayons.jpg?s=612x612&w=0&k=20&c=zdIBiYAzhw7hwbYjtBJGZ3dKVcVBdbqy4BriH7vhNTs=";
  const bb =
    "https://media.gettyimages.com/id/1455246045/photo/instrument-screens-in-cockpit-flight-deck-of-a-commercial-aircraft.jpg?s=612x612&w=0&k=20&c=hBJo1owekOlSh7d6bbfRuKx5iJhJfKqt9lJf5q-fRXg=";
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full bg-white z-10 flex justify-center items-start"
>
  <div class="relative flex gap-2 font-helvetica text-36 font-600 leading-36">
    <TickFlip number={Math.floor(flipNumber / 100)} delay={300} />
    <TickFlip number={Math.floor((flipNumber % 100) / 10)} delay={150} />
    <TickFlip number={flipNumber % 10} image={flipNumber === 0} />
  </div>

  <div class="relative w-[382px] h-215 rounded-2 overflow-hidden">
    {#key srcImg}
      <ImageLoader width={382} height={215} imageSrc={srcImg} />
    {/key}
  </div>

  <div class="absolute bottom-0 flex justify-center gap-3">
    <button onclick={() => (srcImg = "")} class=" text-white bg-black px-6">
      delete src
    </button>
    <button onclick={() => (srcImg = aa)} class=" text-white bg-black px-6">
      change src aa
    </button>
    <button onclick={() => (srcImg = bb)} class=" text-white bg-black px-6">
      change src bb
    </button>
    <button
      onclick={() => (flipNumber = 100)}
      class=" text-white bg-black px-6"
    >
      100
    </button>
    <button
      onclick={() => (flipNumber = 123)}
      class=" text-white bg-black px-6"
    >
      123
    </button>
    <button
      onclick={() => (flipNumber = 623)}
      class=" text-white bg-black px-6"
    >
      623
    </button>
    <button
      onclick={() => (flipNumber = 912)}
      class=" text-white bg-black px-6"
    >
      912
    </button>
  </div>
</div>

<style lang="postcss">
</style>
