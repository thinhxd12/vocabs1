<script lang="ts">
  import { weatherData } from "$lib/store/layoutstore";
  import { getWeatherInfo } from "$lib/utils/w-conditions";
  import { untrack } from "svelte";
  import { fly } from "svelte/transition";

  interface WeatherInfo {
    description: string;
    icon: string;
    background: string;
  }

  let weatherInfo = $state<WeatherInfo | undefined>(undefined);

  $effect(() => {
    $weatherData;
    untrack(() => {
      if ($weatherData)
        weatherInfo = getWeatherInfo(
          $weatherData.current.weather_code,
          $weatherData.current.is_day,
        );
    });
  });
</script>

<div class="w-full h-full relative dark">
  {#if weatherInfo}
    <div class="absolute top-3 right-3 z-1 flex gap-3">
      <img
        src="/liquid/48/{weatherInfo.icon}.png"
        alt="icon"
        class="size-28 object-cover"
        style="filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 1));"
      />
      <div
        class="flex flex-col items-end text-white text-8 leading-9 font-500"
        style="text-shadow: 0px 0px 3px #000000"
      >
        <span class="font-600 text-9">
          {Math.round($weatherData?.current.temperature_2m || 0)}°
        </span>
        <span>
          {Math.round($weatherData?.current.apparent_temperature || 0)}°
        </span>
        {#if $weatherData?.current.rain}
          <span>{$weatherData?.current.rain} mm</span>
        {:else if $weatherData?.current.showers}
          <span>{$weatherData?.current.showers} mm</span>
        {:else if $weatherData?.current.snowfall}
          <span>{$weatherData?.current.snowfall} cm</span>
        {/if}
      </div>
    </div>

    {#key weatherInfo.background}
      <video
        src="/weathervideos/{weatherInfo.background}.mp4"
        autoplay
        loop
        muted
        playsinline
        class="absolute top-0 left-0 w-90 h-full object-cover object-left-top"
        in:fly={{ y: "-100%", duration: 600 }}
      >
        Your browser does not support the video tag.
      </video>
    {/key}

    <div
      class="marquee w-full absolute bottom-0 text-8 font-500 leading-12 text-white"
    >
      <span>{weatherInfo.description}</span>
    </div>
  {/if}
</div>

<style lang="postcss">
  .marquee span {
    margin: 0 9px;
    text-shadow: 0px 0px 3px #000000;
  }

  .marquee {
    white-space: nowrap;
    overflow: hidden;
    animation: marquee 6s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
</style>
