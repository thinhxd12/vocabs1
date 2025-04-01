<script lang="ts">
  import {
    layoutImage,
    showBookmark,
    showLayout,
  } from "$lib/store/layoutstore";
  import { showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import {
    currentSchedule,
    handleGetListContent,
    todaySchedule,
    showTimer,
  } from "$lib/store/navstore";
  import { innerWidth } from "svelte/reactivity/window";
  import { enhance } from "$app/forms";

  function handleGetList(numb: number) {
    $currentSchedule = numb === 0 ? $todaySchedule!.start : $todaySchedule!.end;
    handleGetListContent();
  }

  async function handleChangeLayoutImage() {
    const url =
      "https://bing.biturl.top/?resolution=UHD&format=json&index=random&mkt=en-IN";
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();
    layoutImage.set(data);
  }
</script>

<div class="flex flex-col items-center justify-center w-30">
  <form method="POST" action="/login?/logout" use:enhance>
    <button class="btn-menu">
      <Icon icon="garden:exit-stroke-16" width="15" height="15" />
    </button>
  </form>

  <button
    class="btn-menu"
    class:active={$todaySchedule &&
      $todaySchedule.start.id === $currentSchedule?.id}
    onclick={() => handleGetList(0)}
  >
    {#if $todaySchedule}
      <span>{$todaySchedule.start.index}</span>
    {:else}
      <Icon icon="prime:question" width="15" height="15" />
    {/if}
  </button>

  <button
    class="btn-menu"
    class:active={$todaySchedule &&
      $todaySchedule.end.id === $currentSchedule?.id}
    onclick={() => handleGetList(1)}
  >
    {#if $todaySchedule}
      <span>{$todaySchedule.end.index}</span>
    {:else}
      <Icon icon="prime:question" width="15" height="15" />
    {/if}
  </button>

  {#if $showLayout}
    <button class="btn-menu" onclick={() => ($showBookmark = !$showBookmark)}>
      {#if $showBookmark}
        <Icon icon="mdi:paint-outline" width="15" height="15" />
      {:else}
        <Icon icon="ion:book-outline" width="15" height="15" />
      {/if}
    </button>
  {/if}

  {#if innerWidth.current && innerWidth.current > 450}
    {#if $showLayout}
      <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}
        ><Icon icon="ri:layout-right-line" width="15" height="15" /></button
      >
    {:else}
      <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}>
        <Icon icon="ri:layout-left-line" width="15" height="15" />
      </button>
    {/if}
  {/if}

  <button class="btn-menu" onclick={() => ($showTranslate = true)}>
    <Icon icon="ri:translate" width="15" height="15" />
  </button>

  <button class="btn-menu" onclick={handleChangeLayoutImage}>
    <Icon icon="cuida:image-outline" width="15" height="15" />
  </button>

  <button
    class="btn-menu {$showTimer ? 'bg-blue-600/90' : ''}"
    onclick={() => ($showTimer = !$showTimer)}
  >
    <Icon
      icon="ri:hourglass-2-line"
      width="15"
      height="15"
      class="relative z-20"
    />
  </button>
</div>

<style>
  .btn-menu {
    @apply outline-none my-3 flex size-27 items-center justify-center rounded-3 text-white shadow shadow-black/30 backdrop-blur-md transition duration-100 hover:shadow;
  }
  .btn-menu span {
    @apply text-9 leading-27;
  }

  .btn-menu.active {
    @apply bg-green-400/90;
  }
</style>
