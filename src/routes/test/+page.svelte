<script lang="ts">
  import type { ImageBackgroundType, ToastType } from "$lib/types";

  interface SpotlightImageBackgroundType extends ImageBackgroundType {
    nextIndex: string;
  }

  let image = $state<SpotlightImageBackgroundType | undefined>();

  async function name() {
    const response = await fetch(`/server/getwindows10spotlight`);
    const data = await response.json();
    if (data) image = data;
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full z-10 flex flex-col justify-center items-center"
>
  {#if image}
    <img src={image.url} alt="123" class="w-1/2 object-cover" />
    <p>{image.title}</p>
    <p>{image.place}</p>
  {/if}
  <div class="absolute bottom-0 flex justify-center gap-3">
    <button onclick={name} class=" text-white bg-black px-6"> click </button>
  </div>
</div>

<style lang="postcss">
</style>
