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
    showWeather,
    todaySchedule,
    totalMemories,
  } from "$lib/store/navstore";
  import type { TomorrowWeatherCurrentType } from "$lib/types";
  import { format } from "date-fns";
  import { getCurrentWeatherTomorrowData } from "$lib/functions";
  import { onDestroy, onMount } from "svelte";
  import Icon from "@iconify/svelte";

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
</script>

<nav class="w-content h-[42px] flex z-20">
  <div
    class="w-12 h-36 rounded-1 mr-3 flex flex-col items-center justify-between overflow-hidden"
  >
    <div
      class="w-full h-22 layout-black !bg-black/90 flex flex-col justify-center text-center"
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

    <div class="w-full h-14 flex items-center justify-center layout-white">
      <span class="transform -rotate-90 origin-center text-8 font-500"
        >{format(todayDate, "eeeeee")}</span
      >
    </div>
  </div>
  <div
    class="layout-white h-36 flex-1 overflow-hidden rounded-1 flex justify-center items-center"
  >
    <a
      href="/vocab"
      class:active={page.url.pathname === "/vocab"}
      class="btn-nav"
    >
      <Icon icon="solar:compass-square-linear" width="15" height="15" />
    </a>

    <a
      href="/schedule"
      class:active={page.url.pathname === "/schedule"}
      class="btn-nav"
      data-sveltekit-preload-data="hover"
    >
      <Icon icon="solar:calendar-linear" width="15" height="15" />
    </a>

    <a
      href="/quiz"
      class="btn-nav"
      class:active={page.url.pathname === "/quiz"}
    >
      <Icon icon="solar:file-check-linear" width="15" height="15" />
    </a>
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

  <button
    class={$isAutoPlay ? "btn-play" : "btn-pause"}
    onclick={handleAutoplay}
  >
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
    @apply outline-none size-27 mx-3 flex items-center justify-center text-black/50 hover:text-black transition duration-300;
  }

  .btn-nav.active {
    @apply text-black;
  }

  .btn-weather {
    @apply relative rounded-2 outline-none ml-3 block h-36 min-w-[90px] overflow-hidden shadow-sm shadow-black/45 bg-cover;
  }

  .btn-play {
    @apply cursor-pointer rounded-2 outline-none relative ml-3 block h-36 min-w-[90px] overflow-hidden shadow-sm shadow-black/45 bg-[url(/images/sunrise.webp)] bg-cover;
  }

  .btn-pause {
    @apply cursor-pointer rounded-2 outline-none relative ml-3 block h-36 min-w-[90px] overflow-hidden shadow-sm shadow-black/45 bg-[url(/images/sunset.webp)] bg-cover;
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
