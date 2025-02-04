<script lang="ts">
  import Menu from "$lib/components/Menu.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { getCurrentWeatherData } from "$lib/functions.js";
  import { showLayout } from "$lib/store/layoutstore";
  import {
    todaySchedule,
    totalMemories,
    locationList,
  } from "$lib/store/navstore.js";
  import { format } from "date-fns";
  import { Toaster, toast } from "svelte-sonner";

  let { data, children } = $props();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  $totalMemories = data.totalMemories;

  if (data.schedule) {
    let index = data.schedule.findIndex(
      (item) =>
        format(item.date!, "yyyy-MM-dd") === todayDate || item.date === null
    );

    $todaySchedule = {
      start: data.schedule[index],
      end: data.schedule[index + 1],
    };
  }

  $locationList = data.weather;
</script>

<section
  class="w-full h-full relative flex {$showLayout
    ? 'flex-row-reverse'
    : ''} items-end justify-center"
>
  <div class="w-main h-full flex flex-col items-center">
    <div class="flex-1">
      {@render children()}
    </div>
    <Nav />
  </div>
  <div class={$showLayout ? "menu-bar-right" : "menu-bar-center"}>
    <Menu />
  </div>
  {#if $showLayout}
    <div class="bg-red-400 flex-1 h-full"></div>
  {/if}
</section>
<Toaster position="top-right" richColors />

<style>
  @media only screen and (max-width: 600px) {
    .menu-bar-center {
      width: 378px !important;
      inset: 48px calc(50vw - 189px) 60px calc(50vw - 189px) !important;
    }
  }

  .menu-bar-center {
    position: fixed;
    width: 440px;
    inset: 48px calc(50vw - 220px) 60px calc(50vw - 220px);
    display: flex;
    align-items: flex-end;
    justify-content: end;
    z-index: 10;
  }

  .menu-bar-right {
    position: fixed;
    width: 378px;
    inset: 48px 12px 60px calc(100vw - 390px);
    display: flex;
    align-items: flex-end;
    justify-content: end;
    z-index: 10;
  }
</style>
