<script lang="ts">
  import Nav from "$lib/components/Nav.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import {
    currentForecastModel,
    currentLocationId,
    locationList,
    weatherData,
  } from "$lib/store/layoutstore";
  import { getUserSettingsData } from "$lib/store/localstore";
  import {
    getSchedule,
    getTodaySchedule,
    getTotalMemories,
  } from "$lib/store/navstore";
  import type { WeatherQueryParams } from "$lib/types";
  import { getOpenMeteoWeather } from "$lib/utils/functions";
  import { onDestroy, onMount } from "svelte";
  import { dev } from "$app/environment";

  let { children } = $props();

  let interval: ReturnType<typeof setInterval>;
  let timeout: ReturnType<typeof setTimeout>;

  onMount(async () => {
    getTotalMemories();
    await getSchedule();
    getTodaySchedule();

    await getUserSettingsData();
    await getNavWeatherData();
    startInterval();
  });

  async function getNavWeatherData() {
    const currentLocation = $locationList.find(
      (item) => item.id === $currentLocationId,
    );
    if (currentLocation) {
      let param: WeatherQueryParams = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        tempUnit: "c",
        model: $currentForecastModel,
      };
      $weatherData = await getOpenMeteoWeather(param);
    }
  }

  function startInterval() {
    const delay = calculateNextInterval();
    timeout = setTimeout(() => {
      getNavWeatherData();
      interval = setInterval(getNavWeatherData, 15 * 60 * 1000);
    }, delay);
  }

  function calculateNextInterval() {
    const now = new Date();
    let minutes = now.getMinutes();
    let nextIntervalMinutes = Math.ceil(minutes / 15) * 15;
    if (nextIntervalMinutes === 60) {
      nextIntervalMinutes = 0;
      now.setHours(now.getHours() + 1);
    }

    now.setMinutes(nextIntervalMinutes, 0, 0);
    const delay = now.getTime() - Date.now() + 30000;
    return delay;
  }

  onDestroy(() => {
    clearInterval(interval);
    clearTimeout(timeout);
  });
</script>

<Toast />

{@render children()}

<nav class="fixed h-42 bottom-0 w-full flex justify-center z-30">
  <Nav />
</nav>
