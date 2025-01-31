<script lang="ts">
  import { page } from "$app/state";
  import {
    currentSchedule,
    isAutoPlay,
    listContent,
    listCount,
    todaySchedule,
    totalMemories,
  } from "$lib/store/navstore";
  import { renderWord } from "$lib/store/vocabstore";
  import { format } from "date-fns";

  const todayDate = format(new Date(), "yyyy-MM-dd");
  // -------------------AUTOPLAY START-------------------- //

  let intervalAutoplay: ReturnType<typeof setInterval>;

  const handleRenderWord = async () => {
    $renderWord = $listContent[$listCount];
    $listCount += 1;
    if ($renderWord.number > 1) {
      await fetch(`/server/checkword?id=${$renderWord.id}`);
    } else {
      $totalMemories += 1;
      await fetch(
        `/server/archiveword?word=${$renderWord.word}&id=${$renderWord.id}`
      );
    }
  };

  const startAutoplay = async () => {
    clearInterval(intervalAutoplay);
    handleRenderWord();
    intervalAutoplay = setInterval(() => {
      if ($listCount < $listContent.length) {
        handleRenderWord();
      } else {
        endAutoplay();
      }
    }, 7000);
  };

  const pauseAutoplay = () => {
    clearInterval(intervalAutoplay);
  };

  const endAutoplay = async () => {
    clearInterval(intervalAutoplay);
    $listCount = 0;
    $renderWord = undefined;
    await updateTodayScheduleLocal();
    // if ($currentSchedule && $currentSchedule.count < 9) {
    //   startCountdown();
    // }
  };

  const handleAutoplay = () => {
    if (page.url.pathname === "/vocab" && $listContent.length > 0) {
      if ($isAutoPlay) {
        $isAutoPlay = false;
        startAutoplay();
      } else {
        $isAutoPlay = true;
        pauseAutoplay();
      }
    }
  };

  const updateTodayScheduleLocal = async () => {
    if (!$currentSchedule || !$todaySchedule) return;
    const response = await fetch(
      `/server/updateschedule?id=${$currentSchedule.id}&date=${todayDate}`
    );
    const data = await response.json();
    $currentSchedule = data;
    if ($todaySchedule.start.id === $currentSchedule!.id) {
      $todaySchedule.start = data;
    } else $todaySchedule.end = data;
  };

  // -------------------AUTOPLAY END-------------------- //
</script>

<nav class="w-content h-[42px] flex">
  <div
    class="flex h-36 w-12 flex-col items-center justify-between rounded-3 bg-black/60 shadow-md shadow-black/45 backdrop-blur-md"
  >
    <div class="flex flex-col justify-center text-center">
      {#if $todaySchedule}
        <span class="text-9 leading-10 text-white">
          {$todaySchedule.start.count}
        </span>
        <span class="text-9 leading-10 text-white">
          {$todaySchedule.end.count}
        </span>
      {:else}
        <span class="text-9 leading-10 text-white"> N </span>
        <span class="text-9 leading-10 text-white"> N </span>
      {/if}
    </div>
    <span
      class="px-2 -translate-y-3 -rotate-90 rounded-3 bg-white/15 text-center text-8 leading-10 text-white"
    >
      {format(todayDate, "eeeeee")}
    </span>
  </div>
  <a href="/vocab" class:active={page.url.pathname === "/vocab"} class="btn-nav"
    >Danger is sweet.Dulce periculum.</a
  >
  <a
    href="/schedule"
    class:active={page.url.pathname === "/schedule"}
    class="btn-nav">Pecunia non olet.Money does not stink.</a
  >
  <a href="/about" class="btn-nav">Memento mori.Rem'ber you will die.</a>
  <div
    class="ml-3 flex h-36 flex-col items-center justify-center rounded-3 bg-black/60 px-1 text-white shadow-sm shadow-black/45 backdrop-blur-md"
  >
    <span class="font-tupa text-18 font-600 leading-15">
      {Math.floor($totalMemories / 100) < 10
        ? "0" + Math.floor($totalMemories / 100)
        : Math.floor($totalMemories / 100)}
    </span>
    <span class="font-tupa text-18 font-600 leading-18">
      {$totalMemories % 100 < 10
        ? "0" + ($totalMemories % 100)
        : $totalMemories % 100}
    </span>
  </div>
  <a href="/vocab" class="btn-weather">
    <img
      src="src/lib/assets/openmeteo/icons/01d.svg"
      alt="Weather Icon"
      width={21}
      height={21}
      class="absolute right-12 top-1 z-10 brightness-90"
      style="filter: drop-shadow(0px 2px 2px #000000)"
    />
    <span
      style="text-shadow: 0px 0px 6px #000000"
      class="absolute right-1 top-1 z-10 text-8 font-600 leading-8 text-white"
    >
      {Math.round(12)}°
    </span>
    <div class="flex absolute bottom-0 left-0 z-10 w-full">
      <div class="marquee-container">
        <div class="marquee-content">Partly Cloudy</div>
      </div>
      <div class="marquee-container">
        <div class="marquee-content">Partly Cloudy</div>
      </div>
    </div>
  </a>

  <button
    class={$isAutoPlay ? "btn-play" : "btn-pause"}
    onclick={handleAutoplay}
  >
    {#if $listCount}
      <div
        class={`absolute left-0 top-0 z-30 h-full bg-[url('src/lib/assets/images/sunrise.webp')] bg-cover transition-all duration-300`}
        style="box-shadow: rgba(0, 0, 0, 0.6) 2px 0px 6px; border-right: 0.5px solid rgb(0, 0, 0); background-size: 90px 36px; width: {Math.floor(
          (($listCount + 1) / $listContent.length) * 90
        )}px;"
      ></div>
    {/if}
  </button>
</nav>

<style>
  .btn-nav {
    @apply ml-3 flex h-36 flex-1 items-center justify-center overflow-hidden rounded-3 text-center text-8 font-400 leading-8 text-white shadow-sm shadow-black/45 backdrop-blur-md transition hover:bg-black/20;
  }
  .btn-nav.active {
    @apply bg-black/20;
  }

  .btn-weather {
    @apply relative ml-3 block h-36 min-w-[90px] overflow-hidden rounded-3 shadow-sm shadow-black/45 bg-[url(src/lib/assets/openmeteo/weather/partly-cloudy.webp)] bg-cover;
  }

  .btn-play {
    @apply cursor-pointer relative ml-3 block h-36 min-w-[90px] overflow-hidden rounded-3 shadow-sm shadow-black/45 bg-[url(src/lib/assets/images/sunrise.webp)] bg-cover;
  }

  .btn-pause {
    @apply cursor-pointer relative ml-3 block h-36 min-w-[90px] overflow-hidden rounded-3 shadow-sm shadow-black/45 bg-[url(src/lib/assets/images/sunset.webp)] bg-cover;
  }

  .marquee-container {
    display: flex;
    animation: marquee 9s linear infinite;
  }

  .marquee-content {
    @apply min-w-[72px] text-nowrap px-9 text-8 font-600 leading-9 text-white;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
</style>
