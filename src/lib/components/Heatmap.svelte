<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { format } from "date-fns";
  import type { DBSelect } from "$lib/types";
  import CharmMenuHamburger from "~icons/charm/menu-hamburger";

  type DayType = {
    date: string;
    time: number;
    enabled: boolean;
  };

  let year = $state<number>(new Date().getFullYear());
  let maxValue = $state<number>(1);

  let days = $state<DayType[]>([]);
  let dayDetail = $state<DayType>();
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

  async function getAllDays() {
    days = [];
    let date = new Date(year, 0, 1);
    const firstDay = new Date(year, 0, 1).getDay();
    const lastDay = new Date(year, 11, 31).getDay();

    //	fill the days before the start day of year
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: "",
        time: 0,
        enabled: false,
      });
    }

    while (date.getFullYear() === year) {
      days.push({
        date: format(date, "yyyy-MM-dd"),
        time: 0,
        enabled: true,
      });
      date.setDate(date.getDate() + 1);
    }

    //	fill the last days after the end day of year
    for (let i = lastDay + 1; i < 7; i++) {
      days.push({
        date: "",
        time: 0,
        enabled: false,
      });
    }

    const from = year + "-01-01";
    const to = year + 1 + "-01-01";
    const { data, error } = await page.data.supabase
      .from("pomodoro_table")
      .select("*")
      .gte("date", from)
      .lt("date", to);

    if (data) {
      days = days.map((obj1) => {
        const obj2 = data.find(
          (obj: DBSelect["pomodoro_table"]) => obj.date === obj1.date,
        );
        return { ...obj1, ...obj2 };
      });
    }
  }

  function calculateLevel(time: number) {
    return Math.round((time / maxValue) * 10);
  }

  async function getMaxValue() {
    const { data, error } = await page.data.supabase
      .from("pomodoro_table")
      .select("time")
      .order("time", { ascending: false })
      .limit(1);
    if (data) maxValue = data[0].time;
  }

  function formatMinuteToString(time: number) {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    return `${hours} hour${hours <= 1 ? "" : "s"} ${mins} minute${mins <= 1 ? "" : "s"}`;
  }

  onMount(async () => {
    await getMaxValue();
    getAllDays();
  });
</script>

<div class="w-full h-full relative flex justify-between p-3">
  <input
    name="heatmapyear"
    type="number"
    bind:value={year}
    min="2025"
    class="hidden-cursor select-none h-24 w-54 text-13 font-500 leading-24 outline-none bg-[#efefef] rounded-2 indent-6"
    onchange={() => {
      getAllDays();
      dayDetail = undefined;
    }}
  />

  {#if days.length}
    <div class="flex">
      <div class="calendarMonth">
        {#each monthNames as month}
          <div class="text-12 font-400 leading-10">{month.slice(0, 3)}</div>
        {/each}
      </div>

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="calendarDate">
        <div class="calendarDay">
          <span>Sun</span>
          <span>Wed</span>
          <span>Sat</span>
        </div>
        {#each days as day}
          {#if day.enabled}
            <!-- svelte-ignore a11y_mouse_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="day"
              data-level={calculateLevel(day.time)}
              onmouseover={() => (dayDetail = day)}
            ></div>
          {:else}
            <div class="none-day"></div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <div class="flex flex-col items-center w-200 p-6 gap-9">
    {#if dayDetail}
      <div
        class="dayDetail w-150 h-210 relative flex flex-col items-center rounded-3 bg-[#2ecc71] shadow shadow-black/30"
      >
        <CharmMenuHamburger
          width="14"
          class="absolute top-3 left-3 text-white"
        />
        <h4 class="text-25 leading-25 mt-18 text-white">
          {format(dayDetail.date, "MMMM")}
        </h4>
        <h1 class="text-90 leading-80 mb-9 text-white">
          {format(dayDetail.date, "d")}
        </h1>
        <h3 class="text-20 leading-20 text-white mb-9">
          {format(dayDetail.date, "EEEE")}
        </h3>
        <p class="w-full text-left text-white text-14 leading-16 indent-9">
          Focus
        </p>
        <p class="w-full text-left text-white text-12 indent-18">
          {formatMinuteToString(dayDetail.time)}
        </p>
      </div>
    {/if}
    <div class="flex items-center justify-center gap-2">
      <div class="text-12 leading-14 mr-3">Less</div>
      {#each { length: 11 } as item, index}
        <div class="day" data-level={index}></div>
      {/each}
      <div class="text-12 leading-14 ml-3">More</div>
    </div>
  </div>
</div>

<style lang="postcss">
  .calendarDate {
    display: grid;
    grid-template-columns: repeat(7, minmax(10px, 1fr));
    gap: 1.5px;
    overflow: hidden;
    align-items: center;
    justify-items: center;
  }

  .calendarDay {
    grid-column: span 7;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    line-height: 15px;
  }

  .calendarMonth {
    height: calc(100% - 18px);
    margin-right: 6px;
    display: grid;
    grid-template-rows: repeat(12, 1fr);
    margin-top: 18px;
  }

  .none-day {
    width: 10px;
    height: 10px;
  }

  .day {
    width: 10px;
    height: 10px;
    shape-rendering: geometricPrecision;
    border: 1px solid #1f23280d;
    border-radius: 2px;
  }

  .day:hover {
    border: 1px solid #000;
  }

  [data-level="0"] {
    background-color: #eff2f5;
  }

  [data-level="1"] {
    @apply bg-green-100;
  }

  [data-level="2"] {
    @apply bg-green-200;
  }

  [data-level="3"] {
    @apply bg-green-300;
  }

  [data-level="4"] {
    @apply bg-green-400;
  }

  [data-level="5"] {
    @apply bg-green-500;
  }

  [data-level="6"] {
    @apply bg-green-600;
  }

  [data-level="7"] {
    @apply bg-green-700;
  }

  [data-level="8"] {
    @apply bg-green-800;
  }

  [data-level="9"] {
    @apply bg-green-900;
  }

  [data-level="10"] {
    @apply bg-green-950;
  }

  .hidden-cursor {
    caret-color: transparent;
  }
</style>
