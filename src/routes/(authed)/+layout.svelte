<script lang="ts">
  import Nav from "$lib/components/Nav.svelte";
  import {
    todaySchedule,
    totalMemories,
    locationList,
  } from "$lib/store/navstore";
  import { format } from "date-fns";
  import { Toaster } from "svelte-sonner";

  let { data, children } = $props();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  $totalMemories = data.totalMemories || 0;

  if (data.schedule) {
    let index = data.schedule.findIndex(
      (item) =>
        format(item.date!, "yyyy-MM-dd") === todayDate || item.date === null,
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

<Toaster
  position="top-center"
  duration={3000}
  visibleToasts={6}
  toastOptions={{
    unstyled: true,
  }}
/>

<main class="absolute w-full h-full z-[3]">
  {@render children()}
</main>

<nav class="absolute w-full h-42 bottom-0 left-0 flex justify-center z-[5]">
  <Nav />
</nav>
