<script lang="ts">
  import Nav from "$lib/components/Nav.svelte";
  import { todaySchedule, totalMemories } from "$lib/store/navstore";
  import { format } from "date-fns";
  import { Toaster } from "svelte-sonner";

  let { data, children } = $props();
  const todayDate = format(new Date(), "yyyy-MM-dd");

  // svelte-ignore state_referenced_locally
  $totalMemories = data.totalMemories || 0;

  // svelte-ignore state_referenced_locally
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
</script>

<Toaster
  position="top-center"
  duration={3000}
  visibleToasts={6}
  toastOptions={{
    unstyled: true,
  }}
/>

<main class="flex-1 w-full flex justify-center items-start">
  {@render children()}
</main>

<nav class="sticky h-42 w-full flex justify-center">
  <Nav />
</nav>
