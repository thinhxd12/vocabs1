<script lang="ts">
  import { weatherData } from "$lib/store/navstore";
  import { getWeatherInfo } from "$lib/utils/w-conditions";

  interface WeatherInfo {
    description: string;
    icon: string;
    background: string;
  }

  let weatherInfo = $state<WeatherInfo | undefined>(undefined);

  $effect(() => {
    if ($weatherData) {
      weatherInfo = getWeatherInfo(
        $weatherData.current.weather_code,
        $weatherData.current.is_day
      );
    }
  });
</script>

<div class="w-full h-full relative">
  {#if weatherInfo}
    <div class="absolute top-0 right-0 z-[1] flex gap-3">
      <img
        src="/liquid/48/{weatherInfo.icon}.png"
        alt="icon"
        class="size-28 object-cover"
        style="filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.6));"
      />
      <div
        class="flex flex-col items-end text-white text-8 leading-9 mt-3 mr-2 font-500"
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

    <img
      src="/navweather/{weatherInfo.background}.webp"
      alt="wtb"
      class="absolute top-0 left-0 w-90 h-full object-cover"
    />

    <div class="absolute w-full h-full bg-black/15"></div>

    <!-- svelte-ignore a11y_distracting_elements -->
    <marquee
      class="marquee absolute bottom-0 text-8 font-500 leading-12 text-white"
      scrollamount="1"
      width="90"
    >
      <span>{weatherInfo.description}</span>
    </marquee>
  {/if}
</div>

<style>
  .marquee span {
    margin: 0 9px;
    text-shadow: 0px 0px 3px #000000;
  }
</style>
