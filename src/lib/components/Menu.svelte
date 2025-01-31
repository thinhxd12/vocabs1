<script lang="ts">
  import { showLayout } from "$lib/store/layoutstore";
  import { modal, showEdit, showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import Translate from "$lib/components/Translate.svelte";
  import { AlertDialog } from "bits-ui";
  import {
    currentSchedule,
    isAutoPlay,
    listContent,
    quizRender,
    todaySchedule,
  } from "$lib/store/navstore";
  import { page } from "$app/state";
  import arrayShuffle from "array-shuffle";

  const handleGetListContentVocab = async (index: number) => {
    const response = await fetch(`/server/getwordlist?index=${index}`);
    if (response.status === 200) {
      $listContent = await response.json();
      $isAutoPlay = true;
    }
  };

  const handleGetListContentQuiz = async (index: number) => {
    $quizRender = undefined;

    const response = await fetch(`/server/getwordlist?index=${index}`);
    if (response.status === 200) {
      const data = await response.json();
      $listContent = arrayShuffle(data);
      $quizRender = $listContent[0];
    }
  };

  const handleGetListContent = (numb: number) => {
    $currentSchedule = numb === 0 ? $todaySchedule!.start : $todaySchedule!.end;
    if (page.url.pathname === "/vocab") {
      handleGetListContentVocab($currentSchedule.index);
      return;
    } else if (page.url.pathname === "/quiz") {
      handleGetListContentQuiz($currentSchedule.index);
      return;
    } else {
      $listContent = [];
      $isAutoPlay = false;
    }
  };
</script>

<div class="flex flex-col items-center justify-center w-30">
  <form method="POST" action="/login?/logout">
    <button class="btn-menu">
      <Icon icon="garden:exit-stroke-16" width="15" height="15" />
    </button>
  </form>

  <button class="btn-menu" onclick={() => handleGetListContent(0)}>
    {#if $todaySchedule}
      <span>{$todaySchedule.start.index}</span>
    {:else}
      <Icon icon="ri:question-mark" width="12" height="12" />
    {/if}
  </button>
  <button class="btn-menu" onclick={() => handleGetListContent(1)}>
    {#if $todaySchedule}
      <span>{$todaySchedule.end.index}</span>
    {:else}
      <Icon icon="ri:question-mark" width="12" height="12" />
    {/if}
  </button>
  {#if $showLayout}
    <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}
      ><Icon icon="ri:layout-right-line" width="15" height="15" /></button
    >
  {:else}
    <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}
      ><Icon icon="ri:layout-left-line" width="15" height="15" /></button
    >
  {/if}

  <button class="btn-menu" onclick={() => ($showTranslate = true)}
    ><Icon icon="ri:translate" width="15" height="15" /></button
  >
  <button class="btn-menu"
    ><Icon icon="cuida:image-outline" width="15" height="15" /></button
  >
  <!-- <button class="btn-menu" onclick={() => ($showEdit = true)}
    ><Icon icon="hugeicons:pencil-edit-02" width="15" height="15" /></button
  > -->
  <button class="btn-menu"
    ><Icon icon="ri:hourglass-2-line" width="15" height="15" /></button
  >
</div>

<style>
  .btn-menu {
    @apply my-2 flex h-27 w-27 items-center justify-center rounded-full text-white shadow shadow-black/30 outline-none backdrop-blur-md transition duration-100 hover:shadow;
  }
  .btn-menu span {
    @apply text-9;
  }
</style>
