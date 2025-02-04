<script lang="ts">
  import "../app.css";
  import { showLayout } from "$lib/store/layoutstore";
  let { data, children } = $props();
  // let { children } = $props();
  import { innerWidth } from "svelte/reactivity/window";
  import type { LoginImageType } from "$lib/types";
  // let data = {
  //   title: "Sailing the Spice Islands",
  //   hs1_title: "Zanzibar, Tanzania",
  //   hs2_title:
  //     "Traditional sailboats called dhows ply Zanzibar's azure seas, adding a dash of accent color to this wash of blue-green. The small dhows seen here are for fishing or leisure, but larger ones once shipped goods all over the Indian Ocean—with their sleek, sturdy hulls, shipping heavy goods from fresh fruit to solid gold became a breeze. What coveted commodity made Zanzibar a heavyweight exporter? Spices. Cultivating cloves, cinnamon, and other seasonings, this island group in Tanzania has been a titan of trade for over a millennium.",
  //   image_L:
  //     "https://res.public.onecdn.static.microsoft/creativeservice/45474209-8072-9009-3b6d-13d9e56b1c6f_desktop-b017_ds_zanzibarbeach_gettyimages-1466695095_3840x2160.jpg",
  //   image_P:
  //     "https://res.public.onecdn.static.microsoft/creativeservice/af78e733-4dad-5e49-2b19-98fb5ae12d41_desktop-b017_ds_zanzibarbeach_gettyimages-1466695095_1080x1920.jpg",
  //   hash: "",
  // } as LoginImageType;
</script>

<main
  class="h-screen w-screen relative bg-cover"
  style:background-image={innerWidth.current && innerWidth.current > 640
    ? `url(${data.image_L})`
    : `url(${data.image_P})`}
>
  {#if innerWidth.current && innerWidth.current > 600 && !$showLayout}
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
