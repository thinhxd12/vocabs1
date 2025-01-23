<script lang="ts">
  import Menu from "$lib/components/Menu.svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { showLayout } from "$lib/store/layout";
  let { children } = $props();
</script>

<main
  class="w-full h-full relative flex {$showLayout
    ? 'flex-row-reverse'
    : ''} items-end justify-center"
>
  <section class="w-[402px] h-full flex flex-col">
    <div class="flex-1 bg-blue-400">
      {@render children()}
    </div>
    <Nav />
  </section>
  <div class="mb-36">
    <Menu />
  </div>
  {#if $showLayout}
    <section class="bg-red-400 flex-1 h-full"></section>
  {/if}
</main>
