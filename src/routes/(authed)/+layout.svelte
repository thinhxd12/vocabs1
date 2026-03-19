<script lang="ts">
  import Nav from "$lib/components/Nav.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import {
    getSchedule,
    getTodaySchedule,
    getTotalMemories,
  } from "$lib/store/navstore";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(async () => {
    getTotalMemories();
    await getSchedule();
    getTodaySchedule();
  });
</script>

<Toast />

<main class="flex-1 w-full flex justify-center items-start">
  {@render children()}
</main>

<nav class="sticky h-42 w-full flex justify-center">
  <Nav />
</nav>
