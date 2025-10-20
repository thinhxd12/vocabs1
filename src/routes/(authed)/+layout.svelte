<script lang="ts">
  import Art from "$lib/components/Art.svelte";
  import Bookmark from "$lib/components/Bookmark.svelte";
  import Menu from "$lib/components/Menu.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import Timer from "$lib/components/Timer.svelte";
  import Weather from "$lib/components/Weather.svelte";
  import { showBookmark, showLayout } from "$lib/store/layoutstore";
  import {
    locationList,
    showWeather,
    todaySchedule,
    totalMemories,
    showTimer,
  } from "$lib/store/navstore";
  import { format } from "date-fns";
  import { Toaster } from "svelte-sonner";
  import { page } from "$app/state";

  let { data, children } = $props();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  $totalMemories = data.totalMemories || 0;

  if (data.schedule) {
    let index = data.schedule.findIndex(
      (item) =>
        format(item.date!, "yyyy-MM-dd") === todayDate || item.date === null
    );

    if (index > -1) {
      $todaySchedule = {
        start: data.schedule[index],
        end: data.schedule[index + 1],
      };
    } else $todaySchedule = undefined;
  }

  $locationList = data.weatherList || [];
</script>

<section
  class="w-full h-full relative flex {$showLayout
    ? 'flex-row-reverse'
    : ''} items-end justify-center z-20"
>
  {#if page.url.pathname !== "/live"}
    <div class="w-main h-full flex flex-col items-center">
      <div class="flex-1">
        {@render children()}
      </div>
      <Nav />
    </div>
    <div class={$showLayout ? "menu-bar-right" : "menu-bar-center"}>
      <Menu />
    </div>
  {:else}
    {@render children()}
  {/if}

  {#if $showLayout}
    {#if $showBookmark}
      <Bookmark />
    {:else}
      <Art />
    {/if}
  {/if}

  {#if $showWeather}
    <Weather />
  {/if}

  {#if $showTimer}
    <Timer />
  {/if}
</section>

<Toaster position="top-center" richColors />

<style>
  @media only screen and (max-width: 405px) {
    .menu-bar-center {
      inset: auto calc(50vw - 189px) 60px auto !important;
    }
  }

  .menu-bar-center {
    position: fixed;
    width: 30px;
    height: 300px;
    inset: auto auto 45px calc(50vw + 200px);
    display: flex;
    align-items: flex-end;
    justify-content: end;
    z-index: 20;
  }

  .menu-bar-right {
    position: fixed;
    width: 30px;
    height: 300px;
    inset: auto 12px 45px auto;
    display: flex;
    align-items: flex-end;
    justify-content: end;
    z-index: 20;
  }
</style>
