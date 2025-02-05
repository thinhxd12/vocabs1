<script lang="ts">
  import "../app.css";
  import { layoutImage, showLayout } from "$lib/store/layoutstore";
  let { children } = $props();
  import { innerWidth } from "svelte/reactivity/window";
  import { onMount } from "svelte";
  import { getSpotlightImage_v5 } from "$lib/functions";
  onMount(async () => {
    $layoutImage = await getSpotlightImage_v5();
  });
</script>

<main class="h-screen w-screen relative bg-cover">
  {#if innerWidth.current && innerWidth.current > 600}
    {#if $layoutImage}
      <img
        src={$layoutImage.image_L}
        alt="bg"
        class="w-full h-full object-cover absolute"
      />
      {#if !$showLayout}
        <div
          class="group absolute left-0 top-0 z-50 hidden w-[calc(50vw-215px)] md:block"
        >
          <p
            style="text-shadow: 0 0 3px black;"
            class="absolute left-0 top-0 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white opacity-100 transition group-hover:opacity-0"
          >
            {@html $layoutImage.hs1_title}
          </p>
          <p
            style="text-shadow: 0 0 3px black;"
            class="absolute left-0 top-0 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white opacity-0 transition group-hover:opacity-100"
          >
            {@html $layoutImage.hs2_title}
          </p>
        </div>
      {/if}
    {/if}
  {:else if $layoutImage}
    <img
      src={$layoutImage.image_P}
      alt="bg"
      class="w-full h-full object-cover absolute"
    />
  {/if}

  {@render children()}
</main>
