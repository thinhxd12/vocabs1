<script lang="ts">
  import { showLayout, timerString } from "$lib/store/layoutstore";
  import {
    handleGetListContent,
    sendNotification,
    showTimer,
  } from "$lib/store/navstore";
  import Icon from "@iconify/svelte";
  import { onDestroy, onMount } from "svelte";

  let interval: ReturnType<typeof setInterval>;
  let countdown = 6 * 60; //6 minutes
  let isPaused = $state<boolean>(false);
  let now = $state<number>(0);
  let end = $state<number>(0);
  let count = $state<number>(countdown);

  onMount(() => {
    handleReset();
  });

  function updateTimer() {
    now = Date.now();
    count = Math.round((end - now) / 1000);
    $timerString = minute() + ":" + second();
    if (now >= end) {
      handleGetListContent();
      sendNotification();
      $showTimer = false;
    }
  }

  function handleStart() {
    now = Date.now();
    end = now + count * 1000;
    interval = setInterval(updateTimer, 1000);
    isPaused = false;
  }

  function handlePause() {
    clearInterval(interval);
    isPaused = true;
  }

  function handleReset() {
    clearInterval(interval);
    isPaused = false;
    now = Date.now();
    end = now + countdown * 1000;
    interval = setInterval(updateTimer, 1000);
  }

  onDestroy(() => {
    clearInterval(interval);
  });

  function hour() {
    let h = Math.floor(count / 3600);
    return padValue(h);
  }

  function minute() {
    let h = Math.floor(count / 3600);
    let m = Math.floor((count - h * 3600) / 60);
    return padValue(m);
  }

  function second() {
    let h = Math.floor(count / 3600);
    let m = Math.floor((count - h * 3600) / 60);
    let s = count - h * 3600 - m * 60;
    return padValue(s);
  }

  function padValue(value: number, length = 2, char = "0") {
    const { length: currentLength } = value.toString();
    if (currentLength >= length) return value.toString();
    return `${char.repeat(length - currentLength)}${value}`;
  }
</script>

<section
  class="fixed no-scrollbar w-content {$showLayout
    ? 'inset-[48px_12px_48px_calc(100vw-390px)]'
    : 'inset-[48px_calc(50vw-189px)_48px_calc(50vw-189px)]'} z-10 flex flex-col items-center justify-center"
>
  <div
    class="my-9 min-h-[105px] w-content mx-auto relative flex no-scrollbar layout-white select-none items-center overflow-hidden rounded-3"
  >
    <h1
      class="absolute font-300 w-full left-1/2 -translate-x-1/2 flex justify-between items-center bg-transparent text-center text-[135px] leading-[105px] text-white/15"
    >
      <span class="w-[170px] text-center">{minute()}</span>
      <span class="leading-[90px] -mt-30">:</span>
      <span class="w-[170px] text-center">{second()}</span>
    </h1>
  </div>

  <div class="flex items-center justify-center gap-6">
    {#if isPaused}
      <button class="layout-white btn-timer" onclick={handleStart}>
        <Icon icon="solar:play-outline" width="15" height="15" />
      </button>
    {:else}
      <button class="layout-white btn-timer" onclick={handlePause}>
        <Icon icon="solar:pause-outline" width="15" height="15" />
      </button>
    {/if}

    <button class="layout-white btn-timer" onclick={handleReset}>
      <Icon icon="ri:reset-right-line" width="15" height="15" />
    </button>
  </div>
</section>

<style>
  .btn-timer {
    @apply outline-none my-3 flex size-27 items-center justify-center rounded-3 !bg-white/5 hover:!bg-white/15 transition duration-100 text-white/50;
  }
</style>
