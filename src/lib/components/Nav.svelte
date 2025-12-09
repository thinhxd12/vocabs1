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
  let wakeLockObj = $state<WakeLockSentinel | null>(null);
  let wakeEnable = $state<boolean>(false);

  onMount(() => {
    getNavWeatherData();
    startInterval();
  });

  function calculateNextInterval() {
    const now = new Date();
    let minutes = now.getMinutes();
    let nextIntervalMinutes = Math.ceil(minutes / 15) * 15;
    if (nextIntervalMinutes === 60) {
      nextIntervalMinutes = 0;
      now.setHours(now.getHours() + 1);
    }

    now.setMinutes(nextIntervalMinutes, 0, 0);
    const delay = now.getTime() - Date.now() + 300;
    return delay;
  }

  const startInterval = () => {
    const delay = calculateNextInterval();
    setTimeout(() => {
      getNavWeatherData();
      interval = setInterval(getNavWeatherData, 15 * 60 * 1000);
    }, delay);
  };

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

  function handleWakeLockAbort() {
    wakeLockObj = null;
    wakeEnable = false;
  }

  async function toggleWakeLock(enable: boolean) {
    if (enable) {
      try {
        wakeLockObj = await navigator.wakeLock.request("screen");
        wakeEnable = true;
        wakeLockObj.addEventListener("release", handleWakeLockAbort);
      } catch (err) {
        console.log(err);
      }
    } else {
      if (wakeLockObj) {
        wakeLockObj.removeEventListener("release", handleWakeLockAbort);
        wakeLockObj.release().then(() => {
          wakeLockObj = null;
          wakeEnable = false;
        });
      }
    }
  }

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="w-main flex items-center gap-2">
  <div class="relative w-12 h-full flex flex-col">
    <div
      class="flex-1 flex flex-col justify-center text-center text-white/90 bg-black/80 backdrop-blur-md"
    >
      {#if $todaySchedule}
        <span class="text-9 leading-11">
          {$todaySchedule.start.count}
        </span>
        <span class="text-9 leading-11">
          {$todaySchedule.end.count}
        </span>
      {:else}
        <span class="text-9 leading-11">N</span>
        <span class="text-9 leading-11">N</span>
      {/if}
    </div>
    <div
      class="relative w-12 h-15 overflow-hidden bg-white/60 backdrop-blur-md"
    >
      <span
        class="uppercase text-8 font-900 text-black leading-12 text-center absolute w-15 h-full transform -rotate-90 origin-center"
      >
        {format(todayDate, "eeeeee")}
      </span>
    </div>
  </div>

  <div class="dark h-full flex-1 flex flex-wrap gap-4">
    <div class="w-full flex justify-center items-end gap-2">
      <button
        class="btn-menu disabled:cursor-default disabled:opacity-30 disabled:hover:!bg-white/20 disabled:hover:!text-black/60"
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
        class="btn-menu disabled:cursor-default disabled:opacity-30 disabled:hover:!bg-white/20 disabled:hover:!text-black/60"
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

      <a
        href="/pomodoro"
        class:active={page.url.pathname === "/pomodoro"}
        class="btn-menu"
      >
        <Icon icon="emojione-monotone:tomato" width="13" height="13" />
      </a>

      <button
        class="btn-menu disabled:cursor-default disabled:opacity-30 disabled:hover:!bg-white/20 disabled:hover:!text-black/60"
        class:active={wakeEnable}
        onclick={() => toggleWakeLock(!wakeEnable)}
      >
        <Icon icon="flowbite:moon-outline" width="13" height="13" />
      </button>

      <TimerButton />
    </div>

    <div class="w-full flex justify-center items-start gap-2">
      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
      >
        <Icon icon="dinkie-icons:page-facing-up" width="13" height="13" />
      </a>

      <a
        href="/schedule"
        class:active={page.url.pathname === "/schedule"}
        class="btn-nav"
      >
        <Icon icon="dinkie-icons:calendar-alt" width="13" height="13" />
      </a>

      <a
        href="/quiz"
        class="btn-nav"
        class:active={page.url.pathname === "/quiz"}
      >
        <Icon icon="dinkie-icons:electric-light-bulb" width="13" height="13" />
      </a>

      <a
        href="/vocab"
        class="btn-nav"
        onclick={() => ($showTranslate = !$showTranslate)}
        class:active={$showTranslate}
      >
        <Icon icon="dinkie-icons:translate-hira-latin" width="13" height="13" />
      </a>

      <a
        href="/highlights"
        class="btn-nav"
        class:active={page.url.pathname === "/highlights"}
      >
        <Icon icon="dinkie-icons:closed-book" width="13" height="13" />
      </a>

      <a
        href="/art"
        class="btn-nav"
        class:active={page.url.pathname === "/art"}
      >
        <Icon icon="gravity-ui:frame" width="13" height="13" />
      </a>

      <a
        href="/sad"
        class="btn-nav"
        class:active={page.url.pathname === "/sad"}
      >
        <Icon icon="pixelarticons:mood-sad" width="16" height="16" />
      </a>

      <form method="post" action="/login?/signout">
        <button class="btn-menu">
          <Icon icon="dinkie-icons:exit" width="13" height="13" />
        </button>
      </form>
    </div>
  </div>

  <div
    class="h-full flex flex-col items-center justify-center px-2 text-white/90 bg-black/80 backdrop-blur-md"
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
    disabled={page.url.pathname !== "/vocab"}
    onclick={handleAutoplay}
  >
    {#if $isAutoPlay && page.url.pathname === "/vocab"}
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

    {#if ["/vocab", "/quiz"].includes(page.url.pathname)}
      <img
        src="/images/sunrise.webp"
        alt="btn-play"
        class="absolute top-0 left-0 w-0 h-full z-[1] object-cover object-[-10px] transition-all duration-300"
        style="box-shadow: rgba(0, 0, 0, 0.9) 3px 0px 7px; width: {($listCount /
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
