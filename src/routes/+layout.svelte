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
  } from "$lib/store/localstore";
  import type { LayoutSettingType, VideoBackgroundType } from "$lib/types";
  import { onMount } from "svelte";
  import SolarArrowLeftBold from "~icons/solar/arrow-left-bold";
  import EosIconsLoading from "~icons/eos-icons/loading";
  import SolarArrowRightBold from "~icons/solar/arrow-right-bold";
  import MaterialSymbolsVolumeOffOutlineRounded from "~icons/material-symbols/volume-off-outline-rounded";
  import MaterialSymbolsVolumeUpOutlineRounded from "~icons/material-symbols/volume-up-outline-rounded";
  import MaterialSymbolsImage from "~icons/material-symbols/image";
  import MaterialSymbolsMovie from "~icons/material-symbols/movie";

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

<div class="relative h-screen w-screen flex flex-col overflow-hidden">
  {@render children()}

  {#if $layoutSetting.showImage}
    <div class="absolute hidden md:flex gap-3 right-3 top-3 text-white">
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
        <MaterialSymbolsMovie width="14" height="14" />
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

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("image");
        }}
      >
        <MaterialSymbolsImage width="14" height="14" />
      </button>

      <button onclick={() => (isMuted = !isMuted)} class="btn-menu light">
        {#if isMuted}
          <MaterialSymbolsVolumeOffOutlineRounded width="14" height="14" />
        {:else}
          <MaterialSymbolsVolumeUpOutlineRounded width="14" height="14" />
        {/if}
      </button>
    </div>
  {/if}
</div>

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
          {$localImageStore.data[$currentImageIndex].place
            .split("©")[0]
            .trim() || ""}
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
