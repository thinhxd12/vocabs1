<script lang="ts">
  import { wakeEnable } from "$lib/store/navstore";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  let wakeLock = $state<WakeLockSentinel | null>(null);
  let isDisabled = $state<boolean>(true);

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
    } catch (err) {
      $wakeEnable = false;
      isDisabled = true;
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
        if (wakeLock) wakeLock = null;
      }
    });
  }
</script>

<button
  class="btn-menu"
  class:active={$wakeEnable}
  disabled={isDisabled}
  onclick={(e) => {
    $wakeEnable = !$wakeEnable;
    e.currentTarget.blur();
  }}
>
  {#if $wakeEnable}
    <div in:fly={{ duration: 150, y: -15 }}>
      <Icon icon="material-symbols:sunny-rounded" width="13" height="13" />
    </div>
  {:else}
    <div in:fly={{ duration: 150, y: -15 }}>
      <Icon icon="material-symbols:dark-mode-rounded" width="13" height="13" />
    </div>
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
