<script lang="ts">
  import { untrack } from "svelte";
  import { page } from "$app/state";
  import { format } from "date-fns";
  import type { DBSelect } from "$lib/types";

  interface Props {
    year: number;
  }

  type DayType = {
    date: string;
    time: number;
    enabled: boolean;
  };

  let { year }: Props = $props();

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
    for (let i = lastDay; i < 7; i++) {
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
    const hours = time / 60;
    return hours >= 4
      ? 4
      : hours >= 3
        ? 3
        : hours >= 2
          ? 2
          : hours >= 1
            ? 1
            : 0;
  }

  const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);

  function setTooltipContent(time: number, date: string) {
    tooltip = `Focus ${secondsToMinutes(time)} hours ${
      time % 60
    } minutes on ${format(date, "MMMM do")}.`;
  }

  $effect(() => {
    const v = year;
    untrack(() => {
      getAllDays();
    });
  });
</script>

<div class="w-full h-full relative flex gap-24">
  <div class="calendarMonth">
    {#each monthNames as month}
      <div class="text-12 font-400 leading-10">{month.slice(0, 3)}</div>
    {/each}
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="calendarDate no-scrollbar overflow-visible"
    onmouseleave={() => (tooltip = "")}
  >
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

  <div class="flex flex-col items-start max-w-[150px] gap-6">
    <div class="flex items-center justify-center gap-2">
      <div class="text-12 leading-14 mr-3">Less</div>
      <div class="day" data-level="0"></div>
      <div class="day" data-level="1"></div>
      <div class="day" data-level="2"></div>
      <div class="day" data-level="3"></div>
      <div class="day" data-level="4"></div>
      <div class="text-12 leading-14 ml-3">More</div>
    </div>

    <p class="text-12 leading-14">{tooltip}</p>
  </div>
</div>

<style lang="postcss">
  .calendarDate {
    display: grid;
    grid-template-columns: repeat(7, minmax(10px, 1fr));
    gap: 1.5px;
    overflow: auto;
    align-items: center;
    justify-items: center;
  }

  .calendarMonth {
    height: 100%;
    margin-right: -18px;
    display: grid;
    grid-template-rows: repeat(12, 1fr);
  }
  .none-day {
    width: 10px;
    height: 10px;
  }

  .day {
    width: 10px;
    height: 10px;
    fill: #eff2f5;
    shape-rendering: geometricPrecision;
    background-color: #eff2f5;
    border: 0.5px solid #1f23280d;
    border-radius: 2px;
  }

  .day[data-level="0"] {
    fill: #eff2f5;
    background-color: #eff2f5;
  }

  .day[data-level="1"] {
    fill: #aceebb;
    background-color: #aceebb;
  }

  .day[data-level="2"] {
    fill: #4ac26b;
    background-color: #4ac26b;
  }

  .day[data-level="3"] {
    fill: #2da44e;
    background-color: #2da44e;
  }

  .day[data-level="4"] {
    fill: #116329;
    background-color: #116329;
  }
</style>
