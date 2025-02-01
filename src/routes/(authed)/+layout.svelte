<script lang="ts">
  import Menu from "$lib/components/Menu.svelte";
  import Nav from "$lib/components/Nav.svelte";
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

<main
  class="w-full h-full relative flex {$showLayout
    ? 'flex-row-reverse'
    : ''} items-end justify-center"
>
  <section class="w-main h-full flex flex-col items-center">
    <div class="flex-1">
      {@render children()}
    </div>
    <Nav />
  </section>
  <div class="mb-[42px]">
    <Menu />
  </div>
  {#if $showLayout}
    <section class="bg-red-400 flex-1 h-full"></section>
  {/if}
</main>
<Toaster position="top-right" richColors />
