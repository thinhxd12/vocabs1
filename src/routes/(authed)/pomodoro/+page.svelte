<script lang="ts">
  import Icon from "@iconify/svelte";
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

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let showSetting = $state<boolean>(false);
  let showReport = $state<boolean>(false);
  let interval: ReturnType<typeof setInterval>;
  let isPaused = $state<boolean>(true);
  let pauseAudio = $state<boolean>(true);
  let srcAudio = $state<string>("/sounds/mp3_rest.ogg");
  let isMuted = $state<boolean>(false);
  let currentPage = $state<number>(1);
  let itemsPerPage = Math.floor((innerHeight.current! - 120 - 25 - 28) / 25);
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["pomodoro_table"][]>([]);

  const minutesToSeconds = (minutes: number) => minutes * 60;
  const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);
  const padWithZeroes = (number: number) => number.toString().padStart(2, "0");

  let now = $state<number>(0);
  let end = $state<number>(0);
  let angle = $state<number>(0);

  onMount(() => {
    if ($currentState === "focus" && !$countPomodoros)
      $countPomodoros = minutesToSeconds($pomodoro);
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
    angle = (($pomodoro * 60 - $countPomodoros) / $pomodoro) * 6;
    if (now >= end) {
      angle = 0;
      $currentInterval++;
      completePomodoro();
      srcAudio = "/sounds/mp3_rest.ogg";
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
      angle = (($shortBreak * 60 - $countPomodoros) / $shortBreak) * 6;
    } else angle = (($longBreak * 60 - $countPomodoros) / $longBreak) * 6;
    if (now >= end) {
      angle = 0;
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
          class="setting-button"
          class:active={$currentState === "focus"}
          onclick={() => {
            $countPomodoros = minutesToSeconds($pomodoro);
            $currentState = "focus";
            isPaused = true;
          }}
        >
          <Icon icon="material-symbols:adjust-outline" width="16" height="16" />
        </button>

        <button
          class="setting-button"
          class:active={$currentState === "break"}
          onclick={() => {
            $countPomodoros = minutesToSeconds($shortBreak);
            $currentState = "break";
            isPaused = true;
          }}
        >
          <Icon
            icon="material-symbols:bedtime-outline"
            width="16"
            height="16"
          />
        </button>

        <button
          class="setting-button"
          class:active={$currentState === "longbreak"}
          onclick={() => {
            $countPomodoros = minutesToSeconds($longBreak);
            $currentState = "longbreak";
            isPaused = true;
          }}
        >
          <Icon
            icon="material-symbols:sailing-outline"
            width="16"
            height="16"
          />
        </button>
      </div>
      <div class="flex gap-3">
        <button class="setting-button" onclick={handleShowReport}>
          <Icon
            icon="material-symbols:insert-chart-outline-rounded"
            width="16"
            height="16"
          />
        </button>

        <button class="setting-button" onclick={() => (showSetting = true)}>
          <Icon
            icon="material-symbols:settings-outline-rounded"
            width="16"
            height="16"
          />
        </button>

        <button class="setting-button" onclick={() => (isMuted = !isMuted)}>
          {#if isMuted}
            <Icon
              icon="material-symbols:volume-off-outline-rounded"
              width="16"
              height="16"
            />
          {:else}
            <Icon
              icon="material-symbols:volume-up-outline-rounded"
              width="16"
              height="16"
            />
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
            <tr class="text-12 font-400 bg-gray-100 text-black">
              <th>Date</th>
              <th>Time(hh:mm)</th>
            </tr>
          </thead>
          <tbody class="text-center text-12">
            {#each paginationItems as item}
              <tr>
                <td class="w-80">{item.date}</td>
                <td class="flex items-center justify-between">
                  <span
                    class="h-9 {todayDate === item.date
                      ? 'bg-black'
                      : 'bg-[#a8a8a8]'}"
                    style="width: {Math.round((item.time / 7) * 4)}px;"
                  ></span>
                  <span class="pr-6 min-w-45">
                    {padWithZeroes(secondsToMinutes(item.time))} : {padWithZeroes(
                      item.time % 60,
                    )}
                  </span>
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
          src={$currentState === "focus"
            ? "/images/Laugee George The End of the Day.avif"
            : "/images/Van_Gogh_La Sieste.avif"}
          alt="bg"
          class="absolute z-10 object-cover w-full h-full grayscale-[1]"
        />

        {#if !isPaused}
          <img
            src={$currentState === "focus"
              ? "/images/Laugee George The End of the Day.avif"
              : "/images/Van_Gogh_La Sieste.avif"}
            alt="pbg"
            class="absolute z-20 object-cover w-full h-full"
            style="mask-image: conic-gradient(
          from 0deg,
          black 0deg {angle}deg,
          transparent {angle}deg 360deg
          );"
          />

          <div class="static"></div>
          <div class="dynamic" style="transform: rotate({angle}deg);"></div>
        {/if}

        <button class="time" onclick={isPaused ? handleResume : pausePomodoro}>
          <span class="w-1/2 text-right"
            >{padWithZeroes(secondsToMinutes($countPomodoros))}</span
          >
          <span class="pb-15">:</span>
          <span class="w-1/2 text-left"
            >{padWithZeroes($countPomodoros % 60)}</span
          >
        </button>
      </div>
    </div>
  </div>
</Container>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .static {
    position: absolute;
    width: 1px;
    height: 50%;
    left: calc(50% - 0.5px);
    top: 0;
    background-color: rgba(0, 0, 0, 0.15);
    z-index: 20;
  }

  .dynamic {
    position: absolute;
    width: 1px;
    height: calc(50% * 1.4142);
    left: calc(50% - 0.5px);
    bottom: 50%;
    background-color: rgba(0, 0, 0, 0.15);
    z-index: 20;
    transform-origin: bottom;
  }

  .setting-button {
    @apply h-24 w-26 flex justify-center items-center rounded-2 bg-black/45 text-white/80 hover:text-white shadow-sm shadow-black/60;
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

  tr {
    border-bottom: 1px solid rgb(240, 240, 240);
  }

  td,
  th {
    padding: 3px 0;
  }

  .square {
    width: 100%;
    aspect-ratio: 1;
    border: 2px solid #000;
  }

  .circle {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 2px solid #000;
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
    color: #ffffff;
    font-size: 8rem;
    line-height: 8rem;
    font-weight: 200;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.1s ease-in-out;
  }
</style>
