<script lang="ts">
  import { page } from "$app/state";
  import {
    handleAutoplay,
    isAutoPlay,
    listContent,
    listCount,
    todaySchedule,
    totalMemories,
    currentSchedule,
    handleGetListContent,
    weatherData,
    locationList,
  } from "$lib/store/navstore";
  import type { WeatherQueryParams } from "$lib/types";
  import { format } from "date-fns";
  import { getOpenMeteoWeather } from "$lib/utils/functions";
  import Icon from "@iconify/svelte";
  import { onDestroy, onMount } from "svelte";
  import { showTranslate } from "$lib/store/vocabstore";
  import WeatherButton from "./WeatherButton.svelte";
  import TimerButton from "./TimerButton.svelte";

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    clearInterval(interval);
    getNavWeatherData();
    interval = setInterval(
      () => {
        getNavWeatherData();
      },
      1000 * 15 * 60
    );
  });

  async function getNavWeatherData() {
    const defaultLocation =
      $locationList.find((item) => item.default) || $locationList[0];
    let param: WeatherQueryParams = {
      latitude: defaultLocation.lat,
      longitude: defaultLocation.lon,
      tempUnit: "c",
    };
    $weatherData = await getOpenMeteoWeather(param);
  }

  function handleGetList(numb: number) {
    $currentSchedule = numb === 0 ? $todaySchedule!.start : $todaySchedule!.end;
    handleGetListContent();
  }

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="w-main dark flex items-center gap-2">
  <div class="relative w-12 h-full flex flex-col">
    <div class="flex-1 bg-black/60 flex flex-col justify-center text-center">
      {#if $todaySchedule}
        <span class="text-9 leading-11 text-white">
          {$todaySchedule.start.count}
        </span>
        <span class="text-9 leading-11 text-white">
          {$todaySchedule.end.count}
        </span>
      {:else}
        <span class="text-9 leading-11 text-white">N</span>
        <span class="text-9 leading-11 text-white">N</span>
      {/if}
    </div>
    <div class="relative w-12 h-15 bg-white/30 overflow-hidden">
      <span
        class="uppercase text-8 font-900 text-black leading-12 text-center absolute w-15 h-full transform -rotate-90 origin-center"
      >
        {format(todayDate, "eeeeee")}
      </span>
    </div>
  </div>

  <div class="h-full flex-1 flex flex-wrap gap-4">
    <div class="w-full flex justify-center items-end gap-2">
      <button
        class="btn-menu disabled:cursor-default disabled:opacity-30 hover:!bg-white/20 hover:!text-black/60"
        class:active={$todaySchedule &&
          $todaySchedule.start.id === $currentSchedule?.id}
        onclick={() => handleGetList(0)}
        disabled={!["/vocab", "/quiz"].includes(page.url.pathname)}
      >
        {#if $todaySchedule}
          <span>{$todaySchedule.start.index}</span>
        {:else}
          <Icon icon="solar:close-circle-linear" width="13" height="13" />
        {/if}
      </button>

      <button
        class="btn-menu disabled:cursor-default disabled:opacity-30 hover:!bg-white/20 hover:!text-black/60"
        class:active={$todaySchedule &&
          $todaySchedule.end.id === $currentSchedule?.id}
        onclick={() => handleGetList(1)}
        disabled={!["/vocab", "/quiz"].includes(page.url.pathname)}
      >
        {#if $todaySchedule}
          <span>{$todaySchedule.end.index}</span>
        {:else}
          <Icon icon="solar:close-circle-linear" width="13" height="13" />
        {/if}
      </button>

      <TimerButton />
    </div>

    <div class="w-full flex justify-center items-start gap-2">
      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
      >
        <Icon icon="ep:document" width="13" height="13" />
      </a>

      <a
        href="/schedule"
        class:active={page.url.pathname === "/schedule"}
        class="btn-nav"
      >
        <Icon icon="clarity:calendar-line" width="13" height="13" />
      </a>

      <a
        href="/quiz"
        class="btn-nav"
        class:active={page.url.pathname === "/quiz"}
      >
        <Icon icon="streamline-sharp:notebook" width="12" height="12" />
      </a>

      <a
        href="/vocab"
        class="btn-nav"
        onclick={() => ($showTranslate = !$showTranslate)}
        class:active={$showTranslate}
      >
        <Icon icon="fluent:translate-16-regular" width="15" height="15" />
      </a>

      <a
        href="/highlights"
        class="btn-nav"
        class:active={page.url.pathname === "/highlights"}
      >
        <Icon icon="emojione-monotone:green-book" width="15" height="15" />
      </a>

      <a
        href="/art"
        class="btn-nav"
        class:active={page.url.pathname === "/art"}
      >
        <Icon icon="ri:painting-line" width="15" height="15" />
      </a>

      <a
        href="/sad"
        class="btn-nav"
        class:active={page.url.pathname === "/sad"}
      >
        <Icon icon="pixelarticons:mood-sad" width="15" height="15" />
      </a>

      <form method="post" action="/login?/signout">
        <button class="btn-menu">
          <Icon icon="hugeicons:logout-03" width="13" height="13" />
        </button>
      </form>
    </div>
  </div>

  <div
    class="h-full flex flex-col items-center justify-center px-2 bg-black/60"
  >
    <span class="font-tupa text-18 font-600 leading-20">
      {Math.floor($totalMemories / 100) < 10
        ? "0" + Math.floor($totalMemories / 100)
        : Math.floor($totalMemories / 100)}
    </span>
    <span class="font-tupa text-18 font-600 leading-20">
      {$totalMemories % 100 < 10
        ? "0" + ($totalMemories % 100)
        : $totalMemories % 100}
    </span>
  </div>

  <a href="/weather" class="outline-none relative w-90 h-full overflow-hidden">
    <WeatherButton />
  </a>

  <button
    class="outline-none relative w-90 h-full overflow-hidden"
    onclick={handleAutoplay}
  >
    {#if $isAutoPlay}
      <img
        src="/images/sunrise.webp"
        alt="btn-play"
        class="w-90 h-full object-cover object-[-10px]"
      />
    {:else}
      <img
        src="/images/sunrise.webp"
        alt="btn-pause"
        class="grayscale w-90 h-full object-cover object-[-10px]"
      />
    {/if}
    {#if $listCount}
      <img
        src="/images/sunrise.webp"
        alt="btn-play"
        class="absolute top-0 left-0 w-0 h-full z-[1] object-cover object-[-10px] transition-all duration-300"
        style="box-shadow: 3px 0px 3px rgba(0, 0, 0, 0.45); width: {($listCount /
          $listContent.length) *
          90}px;"
      />
    {/if}
  </button>
</div>

<style>
  .btn-menu {
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-menu span {
    @apply text-9 leading-13 font-500;
  }

  .btn-menu.active {
    @apply !bg-green-400/60 text-black;
  }

  .btn-menu.active {
    @apply !bg-green-400/60 text-black;
  }

  .btn-nav {
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-nav.active {
    @apply bg-white/60 text-black;
  }
</style>
