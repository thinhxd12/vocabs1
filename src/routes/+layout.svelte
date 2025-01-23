<script lang="ts">
  import { showLayout } from "$lib/store/layout";
  import "../app.css";
  let { data, children } = $props();
  import { innerWidth } from "svelte/reactivity/window";
</script>

<main
  class="h-screen w-screen relative bg-cover"
  style:background-image={innerWidth.current && innerWidth.current > 640
    ? `url(${data.image_L})`
    : `url(${data.image_P})`}
>
  {#if innerWidth.current && innerWidth.current > 640 && !$showLayout}
    <div
      class="group absolute left-0 top-0 z-50 hidden w-[calc(50vw-215px)] md:block"
    >
      <p
        style="text-shadow: 0 0 3px black;"
        class="absolute left-0 top-0 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white opacity-100 transition group-hover:opacity-0"
      >
        {@html data.hs1_title}
      </p>
      <p
        style="text-shadow: 0 0 3px black;"
        class="absolute left-0 top-0 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white opacity-0 transition group-hover:opacity-100"
      >
        {@html data.hs2_title}
      </p>
    </div>
  {/if}

  {@render children()}
</main>
