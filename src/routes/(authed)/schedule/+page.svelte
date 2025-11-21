<script lang="ts">
  import { enhance } from "$app/forms";
  import Calendar from "$lib/components/Calendar.svelte";
  import { schedule, todaySchedule } from "$lib/store/navstore";
  import { cachedDiary, cachedProgressLength } from "$lib/store/vocabstore";
  import type { CalendarDayType, DBSelect } from "$lib/types.js";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade } from "svelte/transition";
  import type { PageProps } from "./$types";
  import Container from "$lib/components/Container.svelte";

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  let calendarData = $state<CalendarDayType[]>([]);

  calendarData = $schedule?.reduce(
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

  type UpdateSchedule = {
    id: any;
    date: any;
    count: number;
  };

  async function updateScheduleLocal(
    start: UpdateSchedule,
    end: UpdateSchedule
  ) {
    schedule.update((current) =>
      current?.map((item) => {
        if (item.id === start.id) {
          return { ...item, ...start };
        } else if (item.id === end.id) {
          return { ...item, ...end };
        } else return item;
      })
    );
  }
</script>

<svelte:head>
  <title>📆</title>
  <meta name="Schedule" content="Some Schedule" />
</svelte:head>

<audio {src} bind:paused></audio>

<Container zIndex={6}>
  <div class="absolute w-main golden z-10">
    <div class="flex justify-center items-center absolute right-0 top-0 gap-3">
      <button
        class="calendar-button light"
        onclick={() => (showReset = !showReset)}
      >
        <Icon icon="ri:reset-right-line" width="14" height="14" />
      </button>
      <button
        class="calendar-button light"
        onclick={() => (showCreate = !showCreate)}
      >
        <Icon icon="solar:calendar-linear" width="14" height="14" />
      </button>
    </div>

    {#if showReset}
      <div
        class="light w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        transition:fade={{ duration: 150 }}
      >
        <div class="flex items-center justify-between bg-black">
          <p class="text-12 font-rubik text-white leading-21 pl-6">
            Set today task
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
            class="w-full grid grid-cols-3 grid-rows-3 gap-3 p-3"
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
                  updateScheduleLocal(
                    {
                      id: formData.get("id0"),
                      date: formData.get("date0"),
                      count: Number(formData.get("count0")),
                    },
                    {
                      id: formData.get("id1"),
                      date: formData.get("date1"),
                      count: Number(formData.get("count1")),
                    }
                  );
                  showReset = false;
                }
              };
            }}
          >
            <input
              hidden
              name="id0"
              autocomplete="off"
              value={$todaySchedule.start.id}
            />
            <input
              hidden
              name="id1"
              autocomplete="off"
              value={$todaySchedule.end.id}
            />

            <input
              name="date0"
              autocomplete="off"
              type="date"
              bind:value={$todaySchedule.start.date}
              class="form-date"
            />
            <input
              name="count0"
              autocomplete="off"
              type="number"
              min="0"
              bind:value={$todaySchedule.start.count}
              class="form-number"
            />

            <input
              name="date1"
              autocomplete="off"
              type="date"
              bind:value={$todaySchedule.end.date}
              class="form-date"
            />

            <input
              name="count1"
              autocomplete="off"
              type="number"
              min="0"
              bind:value={$todaySchedule.end.count}
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
    {/if}

    {#if showCreate}
      <div
        class="light w-1/2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        transition:fade={{ duration: 150 }}
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
          class="w-full flex items-center justify-center"
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
    {/if}
  </div>

  <Calendar schedule={calendarData} />

  <p
    class="light !bg-green-400/15 font-garamond text-12 font-500 leading-14 p-6 select-none"
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
          class="w-full gap-2 font-rubik text-12 h-24 flex items-center mb-2 select-none"
        >
          <div class="dark min-w-[120px] text-center leading-22 pt-2">
            {item.index + 1} - {item.index + 200}
          </div>
          <div class="light flex-1 text-center leading-22 pt-2">
            {format(new Date(item.start_date), "yyyy-MM-dd")}
          </div>
          <div class="light flex-1 text-center leading-22 pt-2">
            {format(new Date(item.end_date), "yyyy-MM-dd")}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="flex justify-center items-center">
    <button
      class="size-24 light select-none rounded-6 flex items-center justify-center disabled:cursor-not-allowed disabled:text-black/10"
      onclick={() => getPages(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <Icon icon="solar:alt-arrow-left-linear" width="14" height="14" />
    </button>

    <div class="rounded-6 light flex justify-center items-center mx-3 h-24">
      {#each pages as page}
        {#if page === "..."}
          <span class="text-12 leading-14 select-none">…</span>
        {:else}
          <button
            class:active={page === currentPage}
            class="page-button"
            onclick={() => getPages(page as number)}
          >
            {page}
          </button>
        {/if}
      {/each}
    </div>

    <button
      class="size-24 light rounded-6 select-none flex items-center justify-center disabled:cursor-not-allowed disabled:text-black/10"
      onclick={() => getPages(currentPage + 1)}
      disabled={currentPage === $cachedProgressLength}
    >
      <Icon icon="solar:alt-arrow-right-linear" width="14" height="14" />
    </button>
  </div>
</Container>

<style>
  .calendar-button {
    @apply size-24 flex justify-center items-center rounded-2 hover:bg-white/40 shadow-sm shadow-black/30;
  }

  .page-button {
    @apply select-none text-black/30 text-center size-24 font-rubik text-12 leading-21 pt-3;
  }

  .page-button.active {
    @apply text-black;
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
    @apply px-6 py-3 rounded-2 text-12 leading-12 font-rubik bg-black/10  hover:bg-black/20;
  }
</style>
