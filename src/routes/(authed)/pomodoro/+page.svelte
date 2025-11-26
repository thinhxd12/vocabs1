<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { PageProps } from "./$types";
  import { fade } from "svelte/transition";
  import { onDestroy, onMount } from "svelte";
  import Container from "$lib/components/Container.svelte";
  import {
    completedPomodoros,
    countPomodoros,
    currentState,
  } from "$lib/store/layoutstore";
  import { submitReportPomodoro } from "$lib/utils/functions";
  import { page } from "$app/state";
  import Pagination from "$lib/components/Pagination.svelte";
  import type { DBSelect } from "$lib/types";
  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  let showSetting = $state<boolean>(false);
  let showReport = $state<boolean>(false);
  let pomodoro = $state<number>(7);
  let shortBreak = $state<number>(2);
  let longBreak = $state<number>(15);
  let longBreakInterval = $state<number>(3);
  let interval: ReturnType<typeof setInterval>;
  let isPaused = $state<boolean>(true);
  let pauseAudio = $state<boolean>(true);

  const minutesToSeconds = (minutes: number) => minutes * 60;
  const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);
  const padWithZeroes = (number: number) => number.toString().padStart(2, "0");

  let now = $state<number>(0);
  let end = $state<number>(0);

  onMount(() => {
    if ($currentState === "focus" && !$countPomodoros)
      $countPomodoros = minutesToSeconds(pomodoro);
  });

  function formatTime(timeInSeconds: number): string {
    const minutes = secondsToMinutes(timeInSeconds);
    const remainingSeconds = timeInSeconds % 60;
    return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
  }

  function startPomodoro() {
    clearInterval(interval);

    $currentState = "focus";
    now = Date.now();
    end = now + $countPomodoros * 1000;
    isPaused = false;
    interval = setInterval(updatePomodoro, 1000);
  }

  function updatePomodoro() {
    now = Date.now();
    $countPomodoros = Math.round((end - now) / 1000);
    if (now >= end) {
      $completedPomodoros++;
      completePomodoro();
      pauseAudio = false;
    }
  }

  function completePomodoro() {
    submitReport();
    if ($completedPomodoros === longBreakInterval) {
      $completedPomodoros = 0;
      $countPomodoros = minutesToSeconds(longBreak);
      rest();
    } else {
      $countPomodoros = minutesToSeconds(shortBreak);
      rest();
    }
  }

  function rest() {
    clearInterval(interval);

    $currentState = "rest";
    now = Date.now();
    end = now + $countPomodoros * 1000;
    isPaused = false;
    interval = setInterval(updateRest, 1000);
  }

  function updateRest() {
    now = Date.now();
    $countPomodoros = Math.round((end - now) / 1000);
    if (now >= end) {
      $countPomodoros = minutesToSeconds(pomodoro);
      startPomodoro();
      pauseAudio = false;
    }
  }

  function pausePomodoro() {
    clearInterval(interval);
    isPaused = true;
  }

  function handleResume() {
    if ($currentState === "focus") {
      startPomodoro();
    } else {
      rest();
    }
  }

  async function submitReport() {
    await submitReportPomodoro(pomodoro, page.data.supabase);
  }

  let currentPage = $state<number>(1);
  let itemsPerPage = 15;
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["pomodoro_table"][]>([]);

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
    const fixNumber = Math.abs(
      totalItems! - Math.round(totalItems! / itemsPerPage) * itemsPerPage
    );
    const { data } = await supabase
      .from("pomodoro_table")
      .select("*")
      .order("date", { ascending: false })
      .range(
       (index - 1) * itemsPerPage - fixNumber,
        (index - 1) * itemsPerPage - fixNumber + itemsPerPage - 1
      );

    if (data) {
      paginationItems = data;
    }
  }

  async function handleShowReport() {
    await getTablePaginationLength();
    getDataPaginationByIndex(1);
    showReport = true;
  }

  onDestroy(() => {
    clearInterval(interval);
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === " ") {
      isPaused ? handleResume() : pausePomodoro();
    }
  }
</script>

<svelte:head>
  {#if $currentState === "focus"}
    <title>{formatTime($countPomodoros)} - Time to focus!</title>
  {:else}
    <title>{formatTime($countPomodoros)} - Time for a break!</title>
  {/if}
  <meta name="Pomodoro" content="Pomodoro" />
</svelte:head>
<audio src="/sounds/mp3_Ding.mp3" bind:paused={pauseAudio}></audio>

<Container zIndex={6}>
  <div
    class="w-full h-full relative"
    class:paused={isPaused}
    class:focus={$currentState === "focus"}
    class:rest={$currentState === "rest"}
  >
    <div
      class="absolute top-2 right-2 z-10 flex justify-end items-center gap-3"
    >
      <button class="setting-button" onclick={handleShowReport}>
        Report
      </button>
      <button class="setting-button" onclick={() => (showSetting = true)}>
        Setting
      </button>
    </div>
    {#if showSetting}
      <div
        class="absolute z-20 w-full h-full bg-black/80 py-60 px-20"
        transition:fade={{ duration: 100 }}
      >
        <div
          class="bg-white w-full rounded-2 overflow-hidden flex flex-col justify-center"
        >
          <div class="flex justify-between px-6 bg-black text-white py-3">
            <span class="text-15">Setting</span>
            <button
              onclick={() => (showSetting = false)}
              class=" flex size-24 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
            >
              <Icon
                icon="material-symbols:close-rounded"
                width="14"
                height="14"
              />
            </button>
          </div>
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
                min="0"
                step="1"
                bind:value={pomodoro}
                class="input-setting"
              />
              <input
                name="shortBreak"
                autocomplete="off"
                type="number"
                min="0"
                step="1"
                bind:value={shortBreak}
                class="input-setting"
              />
              <input
                name="longBreak"
                autocomplete="off"
                type="number"
                min="0"
                step="1"
                bind:value={longBreak}
                class="input-setting"
              />
              <p class="text-14 font-500 col-span-3">Long Break interval</p>
              <input
                name="longBreakInterval"
                autocomplete="off"
                type="number"
                min="0"
                step="1"
                bind:value={longBreakInterval}
                class="input-setting"
              />
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if showReport}
      <div
        class="absolute z-20 w-full h-full bg-black/80 py-60 px-20"
        transition:fade={{ duration: 100 }}
      >
        <div
          class="bg-white w-full h-full rounded-2 overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between px-6 bg-black text-white py-3">
              <span class="text-15">Report</span>
              <button
                onclick={() => (showReport = false)}
                class=" flex size-24 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
              >
                <Icon
                  icon="material-symbols:close-rounded"
                  width="14"
                  height="14"
                />
              </button>
            </div>

            <table class="w-full">
              <thead>
                <tr class="text-12 font-400 bg-gray-200 text-black">
                  <th>Date</th>
                  <th>Time(hh:mm)</th>
                </tr>
              </thead>
              <tbody class="text-center text-12">
                {#each paginationItems as item}
                  <tr>
                    <td>{item.date}</td>
                    <td>
                      {padWithZeroes(secondsToMinutes(item.time))} : {padWithZeroes(
                        item.time % 60
                      )}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if totalItems}
            <div class="bg-gray-200 w-full p-3">
              <Pagination
                {totalItems}
                {itemsPerPage}
                {currentPage}
                {onPageChange}
              />
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <div
      class="main dark w-full z-10 golden absolute left-0 top-1/2 -translate-y-1/2 py-12 flex flex-col justify-between items-center"
    >
      <div class="w-full flex items-center justify-center gap-15">
        <button
          class="timer-status"
          class:focusing={$currentState === "focus"}
          onclick={() => {
            $currentState = "focus";
            isPaused = true;
            $countPomodoros = minutesToSeconds(pomodoro);
          }}
        >
          Pomodoro
        </button>
        <button
          class="timer-status"
          class:repose={$currentState === "rest" && $completedPomodoros !== 0}
          onclick={() => {
            if ($completedPomodoros === 0) $completedPomodoros = 1;
            $currentState = "rest";
            isPaused = true;
            $countPomodoros = minutesToSeconds(shortBreak);
          }}
        >
          Short Break
        </button>
        <button
          class="timer-status"
          class:repose={$currentState === "rest" && $completedPomodoros === 0}
          onclick={() => {
            $completedPomodoros = 0;
            $countPomodoros = minutesToSeconds(longBreak);
            $currentState = "rest";
            isPaused = true;
          }}
        >
          Long Break
        </button>
      </div>
      <h1
        class="w-full flex justify-center items-center text-[120px] leading-100 font-100 text-white select-none"
      >
        <span class="w-1/2 text-right pr-6"
          >{padWithZeroes(secondsToMinutes($countPomodoros))}</span
        >
        <span class="pb-15">:</span>
        <span class="w-1/2 text-left pl-6"
          >{padWithZeroes($countPomodoros % 60)}</span
        >
      </h1>
      {#if isPaused}
        <button
          class="timer-button {$currentState === 'focus' ? 'play' : 'pause'}"
          onclick={handleResume}
        >
          Start
        </button>
      {:else}
        <button
          class="timer-button {$currentState === 'focus' ? 'play' : 'pause'}"
          onclick={pausePomodoro}
        >
          Pause
        </button>
      {/if}
    </div>
  </div>
</Container>

<svelte:window on:keydown={onKeyDown} />

<style>
  .focus::after {
    content: "";
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: url("/images/red-tomatoes.jpg");
    background-size: contain;
  }

  .paused::after {
    filter: grayscale(1);
  }

  .rest::after {
    content: "";
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: url("/images/green-tomatoes.jpg");
    background-size: contain;
  }

  .main {
    box-shadow: 0 0 12px black;
  }

  .setting-button {
    @apply font-rubik px-8 pt-6 pb-4 rounded-2 text-14 leading-14 bg-black/45 text-white/80 hover:text-white shadow-sm shadow-black/60;
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

  .timer-status {
    @apply font-rubik font-400 text-15 text-white px-9 pt-4 pb-2 rounded-2 shadow-sm shadow-black/60;
  }

  .timer-status.repose {
    background-color: #99c5aa;
  }

  .timer-status.focusing {
    background: #ed5152;
  }

  .timer-button {
    @apply font-rubik font-600 text-21 leading-22 text-center w-1/3 pt-8 pb-4 uppercase bg-white rounded-3 shadow-md shadow-black/60 transition;
  }

  .timer-button:active {
    @apply !shadow-none;
  }

  .timer-button.play {
    color: #ed5152;
  }

  .timer-button.pause {
    color: #99c5aa;
  }

  tr {
    border-bottom: 1px solid rgb(240, 240, 240);
  }

  td,
  th {
    padding: 5px 0;
  }
</style>
