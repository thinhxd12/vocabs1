<script lang="ts">
  import "../app.css";
  import {
    handleChangeLayoutImage,
    layoutImage,
    showLayout,
  } from "$lib/store/layoutstore";
  let { children } = $props();
  import { onMount } from "svelte";
  import { logout } from "$lib/functions";
  onMount(async () => {
    handleChangeLayoutImage();
    const loginTime = localStorage.getItem("login_time");
    if (!loginTime) {
      logout();
      return;
    }
    const t = JSON.parse(loginTime).t;
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (now - t >= SEVEN_DAYS) {
      logout();
    } else {
      fetch("/server/setcookie", { method: "POST" });
    }
  });
</script>

<main class="h-screen w-screen relative bg-cover overflow-hidden">
  {#if $layoutImage}
    <img
      src={$layoutImage.url}
      alt="bg"
      class="w-full h-full object-cover absolute"
    />
    {#if !$showLayout}
      <p
        style="text-shadow: 0 0 3px black;"
        class="absolute w-[calc(50vw-215px)] hidden md:block left-0 top-0 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white"
      >
        {@html $layoutImage.copyright}
      </p>
    {/if}
  {/if}

  {@render children()}
</main>
