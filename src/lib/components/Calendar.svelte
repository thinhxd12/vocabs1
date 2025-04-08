<script lang="ts">
  import type { CalendarDayType } from "$lib/types";
  import Icon from "@iconify/svelte";
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
          obj.year === obj1.year
      );
      return { ...obj1, ...obj2 };
    });
  }

  initMonth();

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

<div class="layout-white">
  <img
    src="/images/{month + 1}.webp"
    alt="calendar-bg"
    class="w-full h-[210px] object-cover"
  />
  <div class="calendar-header flex items-center justify-between">
    <button onclick={prev} class="size-27 flex items-center justify-center">
      <Icon icon="solar:alt-arrow-left-linear" width="15" height="15" />
    </button>
    <h1
      class="font-rubik text-18 select-none leading-18 mt-3 text-black/80 font-400"
    >
      {monthNames[month]}
      {year}
    </h1>
    <button onclick={next} class="size-27 flex items-center justify-center">
      <Icon icon="solar:alt-arrow-right-linear" width="15" height="15" />
    </button>
  </div>

  <div class="calendar no-scrollbar">
    {#each dayNames as date}
      <span
        class="w-[50px] h-20 bg-black/20 text-center font-rubik leading-20 select-none text-12 text-black/80 uppercase font-500 first-of-type:text-[#ff3333]"
      >
        {date}
      </span>
    {/each}
    {#each days as day}
      <div
        class="day {day.enabled
          ? 'opacity-100'
          : 'opacity-45'} w-[50px] h-20 text-center relative font-rubik leading-20 text-12 text-black/70 select-none"
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
            class="today absolute bottom-2 left-1/2 -translate-x-6 w-12 h-2 rounded-full bg-[#38e07b]"
          ></span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .calendar {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(7, minmax(50px, 1fr));
    grid-auto-rows: 20px;
    overflow: auto;
    align-items: center;
    justify-items: center;
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
