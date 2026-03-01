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
  } from "$lib/store/layoutstore";
  import Pagination from "$lib/components/Pagination.svelte";
  import type { DBSelect } from "$lib/types";
  import { format } from "date-fns";
  import Modal from "$lib/components/Modal.svelte";
  import { innerHeight } from "svelte/reactivity/window";
  import { wakeEnable } from "$lib/store/navstore";
  import MaterialSymbolsAdjust from "~icons/material-symbols/adjust";
  import MaterialSymbolsDarkModeRounded from "~icons/material-symbols/dark-mode-rounded";
  import MaterialSymbolsSailingRounded from "~icons/material-symbols/sailing-rounded";
  import MaterialSymbolsInsertChartOutlineRounded from "~icons/material-symbols/insert-chart-outline-rounded";
  import MaterialSymbolsSettingsOutlineRounded from "~icons/material-symbols/settings-outline-rounded";
  import MaterialSymbolsVolumeOffOutlineRounded from "~icons/material-symbols/volume-off-outline-rounded";
  import MaterialSymbolsVolumeUpOutlineRounded from "~icons/material-symbols/volume-up-outline-rounded";
  import MaterialSymbolsLightBackgroundGridSmallSharp from "~icons/material-symbols-light/background-grid-small-sharp";
  import { Tween } from "svelte/motion";
  import focusImage from "$lib/assets/images/Julien-Dupré-Stacking-Grain-Sheaves.avif";
  import shortbreakImage from "$lib/assets/images/Julien-Dupré-Woman-Pouring-a-Drink.avif";
  import longbreakImage from "$lib/assets/images/Julien-Dupré-Resting-in-the-Fields.avif";
  import Heatmap from "$lib/components/Heatmap.svelte";

  let { data: layoutData }: PageProps = $props();

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let showSetting = $state<boolean>(false);
  let showReport = $state<boolean>(false);
  let showHeatmap = $state<boolean>(false);
  let interval: ReturnType<typeof setInterval>;
  let isPaused = $state<boolean>(true);
  let pauseAudio = $state<boolean>(true);
  let srcAudio = $state<string>("/sounds/mp3_break.ogg");
  let isMuted = $state<boolean>(false);
  let currentPage = $state<number>(1);
  let itemsPerPage = Math.floor((innerHeight.current! - 120 - 26 - 28) / 25);
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["pomodoro_table"][]>([]);
  let heatmapYear = $state<number>(new Date().getFullYear());

  const minutesToSeconds = (minutes: number) => minutes * 60;
  const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);
  const padWithZeroes = (number: number) => number.toString().padStart(2, "0");

  let now = $state<number>(0);
  let end = $state<number>(0);

  const progress = new Tween(0, {
    duration: 1000,
  });

  onMount(() => {
    $wakeEnable = true;
    updateDisplay(true);
  });

  function formatTime(timeInSeconds: number): string {
    const minutes = secondsToMinutes(timeInSeconds);
    const remainingSeconds = timeInSeconds % 60;
    return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
  }

  function startTimer() {
    clearInterval(interval);
    isPaused = false;
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
    isPaused = true;
  }

  function endTimer() {
    progress.target = 0;

    switch ($currentMode) {
      case "focus":
        srcAudio = "/sounds/mp3_break.ogg";
        pauseAudio = false;
        $currentInterval++;
        if ($currentInterval > $intervals) {
          $currentInterval = 1;
          setTimeout(() => {
            $currentMode = "longbreak";
          }, 1000);
          $secondsRemaining = minutesToSeconds($longbreakMinutes);
        } else {
          setTimeout(() => {
            $currentMode = "shortbreak";
          }, 1000);
          $secondsRemaining = minutesToSeconds($shortbreakMinutes);
        }
        submitReport();
        startTimer();
        break;
      case "shortbreak":
        srcAudio = "/sounds/mp3_focus.ogg";
        pauseAudio = false;
        setTimeout(() => {
          $currentMode = "focus";
        }, 1000);
        $secondsRemaining = minutesToSeconds($focusMinutes);
        startTimer();
        break;
      case "longbreak":
        srcAudio = "/sounds/mp3_focus.ogg";
        pauseAudio = false;
        setTimeout(() => {
          $currentMode = "focus";
        }, 1000);
        $secondsRemaining = minutesToSeconds($focusMinutes);
        startTimer();
        break;
      default:
        break;
    }
  }

  function updateDisplay(set: boolean = false) {
    let target = 0;
    switch ($currentMode) {
      case "focus":
        target = (($focusMinutes * 60 - $secondsRemaining) / $focusMinutes) * 6;

        break;
      case "shortbreak":
        target =
          (($shortbreakMinutes * 60 - $secondsRemaining) / $shortbreakMinutes) *
          6;
        break;
      case "longbreak":
        target =
          (($longbreakMinutes * 60 - $secondsRemaining) / $longbreakMinutes) *
          6;
        break;
      default:
        break;
    }

    if (set) progress.set(target, { duration: 0 });
    else progress.target = target;
  }

  function handleChangeMode(mode: typeof $currentMode) {
    progress.set(0, { duration: 0 });

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
    const today = new Date();
    const date = format(today, "yyyy-MM-dd");

    const { data } = await layoutData.supabase
      .from("pomodoro_table")
      .select("time")
      .eq("date", date);

    if (data && data.length) {
      await layoutData.supabase
        .from("pomodoro_table")
        .update({
          time: data[0].time + $focusMinutes,
        })
        .eq("date", date);
    } else {
      await layoutData.supabase
        .from("pomodoro_table")
        .insert({ date, time: $focusMinutes });
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

  onDestroy(() => {
    clearInterval(interval);
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === " ") {
      isPaused ? startTimer() : pauseTimer();
    }
    if (e.key.toLocaleLowerCase() === "f") {
      $wakeEnable = !$wakeEnable;
    }
    if (e.key.toLocaleLowerCase() === "m") {
      isMuted = !isMuted;
    }
  }
</script>

<svelte:head>
  {#if isPaused}
    <title>🍅 Paused</title>
  {:else if $currentMode === "focus"}
    <title>{formatTime($secondsRemaining)} - Time to focus!</title>
  {:else}
    <title>{formatTime($secondsRemaining)} - Time for a break!</title>
  {/if}
  <meta name="Pomodoro" content="Pomodoro" />
</svelte:head>

<audio src={srcAudio} muted={isMuted} bind:paused={pauseAudio} preload="auto"
></audio>

<Container zIndex={6} fullscreen>
  <div class="w-full h-full flex items-center justify-center relative">
    <div class="absolute top-0 left-0 right-0 z-10 flex justify-center">
      <div class="w-main flex justify-between py-3">
        <div class="flex gap-3">
          <button
            class="setting-button light"
            class:active={$currentMode === "focus"}
            onclick={(e) => {
              e.currentTarget.blur();
              handleChangeMode("focus");
            }}
          >
            <MaterialSymbolsAdjust width="14" height="14" />
          </button>

          <button
            class="setting-button light"
            class:active={$currentMode === "shortbreak"}
            onclick={(e) => {
              e.currentTarget.blur();
              handleChangeMode("shortbreak");
            }}
          >
            <MaterialSymbolsDarkModeRounded width="14" height="14" />
          </button>

          <button
            class="setting-button light"
            class:active={$currentMode === "longbreak"}
            onclick={(e) => {
              e.currentTarget.blur();
              handleChangeMode("longbreak");
            }}
          >
            <MaterialSymbolsSailingRounded width="14" height="14" />
          </button>
        </div>

        <button
          class="btn-timer group relative"
          onclick={(e) => {
            e.currentTarget.blur();
            isPaused ? startTimer() : pauseTimer();
          }}
          class:timerPause={isPaused}
        >
          <span
            class="absolute w-full flex items-center justify-center text-9 leading-18 text-white group-hover:opacity-0"
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
            class="absolute text-9 leading-15 text-[#fe3d2c] opacity-0 group-hover:opacity-100"
            style="text-shadow: 0 0 1px #ea504a;"
          >
            PAUSE
          </span>
        </button>

        <div class="flex gap-3">
          <button
            class="setting-button light"
            class:active={showReport === true}
            onclick={(e) => {
              e.currentTarget.blur();
              handleShowReport();
            }}
          >
            <MaterialSymbolsInsertChartOutlineRounded width="14" height="14" />
          </button>

          <button
            class="setting-button light"
            class:active={showHeatmap === true}
            onclick={(e) => {
              e.currentTarget.blur();
              showHeatmap = true;
            }}
          >
            <MaterialSymbolsLightBackgroundGridSmallSharp
              width="14"
              height="14"
            />
          </button>

          <button
            class="setting-button light"
            class:active={showSetting === true}
            onclick={(e) => {
              e.currentTarget.blur();
              showSetting = true;
            }}
          >
            <MaterialSymbolsSettingsOutlineRounded width="14" height="14" />
          </button>

          <button
            class="setting-button light"
            onclick={(e) => {
              e.currentTarget.blur();
              isMuted = !isMuted;
            }}
          >
            {#if isMuted}
              <MaterialSymbolsVolumeOffOutlineRounded width="14" height="14" />
            {:else}
              <MaterialSymbolsVolumeUpOutlineRounded width="14" height="14" />
            {/if}
          </button>
        </div>
      </div>
    </div>

    <Modal bind:showModal={showSetting}>
      {#snippet header()}
        <span class="text-14 leading-16">Setting</span>
      {/snippet}
      <div
        class="w-full rounded-2 overflow-hidden flex flex-col justify-center"
      >
        <div class="flex flex-col p-6">
          <p class="text-15 mb-6">Time (minutes)</p>
          <div class="grid grid-cols-3 gap-3">
            <p class="text-14 font-500">Pomodoro</p>
            <p class="text-14 font-500">Short Break</p>
            <p class="text-14 font-500">Long Break</p>
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
            <p class="text-14 font-500 col-span-3">Long Break interval</p>
            <input
              name="longBreakInterval"
              autocomplete="off"
              type="number"
              min="1"
              step="1"
              bind:value={$intervals}
              class="input-setting"
            />
            <p class="text-14 font-500 col-span-3">Current interval</p>
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

    <Modal bind:showModal={showReport}>
      {#snippet header()}
        <span class="text-14 leading-16">Report</span>
      {/snippet}
      <div
        class="w-full h-[calc(100vh-120px)] rounded-2 overflow-hidden flex flex-col justify-between"
      >
        <table class="w-full">
          <thead>
            <tr class="text-12 leading-24 h-24 font-400 bg-gray-100 text-black">
              <th colspan="1">Date</th>
              <th colspan="2">Time(hh:mm)</th>
            </tr>
          </thead>
          <tbody class="text-center">
            {#each paginationItems as item}
              <tr class="h-24 border-b border-[#f0f0f0] text-12">
                <td class="w-80 pl-3">{item.date}</td>
                <td>
                  <div
                    class="h-9 {todayDate === item.date
                      ? 'bg-blue-400'
                      : 'bg-blue-200'}"
                    style="width: {Math.round((item.time / 7) * 4)}px;"
                  ></div>
                </td>
                <td class="w-50 pr-3">
                  {padWithZeroes(secondsToMinutes(item.time))} : {padWithZeroes(
                    item.time % 60,
                  )}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if totalItems}
          <div class="w-full pb-6">
            <Pagination
              {totalItems}
              {itemsPerPage}
              {currentPage}
              {onPageChange}
            />
          </div>
        {/if}
      </div>
    </Modal>

    <Modal bind:showModal={showHeatmap}>
      {#snippet header()}
        <span class="text-14 leading-16">Heatmap</span>
      {/snippet}
      <div
        class="w-full h-[calc(100vh-60px)] rounded-2 overflow-hidden flex gap-6 p-3"
      >
        <input
          name="heatmapyear"
          type="number"
          bind:value={heatmapYear}
          min="2025"
          class="hidden-cursor select-none h-24 w-70 text-14 leading-24 outline-none bg-[#efefef] rounded-2 indent-6"
        />
        <Heatmap year={heatmapYear} />
      </div>
    </Modal>

    <div class="circle">
      <div class="square">
        <img
          src={$currentMode === "focus"
            ? focusImage
            : $currentMode === "shortbreak"
              ? shortbreakImage
              : longbreakImage}
          alt="bg"
          class="absolute z-10 object-cover w-full h-full"
          style="filter: grayscale(1) contrast(1.2);"
        />

        <img
          src={$currentMode === "focus"
            ? focusImage
            : $currentMode === "shortbreak"
              ? shortbreakImage
              : longbreakImage}
          alt="pbg"
          class="absolute z-20 object-cover w-full h-full"
          style="mask-image: conic-gradient(
          from 0deg,
          black 0deg {progress.current}deg,
          transparent {progress.current}deg 360deg
          );"
        />

        <div class="center"></div>
        <div class="static"></div>
        <div
          class="dynamic"
          style="transform: rotate({progress.current}deg) scaleX(2);"
        ></div>
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
    width: 381px;
    aspect-ratio: 1;
    border: 3px solid #000000;
    position: relative;
    overflow: hidden;
  }

  .static {
    position: absolute;
    height: 270px;
    width: 1px;
    left: calc(50% - 0.5px);
    bottom: 50%;
    transform-origin: bottom;
    transform: scaleX(2);
    background-color: rgba(0, 0, 0, 1);
    z-index: 20;
  }

  .dynamic {
    position: absolute;
    height: 270px;
    width: 1px;
    left: calc(50% - 0.5px);
    transform-origin: bottom;
    bottom: 50%;
    background-color: rgba(0, 0, 0, 1);
    z-index: 20;
  }

  .center {
    position: absolute;
    height: 1px;
    width: 1px;
    left: calc(50% - 0.5px);
    top: calc(50% - 0.5px);
    transform: scale(2);
    background-color: rgba(0, 0, 0, 1);
    border-radius: 50%;
    z-index: 21;
  }

  .setting-button {
    @apply size-18 flex items-center justify-center text-13 leading-16 appearance-none text-center cursor-pointer rounded-2 transition duration-100 outline-none ring-1 ring-black/5 shadow shadow-black/30 disabled:opacity-15;
  }

  .setting-button.active {
    @apply !bg-green-400/60 !text-black;
  }

  .btn-timer {
    @apply flex items-center justify-center h-18 min-w-36 rounded-2 bg-[#101213] ring-1 ring-black/5 shadow shadow-black/30;
  }

  .timerPause span:first-child {
    opacity: 0%;
  }

  .timerPause span:last-child {
    opacity: 100%;
  }

  .input-setting {
    border-radius: 3px;
    background-color: #efefef;
    font-size: 14px;
    padding: 4px 6px 4px 10px;
    box-shadow: none;
    border: none;
    color: #555;
    width: 100%;
    outline: 0;
  }

  .hidden-cursor {
    caret-color: transparent;
  }
</style>
