<script lang="ts">
  import { page } from "$app/state";
  import {
    currentImageIndex,
    getCurrentImageBackground,
    getNextImageBackground,
    getPrevImageBackground,
    localImageStore,
    setImageBackground,
  } from "$lib/store/localstore";
  import type { VideoBackgroundType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  const videos: VideoBackgroundType[] = [
    {
      label: "1",
      value: "rain1.mp4",
    },
    {
      label: "2",
      value: "rain2.mp4",
    },
    {
      label: "3",
      value: "rain3.mp4",
    },
    {
      label: "4",
      value: "rain4.mp4",
    },
  ];

  let showVideoBackground = $state<boolean>(false);
  let videoSrc = $state<string>(videos[3].value);
  let isMuted = $state<boolean>(true);

  onMount(() => {
    getCurrentImageBackground();
  });
</script>

{#if page.url.pathname !== "/art" && showVideoBackground}
  <video
    src="/gif/{videoSrc}"
    autoplay
    loop
    muted={isMuted}
    playsinline
    class="absolute w-full h-full object-cover z-[0]"
  >
    Your browser does not support the video tag.
  </video>

  <div class="z-[9] absolute right-3 top-3 flex gap-2">
    <button
      onclick={() => (showVideoBackground = false)}
      class="btn-menu light"
    >
      <Icon
        icon="material-symbols:imagesmode-outline-rounded"
        width="14"
        height="14"
      />
    </button>

    <select bind:value={videoSrc} class="btn-menu light">
      {#each videos as item}
        <option value={item.value}>
          {item.label}
        </option>
      {/each}
    </select>

    <button onclick={() => (isMuted = !isMuted)} class="btn-menu light">
      {#if isMuted}
        <Icon
          icon="material-symbols:volume-off-outline-rounded"
          width="14"
          height="14"
        />
      {:else}
        <Icon
          icon="material-symbols:volume-up-outline-rounded"
          width="14"
          height="14"
        />
      {/if}
    </button>

    <button
      onclick={() => {
        showVideoBackground = false;
        setImageBackground(0);
      }}
      class="btn-menu light"
    >
      <Icon icon="material-symbols:reset-image" width="14" height="14" />
    </button>

    <button
      onclick={() => {
        showVideoBackground = false;
        setImageBackground(1);
      }}
      class="btn-menu light"
    >
      <Icon
        icon="material-symbols:table-restaurant-outline-rounded"
        width="14"
        height="14"
      />
    </button>

    <button
      onclick={() => {
        showVideoBackground = false;
        setImageBackground(2);
      }}
      class="btn-menu light"
    >
      <Icon
        icon="material-symbols:table-restaurant-outline-rounded"
        width="14"
        height="14"
      />
    </button>
  </div>
{:else if page.url.pathname !== "/art"}
  <img
    src={$localImageStore.data[$currentImageIndex].url}
    alt="main-layout-bg"
    class="absolute w-full h-full object-cover z-[0]"
    loading="lazy"
  />

  <div
    class="z-[9] absolute w-[calc(50vw-215px)] hidden md:flex flex-col items-start left-0 top-3 px-3 text-12 leading-16 text-white"
  >
    <p style="text-shadow: 0 0 3px black;" class="text-left">
      {$localImageStore.data[$currentImageIndex].title ||
        "Show video background."}
    </p>
    <p style="text-shadow: 0 0 3px black;" class="text-left">
      {$localImageStore.data[$currentImageIndex].place.split("©")[0].trim() ||
        "Change background image."}
    </p>
  </div>

  <div class="z-[9] absolute hidden md:flex gap-3 right-3 top-3 text-white">
    <button
      class="btn-menu light"
      onclick={(e) => {
        e.currentTarget.blur();
        getPrevImageBackground();
      }}
      disabled={$currentImageIndex === 0}
    >
      <Icon
        icon="material-symbols:arrow-left-alt-rounded"
        width="14"
        height="14"
      />
    </button>
    <button
      class="btn-menu light"
      onclick={(e) => {
        e.currentTarget.blur();
        showVideoBackground = true;
      }}
    >
      <Icon icon="material-symbols:adjust-outline" width="14" height="14" />
    </button>
    <button
      class="btn-menu light"
      onclick={(e) => {
        e.currentTarget.blur();
        getNextImageBackground();
      }}
      class:active={$currentImageIndex === $localImageStore.data.length - 1}
    >
      {#if $localImageStore.loading}
        <Icon icon="eos-icons:loading" width="14" height="14" />
      {:else}
        <Icon
          icon="material-symbols:arrow-right-alt-rounded"
          width="14"
          height="14"
        />
      {/if}
    </button>
  </div>
{/if}

<style lang="postcss">
  .btn-menu {
    @apply size-18 flex items-center justify-center text-13 leading-16 appearance-none text-center cursor-pointer rounded-2 transition duration-100 outline-none ring-1 ring-black/5 shadow shadow-black/30 disabled:opacity-30;
  }

  .btn-menu.active {
    @apply !bg-green-400/60;
  }

  option {
    font-size: 13px;
    width: 18px;
  }

  option:checked {
    background-color: #eaebeb;
    font-weight: bold;
  }

  option:hover {
    background-color: #eaebeb;
  }

  option:focus-visible {
    outline: none;
    background-color: #dedfdf;
  }

  option::checkmark {
    display: none;
  }
</style>
