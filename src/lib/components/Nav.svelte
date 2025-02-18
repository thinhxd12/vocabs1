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
  import { onDestroy } from "svelte";

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
      precipitationProbability: 0,
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

  getNavWeatherData();
  interval = setInterval(
    () => {
      getNavWeatherData();
    },
    1000 * 15 * 60
  );

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<nav class="w-content h-[42px] flex">
  <div
    class="flex h-36 w-12 flex-col items-center justify-between bg-black/60 shadow-md shadow-black/45 backdrop-blur-md overflow-hidden"
  >
    <div class="flex flex-col justify-center text-center">
      {#if $todaySchedule}
        <span class="text-9 leading-11 text-white">
          {$todaySchedule.start.count}
        </span>
        <span class="text-9 leading-11 text-white">
          {$todaySchedule.end.count}
        </span>
      {:else}
        <span class="text-9 leading-10 text-white">N</span>
        <span class="text-9 leading-10 text-white">N</span>
      {/if}
    </div>
    <div
      class="-rotate-90 bg-white/15 text-center w-14 h-14 text-8 leading-12 text-white"
    >
      {format(todayDate, "eeeeee")}
    </div>
  </div>

  <a
    href="/vocab"
    class:active={page.url.pathname === "/vocab"}
    class="btn-nav"
  >
    Danger is sweet.Dulce periculum.
  </a>

  <a
    href="/schedule"
    class:active={page.url.pathname === "/schedule"}
    class="btn-nav"
    data-sveltekit-preload-data="tap"
  >
    Pecunia non olet.Money does not stink.
  </a>

  <a href="/quiz" class="btn-nav" class:active={page.url.pathname === "/quiz"}>
    Memento mori.Rem'ber you will die.
  </a>

  <div
    class="ml-3 flex h-36 flex-col items-center px-1 justify-center bg-black/60 text-white shadow-sm shadow-black/45 backdrop-blur-md"
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
    class="btn-weather relative"
    style="background-image: url({getConditionBackground(
      navWeatherData.values.weatherCode,
      navWeatherData.time
    )})"
    onclick={() => ($showWeather = !$showWeather)}
  >
    <div class="flex absolute top-1 right-3 justify-center items-center gap-3">
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
      <span
        class="text-9 font-500 leading-18 text-white"
        style="text-shadow: 0px 0px 6px #000000"
      >
        {Math.round(navWeatherData.values.temperature)}°
      </span>
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
        style="box-shadow: rgba(0, 0, 0, 0.6) 2px 0px 6px; border-right: 0.5px solid rgb(0, 0, 0); background-size: 90px 36px; width: {Math.floor(
          (($listCount + 1) / $listContent.length) * 90
        )}px;"
      ></div>
    {/if}
  </button>
</nav>

<style>
  .btn-nav {
    @apply ml-3 rounded-2 outline-none flex h-36 flex-1 items-center justify-center overflow-hidden text-center text-8 font-400 leading-8 text-transparent shadow-sm shadow-black/45 bg-black/20 backdrop-blur-md hover:text-white;
  }

  .btn-nav.active {
    @apply text-white;
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
