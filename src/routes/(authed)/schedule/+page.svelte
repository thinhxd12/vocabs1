<script lang="ts">
  import { enhance } from "$app/forms";
  import Calendar from "$lib/components/Calendar.svelte";
  import { todaySchedule } from "$lib/store/navstore";
  import { cachedDiary, cachedProgressLength } from "$lib/store/vocabstore";
  import type { CalendarDayType, DBSelect } from "$lib/types.js";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fly } from "svelte/transition";
  import type { PageProps } from "./$types";

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  let calendarData = $state<CalendarDayType[]>([]);
  calendarData = layoutData.schedule;

  let src = $state<string>("");
  let paused = $state<boolean>(true);
  let showReset = $state<boolean>(false);
  let showCreate = $state<boolean>(false);
  let progressItems = $state<DBSelect["progress_table"][] | null>(null);
  let currentPage = $state<number>(1);
  let pages = $state<(string | number)[]>([]);

  async function getProgressByIndex(index: number) {
    const { data } = await supabase
      .from("progress_table")
      .select("*")
      .order("id", { ascending: true })
      .range(index * 5, index * 5 + 4);
    if (data && data.length) {
      progressItems = data;
    }
  }

  async function getPages(current: number) {
    let totalPages = $cachedProgressLength;
    if (!totalPages) return;
    currentPage = current;
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    pages = rangeWithDots;
    getProgressByIndex(totalPages - current);
  }

  onMount(async () => {
    if (!$cachedProgressLength) {
      if (layoutData.totalProgress) {
        $cachedProgressLength = Math.ceil(layoutData.totalProgress / 5);
        const { data } = await supabase
          .from("diary_table")
          .select("*")
          .order("id", { ascending: true });
        if (data) {
          $cachedDiary = data;
        }
        getPages(1);
      }
    } else getPages(1);
  });

  async function reloadScheduleData() {
    const todayDate = format(new Date(), "yyyy-MM-dd");
    const { data: schedule } = await supabase
      .from("schedule_table")
      .select("*")
      .order("id", { ascending: true });

    if (schedule) {
      let index = schedule.findIndex(
        (item) =>
          format(item.date!, "yyyy-MM-dd") === todayDate || item.date === null
      );

      if (index > -1) {
        $todaySchedule = {
          start: schedule[index],
          end: schedule[index + 1],
        };
      } else $todaySchedule = undefined;

      calendarData = schedule.reduce(
        (acc: any, curr: DBSelect["schedule_table"]) => {
          const dateObj = new Date(curr.date!);
          const day = dateObj.getDate();
          const month = dateObj.getMonth();
          const year = dateObj.getFullYear();
          const existing = acc.find(
            (item: any) => item.date === day && item.month === month
          );
          if (existing) {
            existing.count += curr.count;
          } else {
            acc.push({ date: day, month, year, count: curr.count });
          }
          return acc;
        },
        []
      );
    }
  }
</script>

<svelte:head>
  <title>📆</title>
  <meta name="Schedule" content="Some Schedule" />
</svelte:head>

<audio {src} bind:paused></audio>

<main
  class="w-content relative h-[calc(100vh-42px)] no-scrollbar overflow-y-scroll flex flex-col gap-3"
>
  <div class="w-full h-[210px] absolute z-50">
    <div
      class="absolute left-3 top-3 cursor-default px-3 pt-2 pb-1 bg-white/45 layout-white !shadow-none"
    >
      {#if $cachedDiary}
        {#each $cachedDiary as item}
          <p class="text-7 font-400 leading-8 text-black/80 font-rubik">
            {format(new Date(item.date), "yyyy-MM-dd")}
            {item.count}
          </p>
        {/each}
      {/if}
    </div>

    {#if showReset}
      <div
        class="absolute top-[50px] left-[64px] w-[250px] layout-white"
        transition:fly={{ y: -15, duration: 150 }}
      >
        <div class="flex items-center justify-between bg-black">
          <p class="text-12 font-rubik text-white leading-21 pl-6">
            Set current task
          </p>
          <button
            onclick={() => (showReset = !showReset)}
            class=" flex size-24 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
          >
            <Icon
              icon="material-symbols:close-rounded"
              width="14"
              height="14"
            />
          </button>
        </div>

        {#if $todaySchedule}
          <form
            name="editprogress"
            action="?/setProgress"
            method="post"
            class="w-full flex items-center justify-between gap-3 p-6"
            use:enhance={({ formElement, formData, action, cancel }) => {
              return async ({ result }) => {
                if (result.type === "failure") {
                  toast.error(result.data?.error as string, {
                    class: "my-toast",
                  });
                } else {
                  toast.success("Update successfully", {
                    class: "my-toast",
                  });
                  showReset = false;
                }
              };
            }}
          >
            <input
              name="count0"
              autocomplete="off"
              type="number"
              min="0"
              bind:value={$todaySchedule.start.count}
              class="text-13 font-rubik leading-15 pt-3 h-25 pl-6 max-w-[90px] rounded-3 bg-transparent text-center border border-black/15 focus:border-black/30 outline-none"
            />
            <input
              hidden
              name="id0"
              autocomplete="off"
              value={$todaySchedule.start.id}
            />

            <input
              name="count1"
              autocomplete="off"
              type="number"
              min="0"
              bind:value={$todaySchedule.end.count}
              class="text-13 font-rubik leading-15 pt-3 h-25 pl-6 max-w-[90px] rounded-3 bg-transparent text-center border border-black/15 focus:border-black/30 outline-none"
            />
            <input
              hidden
              name="id1"
              autocomplete="off"
              value={$todaySchedule.end.id}
            />
            <button
              type="submit"
              class="size-25 hover:bg-black/20 flex justify-center items-center rounded-3"
            >
              <Icon
                icon="solar:alt-arrow-right-linear"
                width="15"
                height="15"
              />
            </button>
          </form>
        {/if}
      </div>
    {/if}

    {#if showCreate}
      <div
        class="absolute top-[50px] left-[64px] w-[250px] layout-white"
        transition:fly={{ y: -15, duration: 150 }}
      >
        <div class="flex items-center justify-between bg-black">
          <p class="text-12 font-rubik text-white leading-21 pl-6">
            Create new schedule
          </p>
          <button
            onclick={() => (showCreate = !showCreate)}
            class=" flex size-24 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
          >
            <Icon
              icon="material-symbols:close-rounded"
              width="14"
              height="14"
            />
          </button>
        </div>

        <form
          name="createschedule"
          action="?/setSchedule"
          method="post"
          class="w-full flex items-center justify-center gap-[60px] p-4"
          use:enhance={({ formElement, formData, action, cancel }) => {
            return async ({ result }) => {
              if (result.type === "failure") {
                toast.error(result.data?.error as string, {
                  class: "my-toast",
                });
              } else {
                toast.success("Create successfully", {
                  class: "my-toast",
                });
                reloadScheduleData();
              }
            };
          }}
        >
          <button
            type="button"
            class="text-12 font-rubik hover:bg-black/20 rounded-3 px-4 pt-2"
            onclick={() => (showCreate = !showCreate)}
          >
            Cancle
          </button>

          <button
            type="submit"
            class="text-12 font-rubik hover:bg-black/20 rounded-3 px-4 pt-2"
          >
            Create
          </button>
        </form>
      </div>
    {/if}

    <div class="flex justify-center items-center absolute right-3 top-3 gap-3">
      <button
        class="rounded-3 size-20 flex items-center justify-center layout-white text-black/80"
        onclick={() => (showReset = !showReset)}
      >
        <Icon icon="ri:reset-right-line" width="14" height="14" />
      </button>
      <button
        class="rounded-3 size-20 flex items-center justify-center layout-white text-black/80"
        onclick={() => (showCreate = !showCreate)}
      >
        <Icon icon="solar:calendar-linear" width="14" height="14" />
      </button>
    </div>
  </div>

  <Calendar schedule={calendarData} />

  <p
    class="font-garamond text-12 font-500 leading-14 layout-white !bg-green-400/15 p-6 select-none"
  >
    The tree that is supposed to grow to a proud height can dispense with bad
    weather and storms. Whether misfortune and external resistance, some kinds
    of hatred, jealousy, stubbornness, mistrust, hardness, avarice, and violence
    do not belong among the favorable conditions without which any great growth.
    The poison of which weaker natures perish strengthens the strong — nor do
    they call it poison.
  </p>

  <div class="w-full flex flex-col items-center min-h-[135px]">
    {#if progressItems}
      {#each progressItems as item}
        <div
          class="w-content gap-1 font-rubik text-12 h-24 flex items-center mb-3 select-none"
        >
          <div
            class="layout-black min-w-[120px] text-center text-secondary-white leading-22 pt-2"
          >
            {item.index + 1} - {item.index + 200}
          </div>
          <div class="flex-1 text-center leading-22 pt-2 layout-white">
            {format(new Date(item.start_date), "yyyy-MM-dd")}
          </div>
          <div class="flex-1 text-center leading-22 pt-2 layout-white">
            {format(new Date(item.end_date), "yyyy-MM-dd")}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="flex justify-center items-center">
    <button
      class="size-24 select-none rounded-9 layout-white flex items-center justify-center text-black/80 disabled:cursor-not-allowed disabled:text-black/10"
      onclick={() => getPages(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <Icon icon="solar:alt-arrow-left-linear" width="14" height="14" />
    </button>

    <div
      class="rounded-full layout-white flex justify-center items-center mx-3 h-24"
    >
      {#each pages as page}
        {#if page === "..."}
          <span class="text-12 leading-14 select-none">…</span>
        {:else}
          <button
            class:active={page === currentPage}
            class="page-button select-none text-center size-24 font-rubik text-12 leading-21 pt-3"
            onclick={() => getPages(page as number)}
          >
            {page}
          </button>
        {/if}
      {/each}
    </div>

    <button
      class="size-24 rounded-9 select-none layout-white flex items-center justify-center text-black/80 disabled:cursor-not-allowed disabled:text-black/10"
      onclick={() => getPages(currentPage + 1)}
      disabled={currentPage === $cachedProgressLength}
    >
      <Icon icon="solar:alt-arrow-right-linear" width="14" height="14" />
    </button>
  </div>
</main>

<style>
  .page-button.active {
    @apply bg-green-400/30 rounded-full text-white;
  }
</style>
