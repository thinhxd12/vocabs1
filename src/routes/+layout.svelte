<script lang="ts">
  import "../app.css";
  import "../styles/fonts.css";
  import { page } from "$app/state";
  import { schedule } from "$lib/store/navstore";
  import {
    currentImageIndex,
    getCurrentImageBackground,
    getNextImageBackground,
    getPrevImageBackground,
    LAYOUT_SETTING,
    localImageStore,
    layoutSetting,
    setGetLayouImageApi,
  } from "$lib/store/localstore";
  import type { LayoutSettingType, VideoBackgroundType } from "$lib/types";
  import { onMount } from "svelte";
  import SolarArrowLeftBold from "~icons/solar/arrow-left-bold";
  import EosIconsLoading from "~icons/eos-icons/loading";
  import SolarArrowRightBold from "~icons/solar/arrow-right-bold";
  import MaterialSymbolsVolumeUpRounded from "~icons/material-symbols/volume-up-rounded";
  import MaterialSymbolsVolumeOffRounded from "~icons/material-symbols/volume-off-rounded";
  import MaterialSymbolsPlayCircleRounded from "~icons/material-symbols/play-circle-rounded";
  import TablerCircleNumber3Filled from "~icons/tabler/circle-number-3-filled";
  import TablerCircleNumber4Filled from "~icons/tabler/circle-number-4-filled";
  import TablerCircleLetterDFilled from "~icons/tabler/circle-letter-d-filled";
  import TablerCircleLetterRFilled from "~icons/tabler/circle-letter-r-filled";
  import TablerSquareLetterTFilled from "~icons/tabler/square-letter-t-filled";

  let { children } = $props();

  $schedule = page.data.schedule;

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

  let videoSrc = $state<string>(videos[3].value);
  let isMuted = $state<boolean>(true);

  onMount(() => {
    getCurrentImageBackground();
  });

  function handleShowLayout(type: "image" | "video") {
    if (type === "image") {
      const setting: LayoutSettingType = {
        showImage: true,
        showVideo: false,
      };
      layoutSetting.set(setting);
      localStorage.setItem(LAYOUT_SETTING, JSON.stringify(setting));
    } else if (type === "video") {
      const setting: LayoutSettingType = {
        showImage: false,
        showVideo: true,
      };
      layoutSetting.set(setting);
      localStorage.setItem(LAYOUT_SETTING, JSON.stringify(setting));
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "PageDown") {
      getPrevImageBackground();
    }
    if (e.key === "PageUp") {
      getNextImageBackground();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main
  class="relative h-screen w-screen flex flex-col items-center overflow-hidden"
>
  {@render children()}

  {#if $layoutSetting.showImage}
    <div class="absolute z-10 hidden md:flex gap-2 right-3 top-3 text-white">
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          getPrevImageBackground();
        }}
        disabled={$currentImageIndex === 0}
      >
        <SolarArrowLeftBold width="14" height="14" />
      </button>
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("video");
        }}
      >
        <MaterialSymbolsPlayCircleRounded width="16" height="16" />
      </button>
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          getNextImageBackground();
        }}
      >
        {#if $localImageStore.loading}
          <EosIconsLoading width="14" height="14" />
        {:else}
          <SolarArrowRightBold width="14" height="14" />
        {/if}
      </button>
    </div>
  {/if}

  {#if $layoutSetting.showVideo}
    <div class="absolute right-3 top-3 flex gap-2">
      <select bind:value={videoSrc} class="btn-menu light">
        {#each videos as item}
          <option value={item.value}>
            {item.label}
          </option>
        {/each}
      </select>

      <button onclick={() => (isMuted = !isMuted)} class="btn-menu light">
        {#if isMuted}
          <MaterialSymbolsVolumeOffRounded width="14" height="14" />
        {:else}
          <MaterialSymbolsVolumeUpRounded width="14" height="14" />
        {/if}
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("image");
          setGetLayouImageApi("getdefaultlayoutimage");
        }}
      >
        <TablerCircleLetterDFilled width="16" height="16" />
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("image");
          setGetLayouImageApi("getwindows10spotlight");
        }}
      >
        <TablerSquareLetterTFilled width="16" height="16" />
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("image");
          setGetLayouImageApi("getwindows10spotlightrandom");
        }}
      >
        <TablerCircleLetterRFilled width="16" height="16" />
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("image");
          setGetLayouImageApi("getlayoutimagev3");
        }}
      >
        <TablerCircleNumber3Filled width="16" height="16" />
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("image");
          setGetLayouImageApi("getlayoutimagev4");
        }}
      >
        <TablerCircleNumber4Filled width="16" height="16" />
      </button>
    </div>
  {/if}
</main>

<div class="fixed w-screen h-screen inset-0 -z-1">
  {#if $layoutSetting.showImage}
    {#if $localImageStore.data.length}
      <img
        src={$localImageStore.data[$currentImageIndex].url}
        alt="main-layout-bg"
        class="w-full h-full object-cover"
        loading="lazy"
      />

      <div
        class="absolute w-[calc(50vw-215px)] hidden md:flex flex-col items-start left-0 top-0 px-3 text-12 leading-16 text-white"
      >
        <p style="text-shadow: 0 0 3px black;" class="text-left">
          {$localImageStore.data[$currentImageIndex].title || ""}
        </p>
        <p style="text-shadow: 0 0 3px black;" class="text-left">
          {$localImageStore.data[$currentImageIndex].place || ""}
        </p>
      </div>
    {/if}
  {:else if $layoutSetting.showVideo}
    <video
      src="/gif/{videoSrc}"
      autoplay
      loop
      muted={isMuted}
      playsinline
      class="w-full h-full object-cover"
    >
      Your browser does not support the video tag.
    </video>
  {/if}
</div>

<style lang="postcss">
  .btn-menu {
    @apply size-18 flex items-center justify-center text-12 leading-16 appearance-none text-center cursor-pointer rounded-2 transition duration-100 outline-none ring-1 ring-black/5 shadow shadow-black/30 disabled:opacity-30;
  }
</style>
