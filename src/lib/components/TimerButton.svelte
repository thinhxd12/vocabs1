<script lang="ts">
  import { timerString } from "$lib/store/layoutstore";
  import {
    handleGetListContent,
    sendNotification,
    showTimer,
  } from "$lib/store/navstore";
  import Icon from "@iconify/svelte";
  import { onDestroy } from "svelte";

  let interval: ReturnType<typeof setInterval>;

  function startCountdown() {
    clearInterval(interval);
    $timerString = "05:59";
    $showTimer = true;

    const startTime = Date.now();
    const targetTime = startTime + 6 * 60 * 1000;

    interval = setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = targetTime - currentTime;
      if (remainingTime <= 0) {
        clearInterval(interval);
        endCountdown();
        return;
      }
      const remainingMinutes = Math.floor(remainingTime / 1000 / 60);
      const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

      const minuteString = String(remainingMinutes).padStart(2, "0");
      const secondString = String(remainingSeconds).padStart(2, "0");
      timerString.set(minuteString + ":" + secondString);
    }, 1000);
  }

  function endCountdown() {
    handleGetListContent();
    sendNotification();
    $showTimer = false;
  }

  function stopCountdown() {
    clearInterval(interval);
    $showTimer = false;
  }

  $effect(() => {
    if ($showTimer) startCountdown();
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#if $showTimer}
  <button
    class="btn-timer group relative"
    onclick={stopCountdown}
    class:timerPlay={$showTimer}
  >
    <span class="absolute text-9 leading-15 text-white group-hover:opacity-0">
      {$timerString}
    </span>
    <span
      class="absolute text-9 leading-15 text-[#fe3d2c] opacity-0 group-hover:opacity-100"
      style="text-shadow: 0 0 3px #ea504a;"
    >
      STOP
    </span>
  </button>
{:else}
  <button onclick={startCountdown} class="btn-menu">
    <Icon
      icon="material-symbols:alarm-outline-rounded"
      width="13"
      height="13"
    />
  </button>
{/if}

<style lang="postcss">
  .btn-timer {
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 bg-white/20 text-black/60 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-menu {
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 bg-white/20 hover:bg-white/40 text-black/60 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .timerPlay {
    @apply min-w-50 bg-[#101213] px-5;
  }
</style>
