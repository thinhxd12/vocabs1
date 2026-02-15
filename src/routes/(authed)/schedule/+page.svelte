<script lang="ts">
  import { enhance } from "$app/forms";
  import Calendar from "$lib/components/Calendar.svelte";
  import { schedule, todaySchedule } from "$lib/store/navstore";
  import { cachedDiary } from "$lib/store/vocabstore";
  import type { CalendarDayType, DBSelect } from "$lib/types.js";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade } from "svelte/transition";
  import type { PageProps } from "./$types";
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import MaterialSymbolsSettingsOutlineRounded from "~icons/material-symbols/settings-outline-rounded";
  import MaterialSymbolsCalendarAddOnRounded from "~icons/material-symbols/calendar-add-on-rounded";
  import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";

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
        (item: any) => item.date === day && item.month === month,
      );
      if (existing) {
        existing.count += curr.count;
      } else {
        acc.push({ date: day, month, year, count: curr.count });
      }
      return acc;
    },
    [],
  );

  let src = $state<string>("");
  let paused = $state<boolean>(true);
  let showReset = $state<boolean>(false);
  let showCreate = $state<boolean>(false);

  let currentPage = $state<number>(1);
  let itemsPerPage = 5;
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["progress_table"][] | null>(null);

  async function getTablePaginationLength() {
    const { count } = await supabase
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
    const { data } = await supabase
      .from("progress_table")
      .select("*")
      .order("id", { ascending: true })
      .range(from, to);

    if (data && data.length) {
      paginationItems = data;
    }
  }

  onMount(async () => {
    if (!$cachedDiary) {
      const { data } = await supabase
        .from("diary_table")
        .select("*")
        .order("id", { ascending: true });
      if (data) {
        $cachedDiary = data;
      }
    }
    await getTablePaginationLength();
    getDataPaginationByIndex(1);
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
          format(item.date!, "yyyy-MM-dd") === todayDate || item.date === null,
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
            (item: any) => item.date === day && item.month === month,
          );
          if (existing) {
            existing.count += curr.count;
          } else {
            acc.push({ date: day, month, year, count: curr.count });
          }
          return acc;
        },
        [],
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
    end: UpdateSchedule,
  ) {
    schedule.update((current) =>
      current?.map((item) => {
        if (item.id === start.id) {
          return { ...item, ...start };
        } else if (item.id === end.id) {
          return { ...item, ...end };
        } else return item;
      }),
    );
  }
</script>

<svelte:head>
  <title>📆</title>
  <meta name="Schedule" content="Some Schedule" />
</svelte:head>

<audio {src} bind:paused preload="auto"></audio>

<Container zIndex={6}>
  <div class="absolute w-main golden z-10">
    <div class="flex justify-center items-center absolute right-0 top-0 gap-3">
      <button
        class="calendar-button light"
        onclick={() => (showReset = !showReset)}
      >
        <MaterialSymbolsSettingsOutlineRounded width="16" height="16" />
      </button>
      <button
        class="calendar-button light"
        onclick={() => (showCreate = !showCreate)}
      >
        <MaterialSymbolsCalendarAddOnRounded width="16" height="16" />
      </button>
    </div>

    {#if showReset}
      <div
        class="absolute z-20 w-full h-full bg-black/30 p-50"
        transition:fade={{ duration: 100 }}
      >
        <div
          class="bg-white w-full h-full rounded-2 overflow-hidden flex flex-col"
        >
          <div
            class="w-full min-h-36 px-6 flex items-center justify-between bg-black"
          >
            <p class="text-12 font-rubik text-white leading-21 pl-6">
              Set today task
            </p>
            <button
              onclick={() => (showReset = !showReset)}
              class=" flex size-24 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
            >
              <MaterialSymbolsCloseRounded width="14" height="14" />
            </button>
          </div>

          {#if $todaySchedule}
            <form
              name="editprogress"
              action="?/setProgress"
              method="post"
              class="w-full h-full grid grid-cols-3 grid-rows-3 gap-3 p-3"
              use:enhance={({ formElement, formData, action, cancel }) => {
                return async ({ result }) => {
                  if (result.type === "failure") {
                    toast.error("Error!", {
                      description: result.data?.error as string,
                      class: "my-toast-error",
                      classes: {
                        title: "text-[#f70000] text-14",
                        description: "text-black/80 text-12",
                      },
                    });
                  } else {
                    toast.success("Success!", {
                      description: "Edit successfully.",
                      class: "my-toast-success",
                      classes: {
                        title: "text-[#00c441] text-15 font-500",
                        description: "text-black/70 text-12 font-400",
                      },
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
                      },
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
      </div>
    {/if}

    {#if showCreate}
      <div
        class="absolute z-20 w-full h-full bg-black/30 p-50"
        transition:fade={{ duration: 100 }}
      >
        <div class="bg-white w-full rounded-2 overflow-hidden flex flex-col">
          <div
            class="w-full min-h-36 px-6 flex items-center justify-between bg-black"
          >
            <p class="text-12 font-rubik text-white leading-21 pl-6">
              Create new schedule
            </p>
            <button
              onclick={() => (showCreate = !showCreate)}
              class=" flex size-24 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
            >
              <MaterialSymbolsCloseRounded width="14" height="14" />
            </button>
          </div>

          <form
            name="createschedule"
            action="?/setSchedule"
            method="post"
            class="w-full h-36 flex items-center justify-center"
            use:enhance={({ formElement, formData, action, cancel }) => {
              return async ({ result }) => {
                if (result.type === "failure") {
                  toast.error("Error!", {
                    description: result.data?.error as string,
                    class: "my-toast-error",
                    classes: {
                      title: "text-[#f70000] text-14",
                      description: "text-black/80 text-12",
                    },
                  });
                } else {
                  toast.success("Success!", {
                    description: "Create successfully.",
                    class: "my-toast-success",
                    classes: {
                      title: "text-[#00c441] text-15 font-500",
                      description: "text-black/70 text-12 font-400",
                    },
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
      </div>
    {/if}
  </div>

  <Calendar schedule={calendarData} />

  <p
    class="light !bg-green-400/15 font-garamond text-12 font-500 leading-14 p-6"
  >
    The tree that is supposed to grow to a proud height can dispense with bad
    weather and storms. Whether misfortune and external resistance, some kinds
    of hatred, jealousy, stubbornness, mistrust, hardness, avarice, and violence
    do not belong among the favorable conditions without which any great growth.
    The poison of which weaker natures perish strengthens the strong — nor do
    they call it poison.
  </p>

  <div class="w-full flex flex-col items-center min-h-[135px]">
    {#each paginationItems as item}
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
  </div>

  {#if totalItems}
    <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
  {/if}
</Container>

<style lang="postcss">
  .calendar-button {
    @apply size-24 flex justify-center items-center rounded-2 hover:bg-white/40 shadow-sm shadow-black/30;
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
