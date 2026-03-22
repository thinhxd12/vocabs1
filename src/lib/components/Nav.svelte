<script lang="ts">
  import { page } from "$app/state";
  import {
    handleAutoplay,
    isAutoPlay,
    listContent,
    listCount,
    todaySchedule,
    totalMemories,
    handleGetListContent,
    currentProgress,
  } from "$lib/store/navstore";
  import { goto } from "$app/navigation";
  import { format } from "date-fns";
  import { showTranslate } from "$lib/store/vocabstore";
  import WeatherButton from "./WeatherButton.svelte";
  import TimerButton from "./TimerButton.svelte";
  import WakeLockButton from "./WakeLockButton.svelte";
  import { fly } from "svelte/transition";
  import MaterialSymbolsAdjust from "~icons/material-symbols/adjust";
  import GravityUiFrames from "~icons/gravity-ui/frames";
  import sunrise from "$lib/assets/images/sunrise.webp";
  import BiTranslate from "~icons/bi/translate";
  import BxsBookBookmark from "~icons/bxs/book-bookmark";
  import UilSchedule from "~icons/uil/schedule";
  import MaterialSymbolsFeatureSearchOutline from "~icons/material-symbols/feature-search-outline";
  import HugeiconsQuiz02 from "~icons/hugeicons/quiz-02";
  import MdiLockOpenVariant from "~icons/mdi/lock-open-variant";
  import MaterialSymbolsDashboardRounded from "~icons/material-symbols/dashboard-rounded";
  import SolarSadSquareBold from "~icons/solar/sad-square-bold";
  
  async function handleDailyProgress(num: number) {
    if (num === 1) {
      await goto("/vocab");
    } else if (num === 2) {
      await goto("/quiz");
    }
    $currentProgress = num;
    handleGetListContent();
  }
</script>

<div class="w-main h-full flex items-center gap-2">
  <div class="relative w-12 h-full rounded-2 overflow-hidden flex flex-col">
    {#if $todaySchedule}
      <div
        class="w-full h-14 flex justify-center text-9 leading-12 text-white/90 text-center overflow-hidden pt-2 bg-black/80 backdrop-blur-md"
      >
        {#key $todaySchedule.first.count}
          <span in:fly={{ y: -12, duration: 300 }}>
            {$todaySchedule.first.count}
          </span>
        {/key}
      </div>
      <div
        class="w-full h-14 flex justify-center text-9 leading-12 text-white/90 text-center overflow-hidden bg-black/80 backdrop-blur-md"
      >
        {#key $todaySchedule.second.count}
          <span in:fly={{ y: -12, duration: 300 }}>
            {$todaySchedule.second.count}
          </span>
        {/key}
      </div>
    {:else}
      <span
        class="text-9 leading-14 text-white/90 text-center bg-black/80 backdrop-blur-md"
        >N</span
      >
      <span
        class="text-9 leading-14 text-white/90 text-center bg-black/80 backdrop-blur-md"
        >N</span
      >
    {/if}
    <div
      class="relative w-12 h-14 overflow-hidden bg-white/60 backdrop-blur-md"
    >
      <span
        class="uppercase text-8 font-900 text-black leading-12 text-center absolute w-15 h-full transform -rotate-90 origin-center"
      >
        {format(new Date(), "eeeeee")}
      </span>
    </div>
  </div>

  <div
    class="dark h-full rounded-2 flex-1 flex flex-col justify-center items-center gap-3"
  >
    <div class="w-full flex justify-center items-end gap-2">
      <div
        class="flex justify-between relative w-40 mx-1 outline-none disabled:cursor-not-allowed"
      >
        <div class="progress"></div>
        <div
          class="progress-active"
          style="width: {$currentProgress > 1 ? 8 : 0}px;"
        ></div>
        <button
          class="circle"
          class:active={$currentProgress === 1}
          class:done={$currentProgress > 1}
          onclick={(e) => {
            e.currentTarget.blur();
            handleDailyProgress(1);
          }}
        >
          1
        </button>
        <button
          class="circle"
          class:active={$currentProgress === 2}
          class:done={$currentProgress > 2}
          onclick={(e) => {
            e.currentTarget.blur();
            handleDailyProgress(2);
          }}
        >
          2
        </button>
      </div>

      <a
        href="/dashboard"
        class:active={page.url.pathname === "/dashboard"}
        class="btn-menu"
      >
        <MaterialSymbolsDashboardRounded width="14" height="14" />
      </a>

      <a
        href="/pomodoro"
        class:active={page.url.pathname === "/pomodoro"}
        class="btn-menu"
      >
        <MaterialSymbolsAdjust width="14" height="14" />
      </a>

      <WakeLockButton />

      <TimerButton />
    </div>

    <div class="w-full flex justify-center items-start gap-2">
      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
      >
        <MaterialSymbolsFeatureSearchOutline width="14" height="14" />
      </a>

      <a
        href="/schedule"
        class:active={page.url.pathname === "/schedule"}
        class="btn-nav"
      >
        <UilSchedule width="14" height="14" />
      </a>

      <a
        href="/quiz"
        class="btn-nav"
        class:active={page.url.pathname === "/quiz"}
      >
        <HugeiconsQuiz02 width="14" height="14" />
      </a>

      <button
        class="btn-nav"
        class:active={$showTranslate}
        onclick={async (e) => {
          e.currentTarget.blur();
          await goto("/vocab");
          $showTranslate = true;
        }}
      >
        <BiTranslate width="14" height="14" />
      </button>

      <a
        href="/highlights"
        class="btn-nav"
        class:active={page.url.pathname === "/highlights"}
      >
        <BxsBookBookmark width="14" height="14" />
      </a>

      <a
        href="/art"
        class="btn-nav"
        class:active={page.url.pathname === "/art"}
      >
        <GravityUiFrames width="14" height="14" />
      </a>

      <a
        href="/sad"
        class="btn-nav"
        class:active={page.url.pathname === "/sad"}
      >
        <SolarSadSquareBold width="14" height="14" />
      </a>

      <form method="post" action="/login?/signout">
        <button class="btn-menu" onclick={() => localStorage.clear()}>
          <MdiLockOpenVariant width="14" height="14" />
        </button>
      </form>
    </div>
  </div>

  <div
    class="h-full px-2 rounded-2 overflow-hidden text-white/90 bg-black/80 backdrop-blur-md"
  >
    {#key $totalMemories}
      <div
        class="flex flex-col items-center justify-center"
        in:fly={{ y: -50, duration: 600 }}
      >
        <span class="font-tupa text-18 font-600 leading-21">
          {Math.floor($totalMemories / 100) < 10
            ? "0" + Math.floor($totalMemories / 100)
            : Math.floor($totalMemories / 100)}
        </span>
        <span class="font-tupa text-18 font-600 leading-20">
          {$totalMemories % 100 < 10
            ? "0" + ($totalMemories % 100)
            : $totalMemories % 100}
        </span>
      </div>
    {/key}
  </div>

  <a
    href="/weather"
    class="outline-none relative w-90 h-full rounded-2 overflow-hidden"
  >
    <WeatherButton />
  </a>

  <button
    class="outline-none relative w-90 h-full rounded-2 overflow-hidden"
    disabled={page.url.pathname !== "/vocab"}
    onclick={handleAutoplay}
  >
    {#if $isAutoPlay && page.url.pathname === "/vocab"}
      <img
        src={sunrise}
        alt="btn-play"
        class="absolute top-0 left-0 z-[2] w-90 h-full object-cover object-[-10px]"
        in:fly={{ y: -42, duration: 300 }}
      />
    {/if}

    <img
      src={sunrise}
      alt="btn-pause"
      class="absolute top-0 left-0 z-[1] grayscale w-90 h-full object-cover object-[-10px]"
    />

    {#if ["/vocab", "/quiz"].includes(page.url.pathname)}
      <img
        src={sunrise}
        alt="btn-play"
        class="absolute top-0 left-0 w-0 h-full z-[3] object-cover object-[-10px] transition-all duration-300"
        style="box-shadow: rgba(0, 0, 0, 0.9) 3px 0px 7px; width: {($listCount /
          $listContent.length) *
          90}px;"
      />
    {/if}
  </button>
</div>

<style lang="postcss">
  .btn-menu {
    @apply h-16 min-w-18 flex items-center justify-center rounded-2 overflow-hidden bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-menu.active {
    @apply !bg-green-400/60 text-black;
  }

  .btn-menu.active {
    @apply !bg-green-400/60 text-black;
  }

  .btn-nav {
    @apply h-16 min-w-18 flex items-center justify-center rounded-2 overflow-hidden bg-white/20 hover:bg-white/40 text-black/60 hover:text-black transition duration-100 ring-1 ring-black/5 shadow shadow-black/30;
  }

  .btn-nav.active {
    @apply bg-white/60 text-black;
  }

  .circle {
    @apply flex items-center justify-center size-16 rounded-full border-2 border-white/15 text-9 leading-12 font-500 text-black text-center bg-white/15 shadow shadow-black/30;
    transition: 0.3s ease;
  }

  .circle.active {
    @apply !border-green-400/60;
  }

  .circle.done {
    @apply !bg-green-400/60 !border-green-400/60;
  }

  .progress {
    @apply absolute top-1/2 -translate-y-1/2 left-16 h-2 w-8 -z-1 bg-white/30 shadow shadow-black/30;
  }

  .progress-active {
    @apply absolute top-1/2 -translate-y-1/2 left-16 w-0 h-2 z-1 bg-green-400 shadow shadow-black/30;
    transition: 0.3s ease;
  }
</style>
