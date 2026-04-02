<script lang="ts">
  import { enhance } from "$app/forms";
  import Calendar from "$lib/components/Calendar.svelte";
  import {
    getSchedule,
    getTodaySchedule,
    showTimer,
    todaySchedule,
  } from "$lib/store/navstore";
  import type { DBSelect } from "$lib/types.js";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import MaterialSymbolsSettingsRounded from "~icons/material-symbols/settings-rounded";
  import MaterialSymbolsCalendarAddOnRounded from "~icons/material-symbols/calendar-add-on-rounded";
  import Modal from "$lib/components/Modal.svelte";
  import { addToast } from "$lib/store/layoutstore";

  let { data: layoutData }: PageProps = $props();

  let src = $state<string>("");
  let paused = $state<boolean>(true);
  let showReset = $state<boolean>(false);
  let showCreate = $state<boolean>(false);

  let currentPage = $state<number>(1);
  let itemsPerPage = 5;
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["progress_table"][] | null>(null);

  async function getTablePaginationLength() {
    const { count } = await layoutData.supabase
      .from("progress_table")
      .select("id", { count: "exact", head: true });
    if (count) totalItems = count;
  }

  function onPageChange(page: number) {
    currentPage = page;
    getDataPaginationByIndex(page);
  }

  async function getDataPaginationByIndex(index: number) {
    const totalPages = Math.ceil(totalItems! / itemsPerPage);
    const from = (totalPages - index) * itemsPerPage;
    const to = (totalPages - index + 1) * itemsPerPage - 1;
    const { data } = await layoutData.supabase
      .from("progress_table")
      .select("*")
      .order("id", { ascending: true })
      .range(from, to);

    if (data && data.length) {
      paginationItems = data;
    }
  }

  onMount(async () => {
    await getTablePaginationLength();
    getDataPaginationByIndex(1);
  });
</script>

<svelte:head>
  {#if !$showTimer}
    <title>📆</title>
  {/if}
  <meta name="Schedule" content="Some Schedule" />
</svelte:head>

<audio {src} bind:paused preload="auto"></audio>

<Container>
  <div
    class="absolute z-3 flex justify-center items-center right-3 top-3 gap-3"
  >
    <button class="calendar-button" onclick={() => (showReset = !showReset)}>
      <MaterialSymbolsSettingsRounded width="14" height="14" />
    </button>
    <button class="calendar-button" onclick={() => (showCreate = !showCreate)}>
      <MaterialSymbolsCalendarAddOnRounded width="14" height="14" />
    </button>
  </div>

  <Modal bind:showModal={showReset}>
    <div class="w-main px-45 pt-60 flex flex-col">
      <p class="w-full h-24 px-6 bg-black text-white text-13 leading-24">
        Set today task
      </p>
      {#if $todaySchedule}
        <form
          name="editprogress"
          action="?/setProgress"
          method="post"
          class="w-full bg-white grid grid-cols-3 grid-rows-3 gap-3 p-3"
          use:enhance={({ formElement, formData, action, cancel }) => {
            return async ({ result }) => {
              if (result.type === "failure") {
                addToast({
                  type: "error",
                  title: "Error!",
                  message: result.data?.error as string,
                });
              } else {
                addToast({
                  type: "success",
                  title: "Success!",
                  message: "Set items successfully.",
                });
                showReset = false;
                await getSchedule();
                getTodaySchedule();
              }
            };
          }}
        >
          <input
            hidden
            name="id0"
            autocomplete="off"
            value={$todaySchedule.first.id}
          />
          <input
            hidden
            name="id1"
            autocomplete="off"
            value={$todaySchedule.second.id}
          />

          <input
            name="date0"
            autocomplete="off"
            type="date"
            bind:value={$todaySchedule.first.date}
            class="form-date"
          />
          <input
            name="count0"
            autocomplete="off"
            type="number"
            min="0"
            bind:value={$todaySchedule.first.count}
            class="form-number"
          />

          <input
            name="date1"
            autocomplete="off"
            type="date"
            bind:value={$todaySchedule.second.date}
            class="form-date"
          />

          <input
            name="count1"
            autocomplete="off"
            type="number"
            min="0"
            bind:value={$todaySchedule.second.count}
            class="form-number"
          />

          <div class="form-buttons">
            <button
              type="button"
              class="form-button"
              onclick={() => (showReset = !showReset)}
            >
              Cancle
            </button>

            <button type="submit" class="form-button"> Submit </button>
          </div>
        </form>
      {/if}
    </div>
  </Modal>

  <Modal bind:showModal={showCreate}>
    <div class="w-main px-45 pt-90 flex flex-col">
      <p class="w-full h-24 px-6 bg-black text-white text-13 leading-24">
        Set today task
      </p>
      <form
        name="createschedule"
        action="?/setSchedule"
        method="post"
        class="w-full bg-white flex items-center justify-center"
        use:enhance={({ formElement, formData, action, cancel }) => {
          return async ({ result }) => {
            if (result.type === "failure") {
              addToast({
                type: "error",
                title: "Error!",
                message: result.data?.error as string,
              });
            } else {
              addToast({
                type: "success",
                title: "Success!",
                message: "Create schedule successfully.",
              });
              showCreate = false;
              await getSchedule();
              getTodaySchedule();
            }
          };
        }}
      >
        <div class="flex gap-30 py-6">
          <button
            type="button"
            class="form-button"
            onclick={() => (showCreate = !showCreate)}
          >
            Cancle
          </button>

          <button type="submit" class="form-button"> Create </button>
        </div>
      </form>
    </div>
  </Modal>

  <Calendar />

  <p
    class="light rounded-2 !bg-green-400/15 font-garamond text-10 font-400 leading-10 px-6 py-4"
  >
    The tree that is supposed to grow to a proud height can dispense with bad
    weather and storms. Whether misfortune and external resistance, some kinds
    of hatred, jealousy, stubbornness, mistrust, hardness, avarice, and violence
    do not belong among the favorable conditions without which any great growth.
    The poison of which weaker natures perish strengthens the strong — nor do
    they call it poison.
  </p>

  {#if totalItems}
    <Pagination
      {totalItems}
      {itemsPerPage}
      {currentPage}
      {onPageChange}
      --width="21px"
      --height="21px"
    />
  {/if}

  <div class="w-full flex flex-col gap-1 items-center">
    {#each paginationItems as item}
      <div
        class="w-full rounded-2 overflow-hidden font-rubik text-12 leading-23 h-21 flex items-center select-none"
      >
        <div class="dark min-w-120 h-full text-center">
          {item.index + 1}
        </div>
        <div class="flex-1 light flex justify-center items-center h-full">
          <div class="indent-36 w-1/2 h-full">
            {item.start_date}
          </div>
          <div class="indent-30 w-1/2 h-full">
            {item.end_date}
          </div>
        </div>
      </div>
    {/each}
  </div>
</Container>

<style lang="postcss">
  .calendar-button {
    @apply size-18 flex items-center justify-center outline-none bg-white/15 border border-white/10 text-black text-12 leading-18 rounded-2 hover:bg-white/30;
    backdrop-filter: blur(12px);
  }

  .form-date {
    @apply col-span-2 text-12 font-rubik leading-12 p-2 pl-6 w-full rounded-3 bg-transparent border border-black/15 focus:border-black/30 outline-none;
  }

  .form-number {
    @apply text-center text-12 font-rubik leading-12 p-2 pl-6 w-full rounded-3 bg-transparent border border-black/15 focus:border-black/30 outline-none;
  }

  .form-buttons {
    @apply col-span-3 flex items-center justify-center gap-30;
  }

  .form-button {
    @apply px-12 pt-6 pb-4 rounded-2 text-12 leading-12 font-rubik bg-black/10  hover:bg-black/20;
  }
</style>
