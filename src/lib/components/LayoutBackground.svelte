<script lang="ts">
  import { page } from "$app/state";
  import {
    currentImageIndex,
    getCurrentImageBackground,
    getNextImageBackground,
    getPrevImageBackground,
    LAYOUT_SETTING,
    localImageStore,
    layoutSetting,
  } from "$lib/store/localstore";
  import type {
    ImageBackgroundType,
    LayoutSettingType,
    VideoBackgroundType,
  } from "$lib/types";
  import { onMount } from "svelte";
  import SolarArrowLeftBold from "~icons/solar/arrow-left-bold";
  import MaterialSymbolsTriangleCircleRounded from "~icons/material-symbols/triangle-circle-rounded";
  import EosIconsLoading from "~icons/eos-icons/loading";
  import SolarArrowRightBold from "~icons/solar/arrow-right-bold";
  import MaterialSymbolsVolumeOffOutlineRounded from "~icons/material-symbols/volume-off-outline-rounded";
  import MaterialSymbolsVolumeUpOutlineRounded from "~icons/material-symbols/volume-up-outline-rounded";
  import MaterialSymbolsCloudDownloadOutlineRounded from "~icons/material-symbols/cloud-download-outline-rounded";
  import MaterialSymbolsLink2Rounded from "~icons/material-symbols/link-2-rounded";
  import MaterialSymbolsLightDirectorySyncRounded from "~icons/material-symbols-light/directory-sync-rounded";
  import FluentSurfaceHub24Filled from "~icons/fluent/surface-hub-24-filled";
  import FluentSurfaceHub24Regular from "~icons/fluent/surface-hub-24-regular";
  import MaterialSymbolsResetImage from "~icons/material-symbols/reset-image";

  const defaultImage: ImageBackgroundType[] = [
    {
      title: "Stunning Icelandic region of volcanoes, beaches, and glaciers.",
      url: "/images/Icescape.jpg",
      place: "Snæfellsnes peninsula, Iceland",
    },
    {
      title: "",
      url: "/images/joshua-bartell.avif",
      place: "",
    },
    {
      title: "",
      url: "/images/engin-akyurt.avif",
      place: "",
    },
  ];

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

  let imageSrc = $state<ImageBackgroundType>(defaultImage[0]);
  let videoSrc = $state<string>(videos[3].value);
  let isMuted = $state<boolean>(true);

  onMount(() => {
    getCurrentImageBackground();
  });

  function handleShowLayout(type: "local" | "remote" | "video") {
    if (type === "local") {
      const setting: LayoutSettingType = {
        showImageRemote: false,
        showVideo: false,
        showImageLocal: true,
      };
      layoutSetting.set(setting);
      localStorage.setItem(LAYOUT_SETTING, JSON.stringify(setting));
    } else if (type === "remote") {
      const setting: LayoutSettingType = {
        showImageRemote: true,
        showVideo: false,
        showImageLocal: false,
      };
      layoutSetting.set(setting);
      localStorage.setItem(LAYOUT_SETTING, JSON.stringify(setting));
    }
    if (type === "video") {
      const setting: LayoutSettingType = {
        showImageRemote: false,
        showVideo: true,
        showImageLocal: false,
      };
      layoutSetting.set(setting);
      localStorage.setItem(LAYOUT_SETTING, JSON.stringify(setting));
    }
  }
</script>

{#if page.url.pathname !== "/art"}
  {#if $layoutSetting && $layoutSetting.showImageRemote}
    {#if $localImageStore.data.length}
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
          {$localImageStore.data[$currentImageIndex].title || ""}
        </p>
        <p style="text-shadow: 0 0 3px black;" class="text-left">
          {$localImageStore.data[$currentImageIndex].place
            .split("©")[0]
            .trim() || ""}
        </p>
      </div>
    {/if}

    <div class="z-[9] absolute hidden md:flex gap-3 right-3 top-3 text-white">
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          getPrevImageBackground();
        }}
        disabled={$currentImageIndex === 0}
      >
        <SolarArrowLeftBold width="16" height="16" />
      </button>
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("video");
        }}
      >
        <MaterialSymbolsTriangleCircleRounded width="16" height="16" />
      </button>
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          getNextImageBackground();
        }}
      >
        {#if $localImageStore.loading}
          <EosIconsLoading width="16" height="16" />
        {:else}
          <SolarArrowRightBold width="16" height="16" />
        {/if}
      </button>
    </div>
  {:else if $layoutSetting && $layoutSetting.showVideo}
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
      <select bind:value={videoSrc} class="btn-menu light">
        {#each videos as item}
          <option value={item.value}>
            {item.label}
          </option>
        {/each}
      </select>

      <button onclick={() => (isMuted = !isMuted)} class="btn-menu light">
        {#if isMuted}
          <MaterialSymbolsVolumeOffOutlineRounded width="16" height="16" />
        {:else}
          <MaterialSymbolsVolumeUpOutlineRounded width="16" height="16" />
        {/if}
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("local");
        }}
      >
        <MaterialSymbolsCloudDownloadOutlineRounded width="16" height="16" />
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("remote");
        }}
      >
        <MaterialSymbolsLink2Rounded width="16" height="16" />
      </button>
    </div>
  {:else if $layoutSetting && $layoutSetting.showImageLocal}
    <img
      src={imageSrc.url}
      alt="main-layout-bg"
      class="absolute w-full h-full object-cover z-[0]"
      loading="lazy"
    />

    <div
      class="z-[9] absolute w-[calc(50vw-215px)] hidden md:flex flex-col items-start left-0 top-3 px-3 text-12 leading-16 text-white"
    >
      <p style="text-shadow: 0 0 3px black;" class="text-left">
        {imageSrc.title}
      </p>
      <p style="text-shadow: 0 0 3px black;" class="text-left">
        {imageSrc.place}
      </p>
    </div>

    <div class="z-[9] absolute right-3 top-3 flex gap-2">
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          imageSrc = defaultImage[0];
        }}
      >
        <MaterialSymbolsLightDirectorySyncRounded width="16" height="16" />
      </button>

      <button
        onclick={(e) => {
          e.currentTarget.blur();
          imageSrc = defaultImage[1];
        }}
        class="btn-menu light"
      >
        <FluentSurfaceHub24Filled width="16" height="16" />
      </button>

      <button
        onclick={(e) => {
          e.currentTarget.blur();
          imageSrc = defaultImage[2];
        }}
        class="btn-menu light"
      >
        <FluentSurfaceHub24Regular width="16" height="16" />
      </button>

      <button
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("remote");
        }}
        class="btn-menu light"
      >
        <MaterialSymbolsLink2Rounded width="16" height="16" />
      </button>

      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("video");
        }}
      >
        <MaterialSymbolsTriangleCircleRounded width="16" height="16" />
      </button>
    </div>
  {:else}
    <div class="absolute w-full h-full z-[0] bg-[#f1f1f1]"></div>
    <div class="z-[9] absolute right-3 top-3 flex gap-2">
      <button
        class="btn-menu light"
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowLayout("local");
        }}
      >
        <MaterialSymbolsResetImage width="16" height="16" />
      </button>
    </div>
  {/if}
{/if}

<style lang="postcss">
  .btn-menu {
    @apply size-18 flex items-center justify-center text-13 leading-16 appearance-none text-center cursor-pointer rounded-2 transition duration-100 outline-none ring-1 ring-black/5 shadow shadow-black/30 disabled:opacity-30;
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
