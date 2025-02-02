<script lang="ts">
  import { format } from "date-fns";

  let src = $state<string>("");
  let paused = $state<boolean>(true);

  import { Calendar } from "bits-ui";

  const isDateUnavailable: Calendar.Props["isDateUnavailable"] = (date) => {
    return date.day === 17 || date.day === 18;
  };
</script>

<audio {src} bind:paused></audio>

<main
  class="w-content h-[calc(100vh-42px)] no-scrollbar overflow-y-scroll flex flex-col justify-start items-center gap-6"
>
  <div
    class="w-full p-6 h-[378px] bg-cover mt-6 rounded-6 layout-white flex items-end justify-end"
    style="background-image: url('/images/{format(new Date(), 'M')}.webp');"
  >
    <Calendar.Root
      class="w-[280px] rounded-6"
      let:months
      let:weekdays
      {isDateUnavailable}
      weekdayFormat="long"
      fixedWeeks={true}
    >
      <Calendar.Header class="flex items-center justify-between">
        <Calendar.PrevButton
          class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt hover:bg-muted active:scale-98 active:transition-all"
        >
          left
        </Calendar.PrevButton>
        <Calendar.Heading class="text-[15px] font-medium" />
        <Calendar.NextButton
          class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt hover:bg-muted active:scale-98 active:transition-all"
        >
          right
        </Calendar.NextButton>
      </Calendar.Header>
      <div
        class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
      >
        {#each months as month, i (i)}
          <Calendar.Grid class="w-full border-collapse select-none space-y-1">
            <Calendar.GridHead>
              <Calendar.GridRow class="mb-3 flex w-full justify-between">
                {#each weekdays as day}
                  <Calendar.HeadCell
                    class="w-[40px] h-24 text-center font-rubik text-12 font-400 uppercase text-white"
                  >
                    <div>{day.slice(0, 3)}</div>
                  </Calendar.HeadCell>
                {/each}
              </Calendar.GridRow>
            </Calendar.GridHead>
            <Calendar.GridBody>
              {#each month.weeks as weekDates}
                <Calendar.GridRow class="flex w-full">
                  {#each weekDates as date}
                    <Calendar.Cell
                      {date}
                      class="w-[40px] h-24 text-center font-rubik text-12 font-400 text-white"
                    >
                      <Calendar.Day
                        {date}
                        month={month.value}
                        class="group relative inline-flex size-10 items-center justify-center whitespace-nowrap rounded-9px border border-transparent bg-transparent p-0 text-sm font-normal text-foreground hover:border-foreground data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[selected]:bg-foreground data-[selected]:font-medium data-[disabled]:text-foreground/30 data-[selected]:text-background data-[unavailable]:text-muted-foreground data-[unavailable]:line-through"
                      >
                        <div
                          class="absolute top-[5px] hidden size-1 rounded-full bg-foreground group-data-[today]:block group-data-[selected]:bg-background"
                        ></div>
                        {date.day}
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
</main>
