<script lang="ts">
  import { wakeEnable } from "$lib/store/navstore";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import MaterialSymbolsSunnyRounded from "~icons/material-symbols/sunny-rounded";
  import MaterialSymbolsDarkModeRounded from "~icons/material-symbols/dark-mode-rounded";

  let wakeLock = $state<WakeLockSentinel | null>(null);
  let isDisabled = $state<boolean>(true);
  let status = $state<boolean>(false);

  onMount(() => {
    if ("wakeLock" in navigator) {
      isDisabled = false;
      handleVisibilityChange();
    }
  });

  // https://mdn.github.io/dom-examples/screen-wake-lock-api/
  async function requestWakeLock() {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      status = true;
    } catch (err) {
      $wakeEnable = false;
      status = false;
    }
  }

  function toggleWakeLock(enable: boolean) {
    if (enable) {
      requestWakeLock();
    } else {
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
          $wakeEnable = false;
          status = false;
        });
      }
    }
  }

  wakeEnable.subscribe((value) => toggleWakeLock(value));

  function handleVisibilityChange() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        toggleWakeLock($wakeEnable);
      } else {
        if (wakeLock) {
          wakeLock = null;
          status = false;
        }
      }
    });
  }
</script>

<button
  class="btn-menu"
  class:active={status}
  disabled={isDisabled}
  onclick={(e) => {
    $wakeEnable = !$wakeEnable;
    e.currentTarget.blur();
  }}
>
  {#if status}
    <span in:fly={{ duration: 300, y: -15 }}>
      <MaterialSymbolsSunnyRounded width="13" height="13" />
    </span>
  {:else}
    <span in:fly={{ duration: 300, y: -15 }}>
      <MaterialSymbolsDarkModeRounded width="13" height="13" />
    </span>
  {/if}
</button>

<style lang="postcss">
  .btn-menu {
    @apply flex h-15 min-w-17 px-2 items-center justify-center rounded-2 overflow-hidden bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30 disabled:cursor-not-allowed disabled:opacity-30;
  }

  .btn-menu.active {
    @apply !bg-green-400/60 text-black;
  }
</style>
