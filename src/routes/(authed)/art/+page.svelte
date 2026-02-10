<script lang="ts">
  import {
    currentArtImageIndex,
    getCurrentArtImage,
    getNextArtImage,
    getPrevArtImage,
    localArtStore,
  } from "$lib/store/localstore";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  onMount(() => {
    getCurrentArtImage();
  });
</script>

<svelte:head>
  <title>
    {`${$localArtStore.data[$currentArtImageIndex].title}` || "Daily Art"}
  </title>
  <meta name="art" content="Some painting" />
</svelte:head>

<section class="absolute top-0 left-0 w-screen h-screen flex z-[5] bg-[#19191c]">
  <div
    class="relative overflow-hidden flex-1 h-full flex items-center justify-center pt-60 pb-80 px-40"
  >
    <img
      src={$localArtStore.data[$currentArtImageIndex].mainImage}
      alt="main"
      class="absolute top-0 left-0 w-full h-full object-cover"
      style="filter: blur(150px); z-index: 1;"
    />
    <img
      src={$localArtStore.data[$currentArtImageIndex].mainImage}
      alt="main"
      class="max-h-full max-w-full object-cover shadow-xl shadow-black/80 z-10"
    />

    <div class="absolute top-6 right-6 z-50 flex gap-6">
      <button
        class="btn-menu"
        onclick={(e) => {
          e.currentTarget.blur();
          getPrevArtImage();
        }}
        disabled={$currentArtImageIndex === 0}
      >
        <Icon icon="solar:arrow-left-bold" width="15" height="15" />
      </button>
      <button
        class="btn-menu"
        onclick={(e) => {
          e.currentTarget.blur();
          getNextArtImage();
        }}
      >
        {#if $localArtStore.loading}
          <Icon icon="eos-icons:loading" width="15" height="15" />
        {:else}
          <Icon icon="solar:arrow-right-bold" width="15" height="15" />
        {/if}
      </button>
    </div>
  </div>
  <div class="w-[360px] h-full dark flex flex-col p-15">
    <div class="w-full mb-9">
      <p class="mb-6 text-13 font-500 leading-15 text-secondary-white">
        {$localArtStore.data[$currentArtImageIndex].shareDate}
      </p>
      <h3 class="mb-6 font-roslindale text-27 font-600 leading-30 text-white">
        {$localArtStore.data[$currentArtImageIndex].title}
      </h3>

      <p class="text-12 font-400 leading-15 text-white">
        {$localArtStore.data[$currentArtImageIndex].attr}
      </p>
    </div>

    <div class="flex h-1/2 w-full flex-grow flex-col">
      <div class="rounded-6 bg-white/15 p-3">
        <div class="flex">
          <img
            src={$localArtStore.data[$currentArtImageIndex].authorImage}
            alt="author"
            class="size-[45px] rounded-6 object-cover shadow shadow-black/10"
          />
          <div>
            <p class="truncate text-wrap pl-9 text-13 font-400 text-white">
              {$localArtStore.data[$currentArtImageIndex].author}
            </p>
            <p class="pl-9 text-13 font-400 text-white">
              {$localArtStore.data[$currentArtImageIndex].authorYears}
            </p>
          </div>
        </div>
      </div>
      <div
        class="no-scrollbar my-9 w-full flex-grow overflow-y-scroll text-13 font-400 leading-18 text-secondary-white *:indent-9"
        style="mask-image: linear-gradient(to top, transparent, #fff 5%, #fff 100%)"
      >
        {@html $localArtStore.data[$currentArtImageIndex].content}
      </div>
    </div>
  </div>
</section>

<style lang="postcss">
  .btn-menu {
    @apply flex size-27 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 outline-none backdrop-blur-md disabled:opacity-15;
  }
</style>
