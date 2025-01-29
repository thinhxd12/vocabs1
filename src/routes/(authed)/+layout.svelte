<script lang="ts">
  import Menu from "$lib/components/Menu.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { showLayout } from "$lib/store/layoutstore";
  import { totalMemories } from "$lib/store/navstore.js";

  let { data, children } = $props();
  $totalMemories = data.totalMemories;
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
