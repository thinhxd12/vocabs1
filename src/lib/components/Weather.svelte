<script lang="ts">
  import { locationList, showWeather } from "$lib/store/navstore";
  import type { SelectWeather } from "$lib/db/schema";
  import { getHourlyWeatherTomorrowData } from "$lib/functions";
  import { getConditionIconImage, TOMORROW_CONDITIONS } from "$lib/constants";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { format } from "date-fns";
  import { dragscroll } from "@svelte-put/dragscroll";
  import { Dialog } from "bits-ui";
  import { showLayout } from "$lib/store/layoutstore";

  let location = $state<SelectWeather | undefined>(undefined);
  let hourlyData = $state<any[] | undefined>(undefined);

  async function getWeatherData(lat: string, lon: string) {
    if (!location) return;
    const data = await getHourlyWeatherTomorrowData(lat, lon);
    hourlyData = data.hourly;
  }

  onMount(() => {
    const defaultLocation = $locationList[0];
    getWeatherData(defaultLocation.lat, defaultLocation.lon);
  });
</script>

<Dialog.Root bind:open={$showWeather} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-30" />
    <Dialog.Content
      class="fixed w-content {$showLayout
        ? 'inset-[calc(100vh-355px)_12px_48px_calc(100vw-390px)]'
        : 'inset-[calc(100vh-355px)_calc(50vw-189px)_48px_calc(50vw-189px)]'} z-50 overflow-y-scroll no-scrollbar outline-none"
    >
      <div
        class="w-content h-full layout-white rounded-3 overflow-hidden py-6 absolute bottom-0 left-0"
      >
        <select
          name="location"
          bind:value={location}
          onchange={() => getWeatherData(location!.lat, location!.lon)}
          class="mx-auto block min-w-1/3 appearance-none cursor-pointer bg-transparent mb-3 text-center text-21 font-400 leading-21 text-white outline-none"
        >
          {#each $locationList as item}
            <option
              value={item}
              class="text-12 font-400 text-center leading-12 text-black cursor-pointer"
            >
              {item.name}
            </option>
          {/each}
        </select>

        {#if hourlyData}
          <h1
            class="text-[99px] font-100 leading-[99px] text-white pl-33 text-center"
          >
            {Math.round(hourlyData[0].values.temperature || 0)}°
          </h1>

          <div class="flex w-full items-center justify-center">
            <span class="text-14 font-400 leading-16 text-white">
              {TOMORROW_CONDITIONS[hourlyData[0].values.weatherCode].name}
            </span>
            <img
              src={getConditionIconImage(
                hourlyData[0].values.weatherCode,
                "large",
                hourlyData[0].time
              )}
              width={30}
              class="ml-3"
              style="filter: drop-shadow(0 1px 3px black)"
              alt="current-icon"
            />
          </div>

          <div class="flex w-full items-center justify-center mb-6">
            <div class="mx-3 flex items-center justify-center text-white">
              <Icon icon="hugeicons:thermometer-warm" width="15" height="15" />
              <span class="ml-3 text-12 leading-15">
                {Math.round(hourlyData[0].values.temperatureApparent || 0)}°
              </span>
            </div>
            <div class="mx-3 flex items-center justify-center text-white">
              <Icon icon="hugeicons:droplet" width="15" height="15" />
              <span class="ml-3 text-12 leading-15">
                {hourlyData[0].values.humidity}%
              </span>
            </div>
            <div class="mx-3 flex items-end justify-center text-white">
              <Icon
                icon="hugeicons:arrow-up-02"
                width="15"
                height="15"
                style="transform: rotate({hourlyData[0].values.windDirection -
                  45}deg);"
                class="overflow-hidden rounded-full"
              />
              <span class="ml-3 text-12 leading-15">
                {Math.round(hourlyData[0].values.windGust || 0)}
                <small class="mt-3 leading-12">km/h</small>
              </span>
            </div>
            <div class="mx-3 flex items-center justify-center text-white">
              <Icon icon="tabler:uv-index" width="15" height="15" />
              <span class="ml-3 text-12 leading-15">
                {hourlyData[0].values.uvIndex}
              </span>
            </div>
          </div>

          <div
            use:dragscroll
            class="no-scrollbar select-none w-full flex snap-x snap-mandatory overflow-y-hidden overflow-x-scroll"
          >
            {#each hourlyData as item, i}
              <div
                class="flex flex-col items-center justify-center min-w-[63px] snap-start"
              >
                <h3 class="text-12 font-400 leading-21 text-white">
                  {i == 0 ? "Now" : format(item.time, "Ka")}
                </h3>

                {#if item.values.precipitationProbability > 0}
                  <p class="text-12 font-400 leading-15 text-[#0062bf]">
                    {item.values.precipitationProbability}%
                  </p>
                {:else}
                  <div class="size-15"></div>
                {/if}
                <img
                  height={36}
                  width={36}
                  style="filter: drop-shadow(0 1px 3px black)"
                  alt="hourly-icon"
                  src={getConditionIconImage(
                    item.values.weatherCode,
                    "large",
                    item.time
                  )}
                />
                <p class="text-13 font-400 leading-24 text-white">
                  {Math.round(item.values.temperature)}°
                </p>
                <h3 class="text-12 font-400 leading-21 text-white">
                  {format(item.time, "dd/MM")}
                </h3>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
