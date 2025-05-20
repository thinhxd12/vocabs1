<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import { schedule } from "$lib/store/navstore";
  import Rainvid from "$lib/components/Rainvid.svelte";

  let { children } = $props();

  $schedule = page.data.schedule;
</script>

<main class="h-screen w-screen relative bg-cover overflow-hidden">
  <Rainvid />
  {@render children()}
</main>
