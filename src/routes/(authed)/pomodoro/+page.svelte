<script lang="ts">
  import type { PageProps } from "./$types";
  import { onDestroy, onMount } from "svelte";
  import Container from "$lib/components/Container.svelte";
  import {
    currentInterval,
    countPomodoros,
    currentState,
    longBreak,
    longBreakInterval,
    pomodoro,
    shortBreak,
  } from "$lib/store/layoutstore";
  import { submitReportPomodoro } from "$lib/utils/functions";
  import { page } from "$app/state";
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
  import { linear } from "svelte/easing";
  import { Tween } from "svelte/motion";
  import { fade } from "svelte/transition";

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let showSetting = $state<boolean>(false);
  let showReport = $state<boolean>(false);
  let interval: ReturnType<typeof setInterval>;
  let isPaused = $state<boolean>(true);
  let pauseAudio = $state<boolean>(true);
  let srcAudio = $state<string>("/sounds/mp3_break.ogg");
  let isMuted = $state<boolean>(false);
  let currentPage = $state<number>(1);
  let itemsPerPage = Math.floor((innerHeight.current! - 120 - 26 - 28) / 25);
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["pomodoro_table"][]>([]);

  const minutesToSeconds = (minutes: number) => minutes * 60;
  const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);
  const padWithZeroes = (number: number) => number.toString().padStart(2, "0");

  let now = $state<number>(0);
  let end = $state<number>(0);

  const progress = new Tween(0, {
    duration: 1000,
    easing: linear,
  });

  onMount(() => {
    if ($currentState === "focus" && !$countPomodoros)
      $countPomodoros = minutesToSeconds($pomodoro);
    $wakeEnable = true;
  });

  function formatTime(timeInSeconds: number): string {
    const minutes = secondsToMinutes(timeInSeconds);
    const remainingSeconds = timeInSeconds % 60;
    return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
  }

  function startPomodoro() {
    clearInterval(interval);
    now = Date.now();
    end = now + $countPomodoros * 1000;
    isPaused = false;
    interval = setInterval(updatePomodoro, 1000);
  }

  function updatePomodoro() {
    now = Date.now();
    $countPomodoros = Math.round((end - now) / 1000);
    progress.target = (($pomodoro * 60 - $countPomodoros) / $pomodoro) * 6;
    if (now >= end) {
      progress.set(0);
      $currentInterval++;
      completePomodoro();
      srcAudio = "/sounds/mp3_break.ogg";
      pauseAudio = false;
    }
  }

  function completePomodoro() {
    submitReport();
    if ($currentInterval > $longBreakInterval) {
      $currentInterval = 1;
      $currentState = "longbreak";
      $countPomodoros = minutesToSeconds($longBreak);
      rest();
    } else {
      $currentState = "break";
      $countPomodoros = minutesToSeconds($shortBreak);
      rest();
    }
  }

  function rest() {
    clearInterval(interval);
    now = Date.now();
    end = now + $countPomodoros * 1000;
    isPaused = false;
    interval = setInterval(updateRest, 1000);
  }

  function updateRest() {
    now = Date.now();
    $countPomodoros = Math.round((end - now) / 1000);
    if ($currentState === "break") {
      progress.target =
        (($shortBreak * 60 - $countPomodoros) / $shortBreak) * 6;
    } else
      progress.target = (($longBreak * 60 - $countPomodoros) / $longBreak) * 6;
    if (now >= end) {
      progress.set(0);
      $countPomodoros = minutesToSeconds($pomodoro);
      $currentState = "focus";
      startPomodoro();
      srcAudio = "/sounds/mp3_focus.ogg";
      pauseAudio = false;
    }
  }

  function pausePomodoro() {
    clearInterval(interval);
    isPaused = true;
  }

  function handleResume() {
    switch ($currentState) {
      case "focus":
        startPomodoro();
        break;
      case "break":
        rest();
        break;
      case "longbreak":
        rest();
        break;
      default:
        break;
    }
  }

  async function submitReport() {
    await submitReportPomodoro($pomodoro, page.data.supabase);
  }

  function onPageChange(page: number) {
    currentPage = page;
    getDataPaginationByIndex(page);
  }

  async function getTablePaginationLength() {
    const { count } = await supabase
      .from("pomodoro_table")
      .select("date", { count: "exact", head: true });
    if (count) totalItems = count;
  }

  async function getDataPaginationByIndex(index: number) {
    const totalPages = Math.ceil(totalItems! / itemsPerPage);
    const from = (totalPages - index) * itemsPerPage;
    const to = (totalPages - index + 1) * itemsPerPage - 1;
    const { data } = await supabase
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
      isPaused ? handleResume() : pausePomodoro();
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
  {:else if $currentState === "focus"}
    <title>{formatTime($countPomodoros)} - Time to focus!</title>
  {:else}
    <title>{formatTime($countPomodoros)} - Time for a break!</title>
  {/if}
  <meta name="Pomodoro" content="Pomodoro" />
</svelte:head>

<audio src={srcAudio} muted={isMuted} bind:paused={pauseAudio} preload="auto"
></audio>

<Container zIndex={6}>
  <div class="w-full h-full flex items-center relative">
    <div class="absolute top-0 left-0 right-0 z-10 flex justify-between py-3">
      <div class="flex gap-3">
        <button
          class="setting-button light"
          class:active={$currentState === "focus"}
          onclick={(e) => {
            e.currentTarget.blur();
            progress.set(0);
            $countPomodoros = minutesToSeconds($pomodoro);
            $currentState = "focus";
            handleResume();
          }}
        >
          <MaterialSymbolsAdjust width="14" height="14" />
        </button>

        <button
          class="setting-button light"
          class:active={$currentState === "break"}
          onclick={(e) => {
            e.currentTarget.blur();
            progress.set(0);
            $countPomodoros = minutesToSeconds($shortBreak);
            $currentState = "break";
            handleResume();
          }}
        >
          <MaterialSymbolsDarkModeRounded width="14" height="14" />
        </button>

        <button
          class="setting-button light"
          class:active={$currentState === "longbreak"}
          onclick={(e) => {
            e.currentTarget.blur();
            progress.set(0);
            $countPomodoros = minutesToSeconds($longBreak);
            $currentState = "longbreak";
            handleResume();
          }}
        >
          <MaterialSymbolsSailingRounded width="14" height="14" />
        </button>
      </div>
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
              bind:value={$pomodoro}
              class="input-setting"
            />
            <input
              name="shortBreak"
              autocomplete="off"
              type="number"
              min="1"
              step="1"
              bind:value={$shortBreak}
              class="input-setting"
            />
            <input
              name="longBreak"
              autocomplete="off"
              type="number"
              min="1"
              step="1"
              bind:value={$longBreak}
              class="input-setting"
            />
            <p class="text-14 font-500 col-span-3">Long Break interval</p>
            <input
              name="longBreakInterval"
              autocomplete="off"
              type="number"
              min="1"
              step="1"
              bind:value={$longBreakInterval}
              class="input-setting"
            />
            <p class="text-14 font-500 col-span-3">Current interval</p>
            <input
              name="longBreakInterval"
              autocomplete="off"
              type="number"
              min="1"
              max={$longBreakInterval}
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

    <div class="square">
      <div class="circle">
        <img
          src="/images/Van_Gogh_La Sieste.avif"
          alt="bg"
          class="absolute z-10 object-cover w-full h-full"
          style="filter: grayscale(1) contrast(1.2);"
        />

        {#if $currentState === "focus"}
          <img
            src="/images/Laugee George The End of the Day.avif"
            alt="bg"
            class="absolute z-[15] object-cover w-full h-full"
            style="filter: grayscale(1) contrast(1.2);"
            in:fade={{ duration: 1000, easing: linear }}
            out:fade={{ duration: 1000, easing: linear }}
          />
        {/if}

        <img
          src={$currentState === "focus"
            ? "/images/Laugee George The End of the Day.avif"
            : "/images/Van_Gogh_La Sieste.avif"}
          alt="pbg"
          class="absolute z-20 object-cover w-full h-full"
          style="mask-image: conic-gradient(
          from 0deg,
          black 0deg {progress.current}deg,
          transparent {progress.current}deg 360deg
          );"
        />

        <button
          class="time"
          onclick={(e) => {
            e.currentTarget.blur();
            isPaused ? handleResume() : pausePomodoro();
          }}
        >
          <span class="w-1/2 text-right"
            >{padWithZeroes(secondsToMinutes($countPomodoros))}</span
          >
          <span class="min-w-30 pb-36">:</span>
          <span class="w-1/2 text-left"
            >{padWithZeroes($countPomodoros % 60)}</span
          >
        </button>
      </div>

      <div class="center"></div>
      <div class="static"></div>
      <div
        class="dynamic"
        style="transform: rotate({progress.current}deg) scaleX(3);"
      ></div>
    </div>
  </div>
</Container>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .center {
    position: absolute;
    height: 1px;
    width: 1px;
    left: calc(50% - 0.5px);
    top: calc(50% - 0.5px);
    transform: scale(3);
    background-color: rgba(0, 0, 0, 1);
    border-radius: 50%;
    z-index: 21;
  }

  .static {
    position: absolute;
    height: calc(50% - 2px);
    width: 1px;
    left: calc(50% - 0.5px);
    transform-origin: bottom;
    top: 2px;
    transform: scaleX(3);
    background-color: rgba(0, 0, 0, 1);
    z-index: 20;
  }

  .dynamic {
    position: absolute;
    height: calc(50% - 2px);
    width: 1px;
    left: calc(50% - 0.5px);
    transform-origin: bottom;
    top: 2px;
    background-color: rgba(0, 0, 0, 1);
    z-index: 20;
  }

  .setting-button {
    @apply size-18 flex items-center justify-center text-13 leading-16 appearance-none text-center cursor-pointer rounded-2 transition duration-100 outline-none ring-1 ring-black/5 shadow shadow-black/30 disabled:opacity-15;
  }

  .setting-button.active {
    @apply !bg-green-400/60 !text-black;
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

  .square {
    width: 100%;
    aspect-ratio: 1;
    border: 3px solid #000000;
    position: relative;
  }

  .circle {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid #000000;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .time {
    width: 100%;
    position: inherit;
    z-index: 30;
    color: rgba(255, 255, 255, 1);
    font-size: 9rem;
    line-height: 9rem;
    font-weight: 300;
    text-shadow: 0 3px 3px rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.1s ease-in-out;
  }
</style>
