<script>
  import { page } from "$app/stores";
  import { format } from "date-fns";
  const todayDate = format(new Date(), "yyyy-MM-dd");
  let totalMemories = 3653;
</script>

<nav class="w-[402px] h-[42px] flex">
  <div
    class="flex h-36 w-12 flex-col items-center justify-between rounded-3 bg-black/60 shadow-md shadow-black/30 backdrop-blur-md"
  >
    <div class="flex flex-col justify-center text-center">
      <span class="text-9 leading-10 text-white"> 13 </span>
      <span class="text-9 leading-10 text-white"> 12 </span>
    </div>
    <span
      class="px-2 -translate-y-3 -rotate-90 rounded-3 bg-white/15 text-center text-8 leading-10 text-white"
    >
      {format(todayDate, "eeeeee")}
    </span>
  </div>
  <a
    href="/vocab"
    class:active={$page.url.pathname === "/vocab"}
    class="btn-nav">Danger is sweet.Dulce periculum.</a
  >
  <a
    href="/schedule"
    class:active={$page.url.pathname === "/schedule"}
    class="btn-nav">Pecunia non olet.Money does not stink.</a
  >
  <a href="/login" class="btn-nav">Memento mori.Rem'ber you will die.</a>
  <div
    class="ml-3 flex h-36 flex-col items-center justify-center rounded-3 bg-black/60 px-1 text-white shadow-sm shadow-black/30 backdrop-blur-md"
  >
    <span class="font-tupa text-18 font-600 leading-15">
      {Math.floor(totalMemories / 100) < 10
        ? "0" + Math.floor(totalMemories / 100)
        : Math.floor(totalMemories / 100)}
    </span>
    <span class="font-tupa text-18 font-600 leading-18">
      {totalMemories % 100 < 10
        ? "0" + (totalMemories % 100)
        : totalMemories % 100}
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

  <div></div>
</nav>

<style>
  .btn-nav {
    @apply ml-3 flex h-36 flex-1 items-center justify-center overflow-hidden rounded-3 text-center text-8 font-400 leading-8 text-white shadow-sm shadow-black/30 backdrop-blur-md transition hover:bg-black/20;
  }
  .btn-nav.active {
    @apply bg-black/20;
  }

  .btn-weather {
    @apply relative ml-3 block h-36 min-w-[90px] overflow-hidden rounded-3 shadow-sm shadow-black/30 bg-[url(src/lib/assets/openmeteo/weather/partly-cloudy.webp)] bg-cover;
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
