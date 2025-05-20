<script lang="ts">
  import { showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import {
    currentSchedule,
    handleGetListContent,
    todaySchedule,
    showTimer,
  } from "$lib/store/navstore";

  function handleGetList(numb: number) {
    $currentSchedule = numb === 0 ? $todaySchedule!.start : $todaySchedule!.end;
    handleGetListContent();
  }
</script>

<div class="flex flex-col items-center justify-center w-30">
  <form method="post" action="/login?/signout">
    <button class="btn-menu layout-white">
      <Icon
        icon="solar:lock-password-unlocked-outline"
        width="15"
        height="15"
      />
    </button>
  </form>

  <button
    class="btn-menu layout-white"
    class:active={$todaySchedule &&
      $todaySchedule.start.id === $currentSchedule?.id}
    onclick={() => handleGetList(0)}
  >
    {#if $todaySchedule}
      <span>{$todaySchedule.start.index}</span>
    {:else}
      <Icon icon="solar:close-circle-linear" width="15" height="15" />
    {/if}
  </button>

  <button
    class="btn-menu layout-white"
    class:active={$todaySchedule &&
      $todaySchedule.end.id === $currentSchedule?.id}
    onclick={() => handleGetList(1)}
  >
    {#if $todaySchedule}
      <span>{$todaySchedule.end.index}</span>
    {:else}
      <Icon icon="solar:close-circle-linear" width="15" height="15" />
    {/if}
  </button>

  <button class="btn-menu layout-white" onclick={() => ($showTranslate = true)}>
    <Icon icon="ph:translate" width="15" height="15" />
  </button>

  <button
    class="btn-menu layout-white {$showTimer ? 'timer' : ''}"
    onclick={() => ($showTimer = !$showTimer)}
  >
    <Icon
      icon="solar:alarm-sleep-outline"
      width="15"
      height="15"
      class="relative z-20"
    />
  </button>
</div>

<style>
  .btn-menu {
    @apply my-3 flex size-27 items-center justify-center rounded-3 !bg-white/5 hover:!bg-white/15 transition duration-300 text-black/90;
  }
  .btn-menu span {
    @apply text-9 leading-27 font-500;
  }

  .btn-menu.active {
    @apply !bg-green-400/90;
  }

  .btn-menu.timer {
    @apply !bg-blue-600/90;
  }
</style>
