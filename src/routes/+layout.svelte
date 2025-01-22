<script lang="ts">
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
  <header>
    <nav class="absolute right-0">
      <a href="/">Home</a>
      <a href="/vocab">vocab</a>
      <a href="/login">Login</a>
      <a href="/about">about</a>
    </nav>
    {#if innerWidth.current && innerWidth.current > 640}
      <div class="group absolute left-0 top-0 z-50 hidden w-1/3 md:block">
        <p
          style="text-shadow: 0 0 3px black;"
          class="absolute left-0 top-0 z-40 cursor-pointer pl-6 pt-3 text-12 leading-16 text-white opacity-100 transition group-hover:opacity-0"
        >
          {@html data.hs1_title}
        </p>
        <p
          style="text-shadow: 0 0 3px black;"
          class="absolute left-0 top-0 z-40 cursor-pointer pl-6 pt-3 text-12 leading-16 text-white opacity-0 transition group-hover:opacity-100"
        >
          {@html data.hs2_title}
        </p>
      </div>
    {/if}
  </header>
  {@render children()}
</main>
