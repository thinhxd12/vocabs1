<script lang="ts">
  import { format } from "date-fns";
  import { Calendar, Pagination } from "bits-ui";
  import Icon from "@iconify/svelte";
  import type { SelectProgress } from "$lib/db/schema.js";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { todaySchedule } from "$lib/store/navstore.js";

  let src = $state<string>("");
  let paused = $state<boolean>(true);

  let { data } = $props();

  type ScheduleCalendar = { date: number; month: number; count: number };
  const isDateUnavailable: Calendar.Props["isDateUnavailable"] = (date) => {
    const exists = data.schedule.some(
      (obj: ScheduleCalendar) =>
        obj.date === date.day && obj.month === date.month - 1
    );
    return exists;
  };

  let progressItems = $state<SelectProgress[]>(data.progress);

  async function getProgressByIndex(index: number) {
    const response = await fetch(`/server/getprogress?index=${index}`);
    progressItems = await response.json();
  }

  let showReset = $state<boolean>(false);
  let showCreate = $state<boolean>(false);
</script>

<svelte:head>
  <title>📆</title>
  <meta name="Schedule" content="Some Schedule" />
</svelte:head>

<audio {src} bind:paused></audio>
<main
  class="w-content h-[calc(100vh-42px)] no-scrollbar overflow-y-scroll flex flex-col justify-start items-center gap-6"
>
  <div
    class="relative w-full h-[360px] mt-6 layout-white flex items-end justify-end bg-cover bg-left-bottom"
    style="background-image: url('/images/{format(new Date(), 'M')}.webp');"
  >
    <div
      class="absolute left-2 top-2 cursor-default px-3 py-1 bg-black/30 shadow-xl shadow-black/30 backdrop-blur-xl"
    >
      {#each data.diary as item}
        <p class="text-7 font-400 leading-10 text-white">
          {format(new Date(item.date), "yyyy-MM-dd")}
          {item.count}
        </p>
      {/each}
    </div>
    <Calendar.Root
      class="bg-white/45 backdrop-blur-[3px] w-full"
      let:months
      let:weekdays
      {isDateUnavailable}
      weekdayFormat="short"
    >
      <Calendar.Header class="flex items-center justify-between p-3">
        <Calendar.PrevButton
          class="hover:bg-black/20 rounded-3 size-24 flex items-center justify-center mr-[48px]"
        >
          <Icon
            icon="flowbite:angle-left-outline"
            width="16"
            height="16"
            class="text-[#363636]"
          />
        </Calendar.PrevButton>
        <Calendar.Heading
          class="text-18  leading-12 mt-4 uppercase font-rubik font-400 text-[#363636] select-none"
        />
        <div class="flex justify-center items-center relative">
          {#if showReset}
            <div
              class="absolute -top-[66px] right-1 layout-white !bg-white"
              transition:fly={{ y: 15, duration: 50 }}
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
                        toast.error(result.data?.error as string);
                      } else {
                        toast.success("Update successfully");
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
                    class="text-12 font-rubik leading-22 pt-3 h-24 pl-6 max-w-[90px] rounded-3 bg-transparent text-center border border-black/15 focus:border-black/30 outline-none"
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
                    class="text-12 font-rubik leading-22 pt-3 h-24 pl-6 max-w-[90px] rounded-3 bg-transparent text-center border border-black/15 focus:border-black/30 outline-none"
                  />
                  <input
                    hidden
                    name="id1"
                    autocomplete="off"
                    value={$todaySchedule.end.id}
                  />
                  <button
                    type="submit"
                    class="size-24 hover:bg-black/20 flex justify-center items-center rounded-3"
                  >
                    <Icon icon="ri:link" width="16" height="16" />
                  </button>
                </form>
              {/if}
            </div>
          {/if}

          {#if showCreate}
            <div
              class="absolute -top-[58px] right-1 layout-white !bg-white min-w-[180px]"
              transition:fly={{ y: 15, duration: 50 }}
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
                class="w-full flex items-center justify-center gap-30 p-4"
                use:enhance={({ formElement, formData, action, cancel }) => {
                  return async ({ result }) => {
                    if (result.type === "failure") {
                      toast.error(result.data?.error as string);
                    } else {
                      toast.success("Create successfully");
                      location.reload();
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
          <button
            class="hover:bg-black/20 {showReset
              ? 'bg-black/20'
              : ''} text-[#363636] rounded-3 size-24 flex items-center justify-center"
            onclick={() => (showReset = !showReset)}
          >
            <Icon icon="ri:reset-right-line" width="14" height="14" />
          </button>
          <button
            class="hover:bg-black/20 {showCreate
              ? 'bg-black/20'
              : ''} text-[#363636] rounded-3 size-24 flex items-center justify-center"
            onclick={() => (showCreate = !showCreate)}
          >
            <Icon icon="ri:calendar-2-line" width="14" height="14" />
          </button>
          <Calendar.NextButton
            class="hover:bg-black/20 rounded-3 size-24 flex items-center justify-center"
          >
            <Icon
              icon="flowbite:angle-right-outline"
              width="16"
              height="16"
              class="text-[#363636]"
            />
          </Calendar.NextButton>
        </div>
      </Calendar.Header>

      <div class="flex flex-col p-3">
        {#each months as month, i (i)}
          <Calendar.Grid class="w-full border-collapse select-none">
            <Calendar.GridHead>
              <Calendar.GridRow class="mb-3 flex w-full justify-between">
                {#each weekdays as day, i}
                  <Calendar.HeadCell
                    class="group w-[50px] h-20 bg-black/20 flex items-center justify-center"
                  >
                    <div
                      class="font-rubik leading-20 text-12 uppercase h-full w-full text-center font-500 {i ==
                      0
                        ? 'text-[#ff3333]'
                        : 'text-[#363636]'}"
                    >
                      {day.slice(0, 3)}
                    </div>
                  </Calendar.HeadCell>
                {/each}
              </Calendar.GridRow>
            </Calendar.GridHead>
            <Calendar.GridBody>
              {#each month.weeks as weekDates}
                <Calendar.GridRow class="flex w-full justify-between">
                  {#each weekDates as date, i}
                    <Calendar.Cell
                      {date}
                      class="w-[50px] h-20 flex items-center justify-center"
                    >
                      <Calendar.Day
                        {date}
                        month={month.value}
                        class="group relative font-rubik leading-18 text-12 w-full h-full text-center {i !==
                        0
                          ? 'text-black/70'
                          : 'text-[#ff3333]'} font-400 data-[disabled]:pointer-events-none data-[disabled]:opacity-40 "
                      >
                        <div
                          class="absolute bottom-2 left-1/2 -translate-x-6 w-12 h-2 rounded-full group-data-[today]:block hidden {i !==
                          0
                            ? 'bg-[#38e07b]'
                            : 'bg-[#ff3333]'}"
                        ></div>
                        {date.day}
                        <div
                          class="group-data-[unavailable]:block hidden absolute right-6 top-0 text-8 font-rubik font-600 leading-8 {i !==
                          0
                            ? 'text-black/50'
                            : 'text-[#ff3333]'}"
                        >
                          {data.schedule.find(
                            (obj: ScheduleCalendar) =>
                              obj.date === date.day &&
                              obj.month === date.month - 1
                          )?.count}
                        </div>
                      </Calendar.Day>
                    </Calendar.Cell>
                  {/each}
                </Calendar.GridRow>
              {/each}
            </Calendar.GridBody>
          </Calendar.Grid>
        {/each}
      </div>
    </Calendar.Root>
  </div>

  <div
    class="layout-white relative overflow-hidden !bg-green-400/15 p-6 select-none"
  >
    <p class="font-garamond text-12 font-500 leading-14">
      The tree that is supposed to grow to a proud height can dispense with bad
      weather and storms. Whether misfortune and external resistance, some kinds
      of hatred, jealousy, stubbornness, mistrust, hardness, avarice, and
      violence do not belong among the favorable conditions without which any
      great growth. The poison of which weaker natures perish strengthens the
      strong — nor do they call it poison.
    </p>
  </div>

  <Pagination.Root
    count={data.progressLength}
    onPageChange={(page) => getProgressByIndex(data.progressLength - page)}
    perPage={1}
    let:pages
  >
    <div class="w-full flex flex-col items-center min-h-[135px]">
      {#if progressItems.length}
        {#each progressItems as item}
          <div
            class="w-content font-rubik text-12 leading-24 h-24 flex items-center layout-white mb-3 select-none"
          >
            <div
              class="bg-black/30 min-w-[120px] text-center text-secondary-white"
            >
              {item.index + 1} - {item.index + 200}
            </div>
            <div class="flex-1 text-center">
              {format(new Date(item.start_date), "yyyy-MM-dd")}
            </div>
            <div class="flex-1 text-center">
              {format(new Date(item.end_date), "yyyy-MM-dd")}
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="my-3 flex items-center justify-between mx-auto w-2/3">
      <Pagination.PrevButton
        class="hover:bg-black/10 text-[#363636] cursor-pointer rounded-3 size-24 flex items-center justify-center disabled:cursor-not-allowed disabled:text-[#636363] hover:disabled:bg-transparent"
      >
        <Icon icon="flowbite:angle-left-outline" width="18" height="18" />
      </Pagination.PrevButton>
      <div class="flex items-center gap-6">
        {#each pages as page (page.key)}
          {#if page.type === "ellipsis"}
            <div class="text-15 font-500">...</div>
          {:else}
            <Pagination.Page
              {page}
              class="size-24 font-rubik text-12 leading-22 flex items-center justify-center hover:bg-black/10 rounded-3 data-[selected]:bg-black/30 data-[selected]:text-secondary-white"
            >
              {page.value}
            </Pagination.Page>
          {/if}
        {/each}
      </div>
      <Pagination.NextButton
        class="hover:bg-black/10 text-[#363636] cursor-pointer rounded-3 size-24 flex items-center justify-center disabled:cursor-not-allowed disabled:text-[#636363] hover:disabled:bg-transparent"
      >
        <Icon icon="flowbite:angle-right-outline" width="18" height="18" />
      </Pagination.NextButton>
    </div>
  </Pagination.Root>
</main>
