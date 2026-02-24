<script lang="ts">
  import "../app.css";
  import "../styles/fonts.css";
  import { page } from "$app/state";
  import { schedule } from "$lib/store/navstore";
  import LayoutBackground from "$lib/components/LayoutBackground.svelte";

  let { children } = $props();

  $schedule = page.data.schedule;
</script>

<main class="h-screen w-screen relative overflow-hidden">
  <LayoutBackground />
  {@render children()}
</main>
