<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { format } from "date-fns";
  import type { DBSelect } from "$lib/types";

  type DayType = {
    date: string;
    time: number;
    enabled: boolean;
  };

  let year = $state<number>(new Date().getFullYear());
  let maxValue = $state<number>(1);

  let days = $state<DayType[]>([]);
  let tooltip = $state<string>("");
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

  const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);

  function setTooltipContent(time: number, date: string) {
    tooltip = `Focus ${secondsToMinutes(time)} hours ${
      time % 60
    } minutes on ${format(date, "MMMM do")}.`;
  }

  onMount(() => {
    getAllDays();
    getMaxValue();
  });
</script>

<div class="w-full h-full relative flex justify-between p-3">
  <input
    name="heatmapyear"
    type="number"
    bind:value={year}
    min="2025"
    class="hidden-cursor select-none h-24 w-60 text-13 leading-24 outline-none bg-[#efefef] rounded-2 indent-6"
    onchange={() => getAllDays()}
  />

  <div class="flex">
    <div class="calendarMonth">
      {#each monthNames as month}
        <div class="text-12 font-400 leading-10">{month.slice(0, 3)}</div>
      {/each}
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="calendarDate" onmouseleave={() => (tooltip = "")}>
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
            onmouseover={() => setTooltipContent(day.time, day.date)}
          ></div>
        {:else}
          <div class="none-day"></div>
        {/if}
      {/each}
    </div>
  </div>

  <div class="flex flex-col items-end gap-3 w-200">
    <div class="flex items-center justify-center gap-2">
      <div class="text-12 leading-14 mr-3">Less</div>
      {#each { length: 11 } as item, index}
        <div class="day" data-level={index}></div>
      {/each}
      <div class="text-12 leading-14 ml-3">More</div>
    </div>

    <p class="text-12 leading-14 text-wrap pl-12">{tooltip}</p>
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
    margin-bottom: 3px;
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
    background-color: #eff2f5;
    border: 0.5px solid #1f23280d;
    border-radius: 2px;
  }

  .day[data-level="0"] {
    background-color: #eff2f5;
  }

  .day[data-level="1"] {
    @apply bg-green-100;
  }

  .day[data-level="2"] {
    @apply bg-green-200;
  }

  .day[data-level="3"] {
    @apply bg-green-300;
  }

  .day[data-level="4"] {
    @apply bg-green-400;
  }

  .day[data-level="5"] {
    @apply bg-green-500;
  }

  .day[data-level="6"] {
    @apply bg-green-600;
  }

  .day[data-level="7"] {
    @apply bg-green-700;
  }

  .day[data-level="8"] {
    @apply bg-green-800;
  }

  .day[data-level="9"] {
    @apply bg-green-900;
  }

  .day[data-level="10"] {
    @apply bg-green-950;
  }

  .hidden-cursor {
    caret-color: transparent;
  }
</style>
