<script lang="ts">
  import { page } from "$app/state";
  import {
    getConditionBackground,
    getConditionIconImage,
    TOMORROW_CONDITIONS,
  } from "$lib/constants";
  import {
    handleAutoplay,
    isAutoPlay,
    listContent,
    listCount,
    locationList,
    showTimer,
    showWeather,
    todaySchedule,
    totalMemories,
    currentSchedule,
    handleGetListContent,
  } from "$lib/store/navstore";
  import type { TomorrowWeatherCurrentType } from "$lib/types";
  import { format } from "date-fns";
  import { getCurrentWeatherTomorrowData } from "$lib/functions";
  import Icon from "@iconify/svelte";
  import { onDestroy, onMount } from "svelte";
  import { innerWidth } from "svelte/reactivity/window";
  import { showBookmark, showLayout } from "$lib/store/layoutstore";
  import { dev } from "$app/environment";
  import { showTranslate } from "$lib/store/vocabstore";

  const todayDate = format(new Date(), "yyyy-MM-dd");
  type WeatherDataType = {
    time: string;
    values: TomorrowWeatherCurrentType;
  };

  let navWeatherData = $state<WeatherDataType>({
    time: "2025-02-18T04:43:00Z",
    values: {
      cloudBase: 1.2,
      cloudCeiling: 1.2,
      cloudCover: 100,
      dewPoint: 21.8,
      freezingRainIntensity: 0,
      hailProbability: 44.5,
      hailSize: 6,
      humidity: 59,
      precipitationProbability: 100,
      pressureSeaLevel: 1013,
      pressureSurfaceLevel: 1013,
      rainIntensity: 0,
      sleetIntensity: 0,
      snowIntensity: 0,
      temperature: 30.8,
      temperatureApparent: 34.2,
      uvHealthConcern: 3,
      uvIndex: 10,
      visibility: 12.5,
      weatherCode: 1001,
      windDirection: 10,
      windGust: 5.1,
      windSpeed: 1.7,
    },
  });

  let interval: ReturnType<typeof setInterval>;

  async function getNavWeatherData() {
    const defaultLocation = $locationList[0];
    const data = await getCurrentWeatherTomorrowData(
      defaultLocation.lat,
      defaultLocation.lon
    );
    if (data) navWeatherData = data;
  }

  if (!dev) {
    onMount(() => {
      getNavWeatherData();
      interval = setInterval(
        () => {
          getNavWeatherData();
        },
        1000 * 15 * 60
      );
    });
    onDestroy(() => {
      clearInterval(interval);
    });
  }
  function handleGetList(numb: number) {
    $currentSchedule = numb === 0 ? $todaySchedule!.start : $todaySchedule!.end;
    handleGetListContent();
  }
</script>

<nav class="w-content h-[42px] flex z-20">
  <div
    class="w-12 h-36 rounded-1 mr-3 flex flex-col items-center justify-between overflow-hidden shadow-sm shadow-black/45 ring-1 ring-white/15"
  >
    <div
      class="w-full h-22 bg-black/45 flex flex-col justify-center text-center backdrop-blur-xl"
    >
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

    <div
      class="w-full h-14 flex items-center justify-center bg-white/30 backdrop-blur-xl"
    >
      <span
        class="uppercase transform -rotate-90 origin-center text-7 font-600"
      >
        {format(todayDate, "eeeeee")}
      </span>
    </div>
  </div>
  <div
    class="layout-black h-36 flex-1 overflow-hidden rounded-1 flex flex-wrap justify-center"
  >
    <div class="w-full flex justify-center items-center">
      <button
        class="btn-menu"
        class:active={$todaySchedule &&
          $todaySchedule.start.id === $currentSchedule?.id}
        onclick={() => handleGetList(0)}
      >
        {#if $todaySchedule}
          <span>{$todaySchedule.start.index}</span>
        {:else}
          <Icon icon="solar:close-circle-linear" width="13" height="13" />
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
          <Icon icon="solar:close-circle-linear" width="13" height="13" />
        {/if}
      </button>

      <button
        class="btn-menu {$showTimer ? 'timer' : ''}"
        onclick={() => ($showTimer = !$showTimer)}
      >
        <Icon
          icon="solar:alarm-sleep-outline"
          width="13"
          height="13"
          class="relative z-20"
        />
      </button>

      {#if innerWidth.current && innerWidth.current > 1500}
        {#if $showLayout}
          <button
            class="btn-nav"
            class:active={$showLayout}
            onclick={() => ($showLayout = !$showLayout)}
          >
            <Icon
              icon="solar:align-horizontal-center-outline"
              width="13"
              height="13"
            />
          </button>
        {:else}
          <button
            class="btn-nav"
            class:active={$showLayout}
            onclick={() => {
              $showBookmark = true;
              $showLayout = true;
            }}
          >
            <Icon icon="solar:align-right-outline" width="13" height="13" />
          </button>
        {/if}
      {/if}
    </div>

    <div class="w-full flex justify-center items-center">
      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
      >
        <Icon icon="solar:document-linear" width="13" height="13" />
      </a>

      <a
        href="/schedule"
        class:active={page.url.pathname === "/schedule"}
        class="btn-nav"
      >
        <Icon icon="solar:calendar-date-linear" width="13" height="13" />
      </a>

      <a
        href="/quiz"
        class="btn-nav"
        class:active={page.url.pathname === "/quiz"}
      >
        <Icon
          icon="solar:list-check-minimalistic-bold"
          width="13"
          height="13"
        />
      </a>

      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
        onclick={() => ($showTranslate = true)}
      >
        <Icon icon="fluent:translate-16-regular" width="15" height="15" />
      </a>

      <a
        href="/sad"
        class="btn-nav"
        class:active={page.url.pathname === "/sad"}
      >
        <Icon
          icon="solar:expressionless-square-linear"
          width="13"
          height="13"
        />
      </a>

      <a
        href="/live"
        class:active={page.url.pathname === "/live"}
        class="btn-nav"
      >
        <Icon icon="solar:balls-broken" width="13" height="13" />
      </a>

      <form method="post" action="/login?/signout">
        <button class="btn-menu">
          <Icon icon="solar:logout-outline" width="13" height="13" />
        </button>
      </form>
    </div>
  </div>

  <div
    class="ml-3 flex rounded-1 h-36 flex-col items-center px-2 justify-center text-white layout-black !bg-black/90"
  >
    <span class="font-tupa text-18 font-600 leading-17">
      {Math.floor($totalMemories / 100) < 10
        ? "0" + Math.floor($totalMemories / 100)
        : Math.floor($totalMemories / 100)}
    </span>
    <span class="font-tupa text-18 font-600 leading-17">
      {$totalMemories % 100 < 10
        ? "0" + ($totalMemories % 100)
        : $totalMemories % 100}
    </span>
  </div>

  <button
    class="btn-weather relative before:bg-black/15 before:absolute before:inset-0 before:content-['']"
    style="background-image: url({getConditionBackground(
      navWeatherData.values.weatherCode,
      navWeatherData.time
    )})"
    onclick={() => ($showWeather = !$showWeather)}
  >
    <div class="flex absolute top-1 right-3 justify-center items-start gap-3">
      <img
        src={getConditionIconImage(
          navWeatherData.values.weatherCode,
          "large",
          navWeatherData.time
        )}
        alt="weather-icon"
        width={21}
        height={21}
        style="filter: drop-shadow(0px 2px 2px #000000)"
      />
      <div
        class="flex flex-col items-end justify-center font-500 text-white"
        style="text-shadow: 0px 0px 6px #000000"
      >
        <span class="text-8 leading-8">
          {Math.round(navWeatherData.values.temperature)}°
        </span>
        <span class="text-8 leading-8">
          {Math.round(navWeatherData.values.temperatureApparent)}°
        </span>
        <span class="text-8 leading-8 flex gap-1 items-center">
          {#if navWeatherData.values.precipitationProbability}
            <Icon icon="solar:umbrella-bold" width="9" height="9" />
            <span
              class=" text-8 leading-8 mr-1"
              style="text-shadow: 0px 0px 6px #fff"
              >{navWeatherData.values.precipitationProbability}%</span
            >
          {/if}
          <Icon icon="solar:cloud-bold" width="9" height="9" />
          {navWeatherData.values.cloudCover}<small>%</small>
        </span>
      </div>
    </div>
    <div class="flex absolute bottom-0 left-0 z-10 w-full">
      <div class="marquee-container">
        <div class="marquee-content">
          {TOMORROW_CONDITIONS[navWeatherData.values.weatherCode].name}
        </div>
      </div>
      <div class="marquee-container">
        <div class="marquee-content">
          {TOMORROW_CONDITIONS[navWeatherData.values.weatherCode].name}
        </div>
      </div>
    </div>
  </button>

  <button class="btn-autoplay" onclick={handleAutoplay}>
    {#if $isAutoPlay}
      <img
        src="/images/sunrise.webp"
        alt="btn-play"
        width="100%"
        height="100%"
      />
    {:else}
      <img
        src="/images/sunrise.webp"
        alt="btn-pause"
        width="100%"
        height="100%"
        class="grayscale"
      />
    {/if}
    {#if $listCount}
      <div
        class={`absolute left-0 top-0 z-30 h-full bg-[url('/images/sunrise.webp')] bg-cover transition-all duration-300`}
        style="box-shadow: rgba(0, 0, 0, 0.6) 2px 0px 6px; border-right: 0.5px solid rgb(0, 0, 0); background-size: 90px 36px; width: {($listCount /
          $listContent.length) *
          90}px;"
      ></div>
    {/if}
  </button>
</nav>

<style>
  .btn-nav {
    @apply outline-none h-15 min-w-17 px-2 mx-2 rounded-2 flex items-center justify-center bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-nav.active {
    @apply bg-white/60 text-black;
  }

  .btn-menu {
    @apply mx-2 flex h-15 min-w-17 px-2 items-center justify-center rounded-2 bg-white/20 hover:bg-white/40  text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-menu span {
    @apply text-9 leading-13 font-500;
  }

  .btn-menu.active {
    @apply !bg-green-400/60 text-black;
  }

  .btn-menu.timer {
    @apply !bg-blue-500/60 text-black;
  }

  .btn-weather {
    @apply relative rounded-2 outline-none ml-3 block h-36 min-w-[90px] overflow-hidden  shadow-md shadow-black/30 ring-1 ring-white/15 bg-cover;
  }

  .btn-autoplay {
    @apply rounded-2 outline-none relative ml-3 h-36  min-w-[90px]  w-[90px] overflow-hidden shadow-md shadow-black/30 ring-1 ring-white/15;
  }

  .marquee-container {
    display: flex;
    animation: marquee 9s linear infinite;
  }

  .marquee-content {
    @apply min-w-[72px] text-nowrap px-9 text-8 font-600 leading-9 text-white;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
</style>
