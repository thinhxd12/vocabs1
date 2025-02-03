<script lang="ts">
  import { format } from "date-fns";
  import { Calendar, Pagination } from "bits-ui";
  import Icon from "@iconify/svelte";

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
</script>

<audio {src} bind:paused></audio>

<main
  class="w-content h-[calc(100vh-42px)] no-scrollbar overflow-y-scroll flex flex-col justify-start items-center gap-6"
>
  <div
    class="w-full h-[360px] mt-6 layout-white flex items-end justify-end relative bg-cover bg-left-bottom"
    style="background-image: url('/images/{format(new Date(), 'M')}.webp');"
  >
    <Calendar.Root
      class="bg-white/45 backdrop-blur-[3px] w-full"
      let:months
      let:weekdays
      {isDateUnavailable}
      weekdayFormat="short"
    >
      <Calendar.Header class="flex items-center justify-between p-3">
        <Calendar.PrevButton
          class="hover:bg-black/20 rounded-3 w-24 h-24 flex items-center justify-center mr-[48px]"
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
        <div class="flex justify-center items-center">
          <button
            class="hover:bg-black/20 rounded-3 w-24 h-24 flex items-center justify-center"
          >
            <Icon
              icon="ri:reset-right-line"
              width="14"
              height="14"
              class="text-[#363636]"
            />
          </button>
          <button
            class="hover:bg-black/20 rounded-3 w-24 h-24 flex items-center justify-center"
          >
            <Icon
              icon="ri:calendar-2-line"
              width="14"
              height="14"
              class="text-[#363636]"
            />
          </button>
          <Calendar.NextButton
            class="hover:bg-black/20 rounded-3 w-24 h-24 flex items-center justify-center"
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

      <div class="flex flex-col p-3 sm:flex-row sm:space-x-4 sm:space-y-0">
        {#each months as month, i (i)}
          <Calendar.Grid class="w-full border-collapse select-none space-y-1">
            <Calendar.GridHead>
              <Calendar.GridRow class="mb-3 flex w-full justify-between">
                {#each weekdays as day, i}
                  <Calendar.HeadCell
                    class="group w-[50px] h-20 bg-black/20 flex items-center justify-center"
                    data-week-start={i == 0}
                  >
                    <div
                      class="font-rubik leading-20 text-12 uppercase h-full w-full text-center text-[#363636] font-500 group-data-[week-start=true]:text-[#ff3333]"
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
                      class="w-[50px] h-20  flex items-center justify-center"
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
                          class="absolute bottom-0 left-1/2 -translate-x-6 w-12 h-2 rounded-full group-data-[today]:block hidden {i !==
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

  <Pagination.Root count={100} perPage={1} let:pages let:range>
    <p class="text-center text-[13px] text-muted-foreground">
      Showing {range.start} - {range.end}
    </p>

    <div class="my-8 flex items-center">
      <Pagination.PrevButton
        class="mr-[25px] inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent hover:bg-dark-10 active:scale-98 disabled:cursor-not-allowed disabled:text-muted-foreground hover:disabled:bg-transparent"
      >
        <Icon
          icon="flowbite:angle-left-outline"
          width="18"
          height="18"
          class="text-[#363636]"
        />
      </Pagination.PrevButton>
      <div class="flex items-center gap-6">
        {#each pages as page (page.key)}
          {#if page.type === "ellipsis"}
            <div class="text-[15px] font-medium text-foreground-alt">...</div>
          {:else}
            <Pagination.Page
              {page}
              class="inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent text-[15px] font-medium hover:bg-dark-10 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-transparent data-[selected]:bg-foreground data-[selected]:text-background"
            >
              {page.value}
            </Pagination.Page>
          {/if}
        {/each}
      </div>
      <Pagination.NextButton
        class="ml-[29px] inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent hover:bg-dark-10 active:scale-98 disabled:cursor-not-allowed disabled:text-muted-foreground hover:disabled:bg-transparent"
      >
        <Icon
          icon="flowbite:angle-right-outline"
          width="18"
          height="18"
          class="text-[#363636]"
        />
      </Pagination.NextButton>
    </div>
  </Pagination.Root>
</main>
