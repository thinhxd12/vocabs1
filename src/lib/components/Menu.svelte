<script lang="ts">
  import { showLayout } from "$lib/store/layoutstore";
  import { modal, showEdit, showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import Translate from "$lib/components/Translate.svelte";
  import { AlertDialog } from "bits-ui";
  import {
    countdown,
    currentSchedule,
    handleGetListContent,
    isAutoPlay,
    listContent,
    quizRender,
    startCountdown,
    stopCountdown,
    todaySchedule,
    updateTodayScheduleLocal,
  } from "$lib/store/navstore";
  import { page } from "$app/state";
  import arrayShuffle from "array-shuffle";

  function startOrStopCountdown() {
    $countdown.isRunning ? stopCountdown() : startCountdown(5);
  }

  function handleGetList(numb: number) {
    $currentSchedule = numb === 0 ? $todaySchedule!.start : $todaySchedule!.end;
    handleGetListContent();
  }
</script>

<div class="flex flex-col items-center justify-center w-30">
  <form method="POST" action="/login?/logout">
    <button class="btn-menu">
      <Icon icon="garden:exit-stroke-16" width="15" height="15" />
    </button>
  </form>

  {#if page.url.pathname === "/vocab"}
    <button
      class="btn-menu"
      class:active={$todaySchedule?.start.id === $currentSchedule?.id}
      onclick={() => handleGetList(0)}
    >
      {#if $todaySchedule}
        <span>{$todaySchedule.start.index}</span>
      {:else}
        <Icon icon="ri:question-mark" width="12" height="12" />
      {/if}
    </button>
  {:else}
    <button class="btn-menu" onclick={() => handleGetList(0)}>
      {#if $todaySchedule}
        <span>{$todaySchedule.start.index}</span>
      {:else}
        <Icon icon="ri:question-mark" width="12" height="12" />
      {/if}
    </button>
  {/if}

  {#if page.url.pathname === "/vocab"}
    <button
      class="btn-menu"
      class:active={$todaySchedule?.end.id === $currentSchedule?.id}
      onclick={() => handleGetList(1)}
    >
      {#if $todaySchedule}
        <span>{$todaySchedule.end.index}</span>
      {:else}
        <Icon icon="ri:question-mark" width="12" height="12" />
      {/if}
    </button>
  {:else}
    <button class="btn-menu" onclick={() => handleGetList(1)}>
      {#if $todaySchedule}
        <span>{$todaySchedule.end.index}</span>
      {:else}
        <Icon icon="ri:question-mark" width="12" height="12" />
      {/if}
    </button>
  {/if}

  {#if $showLayout}
    <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}
      ><Icon icon="ri:layout-right-line" width="15" height="15" /></button
    >
  {:else}
    <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}>
      <Icon icon="ri:layout-left-line" width="15" height="15" />
    </button>
  {/if}

  <button class="btn-menu" onclick={() => ($showTranslate = true)}>
    <Icon icon="ri:translate" width="15" height="15" />
  </button>
  <button class="btn-menu">
    <Icon icon="cuida:image-outline" width="15" height="15" />
  </button>
  <!-- <button class="btn-menu" onclick={() => ($showEdit = true)}
    ><Icon icon="hugeicons:pencil-edit-02" width="15" height="15" /></button
  > -->
  <button
    class="btn-menu relative overflow-hidden"
    onclick={startOrStopCountdown}
  >
    {#if $countdown.isRunning}
      <span
        class="absolute bottom-0 z-10 w-full bg-blue-600/90"
        style="height: {($countdown.timeLeft / 5) * 100}%"
      ></span>
    {/if}
    <Icon
      icon="ri:hourglass-2-line"
      width="15"
      height="15"
      class="relative z-20"
    />
  </button>
</div>

<style>
  .btn-menu {
    @apply my-2 flex h-27 w-27 items-center justify-center rounded-full text-white shadow shadow-black/30 outline-none backdrop-blur-md transition duration-100 hover:shadow;
  }
  .btn-menu span {
    @apply text-9;
  }

  .btn-menu.active {
    @apply bg-green-400/90;
  }
</style>
