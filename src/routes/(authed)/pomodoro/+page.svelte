<script lang="ts">
  import type { PageProps } from "./$types";
  import { onDestroy, onMount } from "svelte";
  import Container from "$lib/components/Container.svelte";
  import {
    currentInterval,
    currentMode,
    secondsRemaining,
    focusMinutes,
    shortbreakMinutes,
    longbreakMinutes,
    intervals,
    isMuted,
    isPaused,
    addToast,
    isFocusDone,
  } from "$lib/store/layoutstore";
  import Pagination from "$lib/components/Pagination.svelte";
  import type { DBSelect } from "$lib/types";
  import { format } from "date-fns";
  import Modal from "$lib/components/Modal.svelte";
  import { innerHeight } from "svelte/reactivity/window";
  import { wakeEnable } from "$lib/store/navstore";
  import MaterialSymbolsInsertChartOutlineRounded from "~icons/material-symbols/insert-chart-outline-rounded";
  import MaterialSymbolsSettingsRounded from "~icons/material-symbols/settings-rounded";
  import MaterialSymbolsLightBackgroundGridSmallSharp from "~icons/material-symbols-light/background-grid-small-sharp";
  import MaterialSymbolsVolumeUpRounded from "~icons/material-symbols/volume-up-rounded";
  import MaterialSymbolsVolumeOffRounded from "~icons/material-symbols/volume-off-rounded";
  import focusImage from "$lib/assets/images/Julien-Dupré-Stacking-Grain-Sheaves.avif";
  import shortbreakImage from "$lib/assets/images/Julien-Dupré-Woman-Pouring-a-Drink.avif";
  import longbreakImage from "$lib/assets/images/Julien-Dupré-Resting-in-the-Fields.avif";
  import Heatmap from "$lib/components/Heatmap.svelte";
  import {
    formatTimerString,
    minutesToSeconds,
    padWithZeroes,
    secondsToMinutes,
  } from "$lib/utils/functions";
  import { fade } from "svelte/transition";
  import TablerCircleLetterFFilled from "~icons/tabler/circle-letter-f-filled";
  import TablerCircleLetterSFilled from "~icons/tabler/circle-letter-s-filled";
  import TablerCircleLetterLFilled from "~icons/tabler/circle-letter-l-filled";

  let { data: layoutData }: PageProps = $props();

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let showSetting = $state<boolean>(false);
  let showReport = $state<boolean>(false);
  let showHeatmap = $state<boolean>(false);
  let interval: ReturnType<typeof setInterval>;
  let pauseAudio = $state<boolean>(true);
  let srcAudio = $state<string>("/sounds/mp3_break.ogg");
  let currentPage = $state<number>(1);
  let itemsPerPage = Math.floor((innerHeight.current! - 44 - 24 * 3 - 26) / 24);
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["pomodoro_table"][]>([]);
  let percent = $state<number>(100);

  let now = $state<number>(0);
  let end = $state<number>(0);

  onMount(() => {
    $wakeEnable = true;
    updateDisplay();
    if (!$isPaused) {
      startTimer();
    }
  });

  function startTimer() {
    clearInterval(interval);
    $isPaused = false;
    now = Date.now();
    end = now + $secondsRemaining * 1000;
    interval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    now = Date.now();
    $secondsRemaining = Math.round((end - now) / 1000);
    updateDisplay();
    if (now >= end) {
      endTimer();
    }
  }

  function pauseTimer() {
    clearInterval(interval);
    $isPaused = true;
  }

  function endTimer() {
    percent = 0;
    switch ($currentMode) {
      case "focus":
        srcAudio = "/sounds/mp3_break.ogg";
        pauseAudio = false;
        if ($currentInterval >= $intervals) {
          $currentMode = "longbreak";
          $secondsRemaining = minutesToSeconds($longbreakMinutes);
        } else {
          $currentMode = "shortbreak";
          $secondsRemaining = minutesToSeconds($shortbreakMinutes);
        }
        isFocusDone.set(true);
        submitReport();
        startTimer();
        break;
      case "shortbreak":
        srcAudio = "/sounds/mp3_focus.ogg";
        pauseAudio = false;
        if ($isFocusDone) {
          $currentInterval =
            $currentInterval + 1 > $intervals ? 1 : $currentInterval + 1;
          isFocusDone.set(false);
        }
        $currentMode = "focus";
        $secondsRemaining = minutesToSeconds($focusMinutes);
        startTimer();
        break;
      case "longbreak":
        srcAudio = "/sounds/mp3_focus.ogg";
        pauseAudio = false;
        if ($isFocusDone) {
          $currentInterval =
            $currentInterval + 1 > $intervals ? 1 : $currentInterval + 1;
          isFocusDone.set(false);
        }
        $currentMode = "focus";
        $secondsRemaining = minutesToSeconds($focusMinutes);
        startTimer();
        break;
      default:
        break;
    }
  }

  function updateDisplay() {
    switch ($currentMode) {
      case "focus":
        percent = 100 - ($secondsRemaining / $focusMinutes / 6) * 10;
        break;
      case "shortbreak":
        percent = 100 - ($secondsRemaining / $shortbreakMinutes / 6) * 10;
        break;
      case "longbreak":
        percent = 100 - ($secondsRemaining / $longbreakMinutes / 6) * 10;
        break;
      default:
        break;
    }
  }

  function handleChangeMode(mode: typeof $currentMode) {
    switch (mode) {
      case "focus":
        $secondsRemaining = minutesToSeconds($focusMinutes);
        $currentMode = "focus";
        break;
      case "shortbreak":
        $secondsRemaining = minutesToSeconds($shortbreakMinutes);
        $currentMode = "shortbreak";
        break;
      case "longbreak":
        $secondsRemaining = minutesToSeconds($longbreakMinutes);
        $currentMode = "longbreak";
        break;
      default:
        break;
    }
    startTimer();
  }

  async function submitReport() {
    const { data } = await layoutData.supabase
      .from("pomodoro_table")
      .select("time")
      .eq("date", todayDate);

    if (data && data.length) {
      const { error } = await layoutData.supabase
        .from("pomodoro_table")
        .update({
          time: data[0].time + $focusMinutes,
        })
        .eq("date", todayDate);
      if (error)
        addToast({
          type: "error",
          title: "Error!",
          message: error.message as string,
        });
    } else {
      const { error } = await layoutData.supabase
        .from("pomodoro_table")
        .insert({ date: todayDate, time: $focusMinutes });
      if (error)
        addToast({
          type: "error",
          title: "Error!",
          message: error.message as string,
        });
    }
  }

  function onPageChange(page: number) {
    currentPage = page;
    getDataPaginationByIndex(page);
  }

  async function getTablePaginationLength() {
    const { count } = await layoutData.supabase
      .from("pomodoro_table")
      .select("date", { count: "exact", head: true });
    if (count) totalItems = count;
  }

  async function getDataPaginationByIndex(index: number) {
    const totalPages = Math.ceil(totalItems! / itemsPerPage);
    const from = (totalPages - index) * itemsPerPage;
    const to = (totalPages - index + 1) * itemsPerPage - 1;
    const { data } = await layoutData.supabase
      .from("pomodoro_table")
      .select("*")
      .order("date", { ascending: true })
      .range(from, to);

    if (data) {
      paginationItems = data;
    }
  }

  async function handleShowReport() {
    await getTablePaginationLength();
    await getDataPaginationByIndex(1);
    showReport = true;
  }

  function handleMuteAudio() {
    pauseAudio = true;
    isMuted.update((val) => (val = !val));
  }

  onDestroy(() => {
    clearInterval(interval);
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === " ") {
      $isPaused ? startTimer() : pauseTimer();
    }
    if (e.key.toLocaleLowerCase() === "f") {
      $wakeEnable = !$wakeEnable;
    }
    if (e.key.toLocaleLowerCase() === "m") {
      handleMuteAudio();
    }
  }
</script>

<svelte:head>
  {#if $isPaused}
    <title>🍅 Paused!</title>
  {:else if $currentMode === "focus"}
    <title>{formatTimerString($secondsRemaining)} ⏳ Time to focus!</title>
  {:else}
    <title>{formatTimerString($secondsRemaining)} 🌴 Time for a break!</title>
  {/if}

  <meta name="Pomodoro" content="Pomodoro" />
</svelte:head>

<audio src={srcAudio} muted={$isMuted} bind:paused={pauseAudio} preload="auto"
></audio>

<Container fullscreen>
  <div class="min-w-main flex justify-between py-3">
    <div class="flex gap-3 {$intervals > 15 ? 'pr-18' : ''}">
      <button
        class="setting-button"
        class:active={$currentMode === "focus"}
        onclick={(e) => {
          e.currentTarget.blur();
          handleChangeMode("focus");
        }}
      >
        <TablerCircleLetterFFilled width="16" height="16" />
      </button>

      <button
        class="setting-button"
        class:active={$currentMode === "shortbreak"}
        onclick={(e) => {
          e.currentTarget.blur();
          handleChangeMode("shortbreak");
        }}
      >
        <TablerCircleLetterSFilled width="16" height="16" />
      </button>

      <button
        class="setting-button"
        class:active={$currentMode === "longbreak"}
        onclick={(e) => {
          e.currentTarget.blur();
          handleChangeMode("longbreak");
        }}
      >
        <TablerCircleLetterLFilled width="16" height="16" />
      </button>

      <button
        class="btn-timer group relative"
        onclick={(e) => {
          e.currentTarget.blur();
          $isPaused ? startTimer() : pauseTimer();
        }}
        class:timerPause={$isPaused}
      >
        <span
          class="absolute w-full flex items-center justify-center text-9 leading-18 font-600 group-hover:opacity-0"
        >
          <span class="w-1/2 text-right">
            {padWithZeroes(secondsToMinutes($secondsRemaining))}
          </span>
          <span class="min-w-6">:</span>
          <span class="w-1/2 text-left">
            {padWithZeroes($secondsRemaining % 60)}
          </span>
        </span>
        <span
          class="absolute text-9 leading-15 font-500 text-[#fe3d2c] opacity-0 group-hover:opacity-100"
          style="text-shadow: 0 0 1px #ea504a;"
        >
          PAUSE
        </span>
      </button>
    </div>

    <div class="h-18 flex justify-center items-center gap-6">
      {#each { length: $currentInterval } as item, i}
        <div
          class="size-3 rounded-full bg-black shadow-sm shadow-black/60 ring-1 ring-black"
        ></div>
      {/each}
      {#each { length: $intervals - $currentInterval } as item, i}
        <div
          class="size-3 rounded-full shadow-sm shadow-black/60 ring-1 ring-black"
        ></div>
      {/each}
    </div>

    <div class="flex gap-3 pl-18">
      <button
        class="setting-button"
        class:active={showReport === true}
        onclick={(e) => {
          e.currentTarget.blur();
          handleShowReport();
        }}
      >
        <MaterialSymbolsInsertChartOutlineRounded width="14" height="14" />
      </button>

      <button
        class="setting-button"
        class:active={showHeatmap === true}
        onclick={(e) => {
          e.currentTarget.blur();
          showHeatmap = true;
        }}
      >
        <MaterialSymbolsLightBackgroundGridSmallSharp width="14" height="14" />
      </button>

      <button
        class="setting-button"
        class:active={showSetting === true}
        onclick={(e) => {
          e.currentTarget.blur();
          showSetting = true;
        }}
      >
        <MaterialSymbolsSettingsRounded width="14" height="14" />
      </button>

      <button
        class="setting-button"
        onclick={(e) => {
          e.currentTarget.blur();
          handleMuteAudio();
        }}
      >
        {#if $isMuted}
          <MaterialSymbolsVolumeOffRounded width="14" height="14" />
        {:else}
          <MaterialSymbolsVolumeUpRounded width="14" height="14" />
        {/if}
      </button>
    </div>
  </div>

  <Modal bind:showModal={showReport}>
    <div
      class="w-main h-[calc(100vh-44px)] bg-white rounded-2 overflow-hidden flex flex-col"
    >
      <div class="w-full h-24 px-6 bg-black text-white text-13 leading-24">
        Report
      </div>
      <div class="w-full px-3 flex-1 flex flex-col justify-between">
        <table class="w-full">
          <thead>
            <tr class="text-12 leading-24 h-24 font-400 bg-gray-100 text-black">
              <th colspan="1">Date</th>
              <th colspan="2">Time(hh:mm)</th>
            </tr>
          </thead>
          <tbody>
            {#each paginationItems as item}
              <tr
                class="h-24 w-full border-b border-[#f0f0f0] text-12 leading-14"
              >
                <td class="w-80 pl-3" colspan="1">{item.date}</td>
                <td class="h-24 flex items-center" colspan="2">
                  <div
                    class="relative overflow-visible h-18 rounded-2 {todayDate ===
                    item.date
                      ? 'bg-blue-400'
                      : 'bg-blue-200'}"
                    style="width: {Math.round((item.time / 6) * 4)}px;"
                  >
                    <div
                      class="absolute {item.time <= 60
                        ? 'left-3 text-left'
                        : 'right-3 text-right'} min-w-36 leading-18 text-10"
                    >
                      {padWithZeroes(secondsToMinutes(item.time))} : {padWithZeroes(
                        item.time % 60,
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if totalItems}
          <div class="w-full pb-3">
            <Pagination
              {totalItems}
              {itemsPerPage}
              {currentPage}
              {onPageChange}
              --width="21px"
              --height="21px"
            />
          </div>
        {/if}
      </div>
    </div>
  </Modal>

  <Modal bind:showModal={showHeatmap}>
    <div
      class="w-main h-[calc(100vh-44px)] bg-white overflow-hidden rounded-2 flex flex-col"
    >
      <div class="w-full h-24 px-6 bg-black text-white text-13 leading-24">
        Heatmap
      </div>
      {#if showHeatmap}
        <div class="w-full flex-1">
          <Heatmap />
        </div>
      {/if}
    </div>
  </Modal>

  <Modal bind:showModal={showSetting}>
    <div
      class="w-main h-[calc(100vh-44px)] bg-white rounded-2 overflow-hidden flex flex-col"
    >
      <div class="w-full h-24 px-6 bg-black text-white text-13 leading-24">
        Setting
      </div>
      <div class="flex flex-col p-6">
        <p class="text-13 mb-6 font-500">Time (minutes)</p>
        <div class="grid grid-cols-3 gap-3">
          <p class="text-13 font-500">Pomodoro</p>
          <p class="text-13 font-500">Short Break</p>
          <p class="text-13 font-500">Long Break</p>
          <input
            name="pomodoro"
            autocomplete="off"
            type="number"
            min="1"
            step="1"
            bind:value={$focusMinutes}
            class="input-setting"
          />
          <input
            name="shortBreak"
            autocomplete="off"
            type="number"
            min="1"
            step="1"
            bind:value={$shortbreakMinutes}
            class="input-setting"
          />
          <input
            name="longBreak"
            autocomplete="off"
            type="number"
            min="1"
            step="1"
            bind:value={$longbreakMinutes}
            class="input-setting"
          />
          <p class="text-13 font-500 col-span-3">Long Break interval</p>
          <input
            name="longBreakInterval"
            autocomplete="off"
            type="number"
            min={$currentInterval}
            step="1"
            bind:value={$intervals}
            class="input-setting"
          />
          <p class="text-13 font-500 col-span-3">Current interval</p>
          <input
            name="longBreakInterval"
            autocomplete="off"
            type="number"
            min="1"
            max={$intervals}
            step="1"
            bind:value={$currentInterval}
            class="input-setting"
          />
        </div>
      </div>
    </div>
  </Modal>

  <div class="flex-1 w-full flex justify-center items-center">
    <div class="circle">
      <div class="square">
        <img
          src={$currentMode === "focus"
            ? focusImage
            : $currentMode === "shortbreak"
              ? shortbreakImage
              : longbreakImage}
          alt="bg"
          class="absolute z-10 object-cover object-[-45px] w-full h-full grayscale"
        />

        <img
          src={$currentMode === "focus"
            ? focusImage
            : $currentMode === "shortbreak"
              ? shortbreakImage
              : longbreakImage}
          alt="pbg"
          class="absolute z-20 h-full w-0 object-cover object-[-45px] transition-all duration-300"
          style="box-shadow: rgba(0, 0, 0, 0.8) 2px 0px 3px; width: {percent}%;"
        />

        {#if $isPaused}
          <div
            transition:fade={{ duration: 150 }}
            class="absolute w-full h-full z-30 flex items-center justify-center bg-black/15 shadow-[inset_0_0_45px_rgba(0,0,0,1)]"
          ></div>
        {/if}
      </div>
    </div>
  </div>
</Container>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .circle {
    width: 540px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .square {
    width: 379px;
    aspect-ratio: 1;
    border: 3px solid #000000;
    position: relative;
    overflow: hidden;
  }

  .setting-button {
    @apply size-18 flex items-center justify-center outline-none bg-white/15 border border-white/10 text-black text-12 leading-18 rounded-2 hover:bg-white/30;
    backdrop-filter: blur(12px);
  }

  .setting-button.active {
    @apply !bg-green-400 !text-black;
  }

  .btn-timer {
    @apply h-18 min-w-36 flex items-center justify-center outline-none bg-white/15 border border-white/10 text-black text-12 leading-18 rounded-2 hover:bg-[#101213];
  }

  .timerPause {
    background-color: #101213;
  }

  .timerPause span:first-child {
    opacity: 0%;
  }

  .timerPause span:last-child {
    opacity: 100%;
  }

  .input-setting {
    border-radius: 2px;
    height: 24px;
    background-color: #efefef;
    font-size: 12px;
    line-height: 24px;
    padding: 3px 0px 3px 6px;
    box-shadow: none;
    border: none;
    color: #555;
    width: 100%;
    outline: 0;
  }

  @media screen and (max-width: 500px) {
    .circle {
      width: 360px;
    }

    .square {
      width: 253px;
    }
  }
</style>
