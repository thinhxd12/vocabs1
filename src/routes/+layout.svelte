<script lang="ts">
  import "../app.css";
  import {
    handleChangeLayoutImage,
    layoutImage,
    showLayout,
  } from "$lib/store/layoutstore";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { schedule } from "$lib/store/navstore";

  let { children } = $props();

  onMount(() => {
    handleChangeLayoutImage();
  });

  $schedule = page.data.schedule;
</script>

<main class="h-screen w-screen relative bg-cover overflow-hidden">
  {#if $layoutImage}
    <img
      src={$layoutImage.url}
      alt="bg"
      class="w-full h-full object-cover absolute"
    />
    {#if !$showLayout}
      <p
        style="text-shadow: 0 0 3px black;"
        class="absolute w-[calc(50vw-215px)] hidden md:block left-0 bottom-6 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white"
      >
        {@html $layoutImage.title}
      </p>
    {/if}
  {/if}

  {@render children()}
</main>
