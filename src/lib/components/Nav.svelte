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
    currentProgress,
  } from "$lib/store/navstore";
  import type { WeatherQueryParams } from "$lib/types";
  import { format } from "date-fns";
  import { getOpenMeteoWeather } from "$lib/utils/functions";
  import { onDestroy, onMount } from "svelte";
  import { showTranslate } from "$lib/store/vocabstore";
  import WeatherButton from "./WeatherButton.svelte";
  import TimerButton from "./TimerButton.svelte";
  import WakeLockButton from "./WakeLockButton.svelte";
  import { fly } from "svelte/transition";
  import MaterialSymbolsAdjust from "~icons/material-symbols/adjust";
  import MaterialSymbolsDocumentSearchOutlineRounded from "~icons/material-symbols/document-search-outline-rounded";
  import MaterialSymbolsCalendarMonthRounded from "~icons/material-symbols/calendar-month-rounded";
  import MaterialSymbolsTranslateRounded from "~icons/material-symbols/translate-rounded";
  import MaterialSymbolsBookRibbonOutlineRounded from "~icons/material-symbols/book-ribbon-outline-rounded";
  import GravityUiFrames from "~icons/gravity-ui/frames";
  import MaterialSymbolsSentimentNeutralOutlineRounded from "~icons/material-symbols/sentiment-neutral-outline-rounded";
  import MaterialSymbolsLockOpenRightOutlineRounded from "~icons/material-symbols/lock-open-right-outline-rounded";
  import HugeiconsQuiz02 from "~icons/hugeicons/quiz-02";
  import sunrise from "$lib/assets/images/sunrise.webp";
  import {
    currentWeatherIndex,
    getWeatherList,
    locationList,
  } from "$lib/store/localstore";
  import { goto } from "$app/navigation";

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let interval: ReturnType<typeof setInterval>;
  let timeout: ReturnType<typeof setTimeout>;

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
    timeout = setTimeout(() => {
      getNavWeatherData();
      interval = setInterval(getNavWeatherData, 15 * 60 * 1000);
    }, delay);
  };

  async function getNavWeatherData() {
    await getWeatherList();
    const defaultLocation = $locationList[$currentWeatherIndex];
    let param: WeatherQueryParams = {
      latitude: defaultLocation.lat,
      longitude: defaultLocation.lon,
      tempUnit: "c",
    };
    $weatherData = await getOpenMeteoWeather(param);
  }

  function handleDailyProgress() {
    if ($currentProgress === 0) {
      goto("/vocab");
      $currentProgress = 1;
      $currentSchedule = $todaySchedule!.start;
      handleGetListContent();
    } else if ($currentProgress === 1) {
      goto("/vocab");
    } else if ($currentProgress === 2) {
      goto("/quiz");
    }
  }

  onDestroy(() => {
    clearInterval(interval);
    clearTimeout(timeout);
  });
</script>

<div class="w-main h-full flex items-center gap-2">
  <div class="relative w-12 h-full rounded-2 overflow-hidden flex flex-col">
    {#if $todaySchedule}
      <div
        class="w-full h-14 flex justify-center text-9 leading-12 text-white/90 text-center overflow-hidden pt-2 bg-black/80 backdrop-blur-md"
      >
        {#key $todaySchedule.start.count}
          <span in:fly={{ y: -12, duration: 300 }}>
            {$todaySchedule.start.count}
          </span>
        {/key}
      </div>
      <div
        class="w-full h-14 flex justify-center text-9 leading-12 text-white/90 text-center overflow-hidden bg-black/80 backdrop-blur-md"
      >
        {#key $todaySchedule.end.count}
          <span in:fly={{ y: -12, duration: 300 }}>
            {$todaySchedule.end.count}
          </span>
        {/key}
      </div>
    {:else}
      <span
        class="text-9 leading-14 text-white/90 text-center bg-black/80 backdrop-blur-md"
        >N</span
      >
      <span
        class="text-9 leading-14 text-white/90 text-center bg-black/80 backdrop-blur-md"
        >N</span
      >
    {/if}
    <div
      class="relative w-12 h-14 overflow-hidden bg-white/60 backdrop-blur-md"
    >
      <span
        class="uppercase text-8 font-900 text-black leading-12 text-center absolute w-15 h-full transform -rotate-90 origin-center"
      >
        {format(todayDate, "eeeeee")}
      </span>
    </div>
  </div>

  <div class="dark h-full rounded-2 flex-1 flex flex-wrap gap-4">
    <div class="w-full flex justify-center items-end gap-2">
      <button
        class="flex justify-between relative w-40 mx-1 outline-none disabled:cursor-not-allowed"
        onclick={(e) => {
          e.currentTarget.blur();
          handleDailyProgress();
        }}
      >
        <div class="progress"></div>
        <div
          class="progress-active"
          style="width: {$currentProgress === 2 ? 10 : 0}px;"
        ></div>
        <div
          class="circle"
          class:active={$currentProgress === 1}
          class:done={$currentProgress === 2}
        >
          1
        </div>
        <div class="circle" class:active={$currentProgress === 2}>2</div>
      </button>

      <a
        href="/pomodoro"
        class:active={page.url.pathname === "/pomodoro"}
        class="btn-menu"
      >
        <MaterialSymbolsAdjust width="13" height="13" />
      </a>

      <WakeLockButton />

      <TimerButton />
    </div>

    <div class="w-full flex justify-center items-start gap-2">
      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
      >
        <MaterialSymbolsDocumentSearchOutlineRounded width="13" height="13" />
      </a>

      <a
        href="/schedule"
        class:active={page.url.pathname === "/schedule"}
        class="btn-nav"
      >
        <MaterialSymbolsCalendarMonthRounded width="13" height="13" />
      </a>

      <a
        href="/quiz"
        class="btn-nav"
        class:active={page.url.pathname === "/quiz"}
      >
        <HugeiconsQuiz02 width="13" height="13" />
      </a>

      <a
        href="/vocab"
        class="btn-nav"
        onclick={() => ($showTranslate = !$showTranslate)}
        class:active={$showTranslate}
      >
        <MaterialSymbolsTranslateRounded width="13" height="13" />
      </a>

      <a
        href="/highlights"
        class="btn-nav"
        class:active={page.url.pathname === "/highlights"}
      >
        <MaterialSymbolsBookRibbonOutlineRounded width="13" height="13" />
      </a>

      <a
        href="/art"
        class="btn-nav"
        class:active={page.url.pathname === "/art"}
      >
        <GravityUiFrames width="13" height="13" />
      </a>

      <a
        href="/sad"
        class="btn-nav"
        class:active={page.url.pathname === "/sad"}
      >
        <MaterialSymbolsSentimentNeutralOutlineRounded width="13" height="13" />
      </a>

      <form method="post" action="/login?/signout">
        <button class="btn-menu">
          <MaterialSymbolsLockOpenRightOutlineRounded width="13" height="13" />
        </button>
      </form>
    </div>
  </div>

  <div
    class="h-full px-2 rounded-2 overflow-hidden text-white/90 bg-black/80 backdrop-blur-md"
  >
    {#key $totalMemories}
      <div
        class="flex flex-col items-center justify-center"
        in:fly={{ y: -50, duration: 600 }}
      >
        <span class="font-tupa text-18 font-600 leading-21">
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
    {/key}
  </div>

  <a
    href="/weather"
    class="outline-none relative w-90 h-full rounded-2 overflow-hidden"
  >
    <WeatherButton />
  </a>

  <button
    class="outline-none relative w-90 h-full rounded-2 overflow-hidden"
    disabled={page.url.pathname !== "/vocab"}
    onclick={handleAutoplay}
  >
    {#if $isAutoPlay && page.url.pathname === "/vocab"}
      <img
        src={sunrise}
        alt="btn-play"
        class="absolute top-0 left-0 z-[2] w-90 h-full object-cover object-[-10px]"
        in:fly={{ y: -42, duration: 300 }}
      />
    {/if}

    <img
      src={sunrise}
      alt="btn-pause"
      class="absolute top-0 left-0 z-[1] grayscale w-90 h-full object-cover object-[-10px]"
    />

    {#if ["/vocab", "/quiz"].includes(page.url.pathname)}
      <img
        src={sunrise}
        alt="btn-play"
        class="absolute top-0 left-0 w-0 h-full z-[3] object-cover object-[-10px] transition-all duration-300"
        style="box-shadow: rgba(0, 0, 0, 0.9) 3px 0px 7px; width: {($listCount /
          $listContent.length) *
          90}px;"
      />
    {/if}
  </button>
</div>

<style lang="postcss">
  .btn-menu {
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 overflow-hidden bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
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
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 overflow-hidden bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-nav.active {
    @apply bg-white/60 text-black;
  }

  .circle {
    @apply flex items-center justify-center size-15 rounded-full border-2 border-white/15 text-9 leading-12 font-500 text-black text-center bg-white/15 shadow shadow-black/30;
    transition: 0.3s ease;
  }

  :global {
    .circle.active {
      @apply !border-green-400/60;
    }
    .circle.done {
      @apply !bg-green-400/60 !border-green-400/60;
    }
  }

  .progress {
    @apply absolute top-1/2 -translate-y-1/2 left-15 h-2 w-10 -z-1 bg-white/30 shadow shadow-black/30;
  }

  .progress-active {
    @apply absolute top-1/2 -translate-y-1/2 left-15 w-0 h-2 z-1 bg-green-400 shadow shadow-black/30;
    transition: 0.3s ease;
  }
</style>
