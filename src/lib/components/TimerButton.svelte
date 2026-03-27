<script lang="ts">
  import { page } from "$app/state";
  import { sendNotification, showTimer } from "$lib/store/navstore";
  import {
    formatTimerString,
    padWithZeroes,
    secondsToMinutes,
  } from "$lib/utils/functions";
  import { onDestroy } from "svelte";
  import RiAlarmLine from "~icons/ri/alarm-line";

  const timeCount = 6 * 60;
  let interval: ReturnType<typeof setInterval>;
  let now = $state<number>(0);
  let end = $state<number>(0);
  let secondsRemaining = $state<number>(timeCount);

  function startCountdown() {
    clearInterval(interval);
    now = Date.now();
    end = now + secondsRemaining * 1000;
    interval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    now = Date.now();
    secondsRemaining = Math.round((end - now) / 1000);
    if (now >= end) {
      sendNotification();
      stopCountdown();
    }
  }

  function stopCountdown() {
    clearInterval(interval);
    $showTimer = false;
    secondsRemaining = timeCount;
  }

  $effect(() => {
    if ($showTimer) {
      startCountdown();
    }
  });

  onDestroy(() => {
    stopCountdown();
  });
</script>

<svelte:head>
  {#if $showTimer && page.url.pathname !== "/pomodoro"}
    <title>{formatTimerString(secondsRemaining)}</title>
  {/if}
</svelte:head>

{#if $showTimer}
  <button
    class="btn-timer group relative"
    onclick={stopCountdown}
    class:timerPlay={$showTimer}
  >
    <span
      class="absolute w-full flex items-center justify-center text-9 leading-15 text-white group-hover:opacity-0"
    >
      <span class="w-1/2 text-right">
        {padWithZeroes(secondsToMinutes(secondsRemaining))}
      </span>
      <span class="min-w-6">:</span>
      <span class="w-1/2 text-left">
        {padWithZeroes(secondsRemaining % 60)}
      </span>
    </span>
    <span
      class="absolute text-9 leading-15 text-[#fe3d2c] opacity-0 group-hover:opacity-100"
      style="text-shadow: 0 0 3px #ea504a;"
    >
      STOP
    </span>
  </button>
{:else}
  <button onclick={() => ($showTimer = true)} class="btn-menu">
    <RiAlarmLine width="14" height="14" />
  </button>
{/if}

<style lang="postcss">
  .btn-timer {
    @apply h-16 min-w-18 flex items-center justify-center rounded-2 bg-white/20 text-black/60 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-menu {
    @apply h-16 min-w-18 flex items-center justify-center rounded-2 bg-white/20 hover:bg-white/40 text-black/60 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .timerPlay {
    @apply min-w-36 bg-[#101213] px-5;
  }
</style>
