<script lang="ts">
  import { localCalendarStore } from "$lib/store/localstore";
  import type { CalendarDayType } from "$lib/types";
  import { format } from "date-fns";
  import { untrack } from "svelte";
  import MingcuteUpLine from "~icons/mingcute/up-line";
  import MingcuteDownLine from "~icons/mingcute/down-line";

  type DayType = {
    enabled: boolean;
    date: number;
    month: number;
    year: number;
    count: number | undefined;
  };

  interface Props {
    schedule: CalendarDayType[];
  }

  let { schedule }: Props = $props();
  let days = $state<DayType[]>([]);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let now = new Date();
  let year = $state<number>(now.getFullYear());
  let month = $state<number>(now.getMonth());

  function initMonth() {
    days = [];
    //	find the last Monday of the previous month
    var firstDay = new Date(year, month, 1).getDay();
    var daysInThisMonth = new Date(year, month + 1, 0).getDate();
    var daysInLastMonth = new Date(year, month, 0).getDate();
    var prevMonth = month == 0 ? 11 : month - 1;

    //	show the days before the start of this month (disabled) - always less than 7
    for (let i = daysInLastMonth - firstDay; i < daysInLastMonth; i++) {
      days.push({
        date: i + 1,
        month: prevMonth,
        year: prevMonth == 11 ? year - 1 : year,
        enabled: false,
        count: undefined,
      });
    }
    //	show the days in this month (enabled) - always 28 - 31
    for (let i = 0; i < daysInThisMonth; i++) {
      days.push({
        date: i + 1,
        month: month,
        year: year,
        enabled: true,
        count: undefined,
      });
    }
    //	show any days to fill up the last row (disabled) - always less than 7
    for (let i = 0; days.length % 7; i++) {
      days.push({
        date: i + 1,
        month: (month + 1) % 12,
        year: month == 11 ? year + 1 : year,
        enabled: false,
        count: undefined,
      });
    }

    days = days.map((obj1) => {
      const obj2 = schedule.find(
        (obj) =>
          obj.date === obj1.date &&
          obj.month === obj1.month &&
          obj.year === obj1.year,
      );
      return { ...obj1, ...obj2 };
    });
  }

  $effect(() => {
    const v = schedule;
    untrack(async () => {
      initMonth();
    });
  });

  function next() {
    month++;
    if (month == 12) {
      year++;
      month = 0;
    }
    initMonth();
  }
  function prev() {
    if (month == 0) {
      month = 11;
      year--;
    } else {
      month--;
    }
    initMonth();
  }
</script>

<div class="w-full">
  <div class="relative w-full golden">
    <img
      src="/images/{month + 1}.webp"
      alt="calendar-bg"
      class="w-full h-full object-cover brightness-95"
    />
  </div>

  <div class="calendar">
    <div class="flex justify-between items-center px-6 pt-9 mb-3">
      <div class="flex items-center gap-6 select-none">
        <h3 class="font-rubik text-54 leading-50 text-white/60">
          {now.getDate()}
        </h3>
        <div class="flex flex-col">
          <div class="font-rubik text-18 leading-16 text-white/60">
            {format(now, "EEEE")}
          </div>
          <div class="flex items-center text-white/60">
            <span class="font-rubik text-12 leading-24 min-w-90">
              {monthNames[month]}
              {year}</span
            >
            <span class="flex items-center">
              <button
                onclick={prev}
                class="size-24 flex items-center justify-center"
              >
                <MingcuteUpLine width="16" height="16" />
              </button>

              <button
                onclick={next}
                class="size-24 flex items-center justify-center"
              >
                <MingcuteDownLine width="16" height="16" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <div class="font-rubik text-8 leading-10 font-300 text-white/60 pb-6">
        {#if $localCalendarStore}
          {#each $localCalendarStore as item}
            <p class="flex gap-6">
              <span>{format(new Date(item.date), "yyyy-MM-dd")}</span>
              <span>{item.count}</span>
            </p>
          {/each}
        {/if}
      </div>
    </div>

    <div class="w-full">
      <div
        class="mb-6 grid w-full grid-cols-7 justify-items-center border-b border-t border-white/15"
      >
        {#each dayNames as date}
          <span
            class="w-50 h-27 text-secondary-white text-center font-rubik leading-24 pt-3 select-none text-13 font-400 first-of-type:text-[#ff3333]"
          >
            {date}
          </span>
        {/each}
      </div>

      <div class="calendarDate no-scrollbar">
        {#each days as day}
          <div
            class="day {day.enabled
              ? 'opacity-100'
              : 'opacity-30'} text-secondary-white w-50 h-full flex justify-center items-center relative font-rubik leading-20 text-12 select-none"
          >
            {day.date}
            {#if day.count}
              <span
                class="schedule absolute right-6 top-0 text-8 font-rubik font-600 leading-8"
              >
                {day.count}
              </span>
            {/if}
            {#if day.date == now.getDate() && day.month == now.getMonth() && day.year == now.getFullYear()}
              <span
                class="today absolute bottom-3 left-1/2 -translate-x-1/2 w-18 h-2 rounded-full bg-[#38e07b]"
              ></span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .calendar {
    background-color: rgba(17, 25, 40, 0.74);
    backdrop-filter: blur(18px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.125);
  }

  .calendarDate {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(7, minmax(50px, 1fr));
    grid-auto-rows: 24px;
    overflow: auto;
    align-items: center;
    justify-items: center;
    padding-bottom: 6px;
  }

  .day:nth-of-type(7n + 1) {
    color: #ff3333;
  }

  .day:nth-of-type(7n + 1) .today {
    background-color: #ff3333;
  }

  .day:nth-of-type(7n + 1) .schedule {
    color: #ff3333;
  }
</style>
