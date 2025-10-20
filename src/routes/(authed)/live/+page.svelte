<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { innerWidth } from "svelte/reactivity/window";

  let sports = [
    { text: "Basketball", url: "/sports/basketball" },
    { text: "Football", url: "/sports/football" },
    { text: "American Football", url: "/sports/american-football" },
    { text: "Hockey", url: "/sports/hockey" },
    { text: "Baseball", url: "/sports/baseball" },
    { text: "Motor Sports", url: "/sports/motor-sports" },
    { text: "Fight (UFC, Boxing)", url: "/sports/fight" },
    { text: "Tennis", url: "/sports/tennis" },
    { text: "Rugby", url: "/sports/rugby" },
    { text: "Golf", url: "/sports/golf" },
    { text: "Billiards", url: "/sports/billiards" },
    { text: "AFL", url: "/sports/afl" },
    { text: "Cricket", url: "/sports/cricket" },
    { text: "Darts", url: "/sports/darts" },
    { text: "Other", url: "/sports/other" },
  ];

  type LiveMatch = {
    name: string;
    url: string;
  };

  type LiveSource = {
    source: string;
    streams: LiveMatch[];
  };

  let currentMatch = $state<string>("Live sports");
  let matchesData = $state<LiveMatch[]>([]);
  let mainSource = $state<LiveSource | undefined>(undefined);

  async function getLiveMatches() {
    const response = await fetch(`/server/getlivematches`);
    matchesData = await response.json();
  }

  async function getLiveSource(name: string, url: string) {
    if (!url) return;
    currentMatch = name;
    const response = await fetch(`/server/getlivesource?link=${url}`);
    if (response.status == 200) {
      mainSource = await response.json();
    }
  }

  onMount(() => {
    getLiveMatches();
  });
</script>

<svelte:head>
  <title>{currentMatch}</title>
  <meta name="live" content="Live sports!" />
</svelte:head>

<main
  class="w-screen h-screen bg-[#141414] flex {innerWidth.current &&
  innerWidth.current < 450
    ? 'flex-col justify-between items-center'
    : ''} justify-center no-scrollbar overflow-hidden"
>
  {#if mainSource}
    <iframe
      title="streamIframe"
      id="streamIframe"
      class="aspect-auto w-full"
      src={mainSource.source}
      allowfullscreen
    ></iframe>
  {:else}
    <div class="flex-1 h-full flex justify-center items-center">
      <img src="/gif/whisperoftheheart.gif" alt="loading" width={270} />
    </div>
  {/if}

  <div
    class="flex flex-col {innerWidth.current && innerWidth.current < 450
      ? 'w-content'
      : 'min-w-[340px] w-[340px]'} "
  >
    <div
      class="flex-1 h-[calc(100vh-36px)] no-scrollbar overflow-y-scroll flex-col p-6"
    >
      {#if mainSource}
        <h3 class="px-6 mb-6 text-secondary-white text-14">
          Available Streams
        </h3>
        <div class="flex flex-wrap gap-4 mb-6">
          {#each mainSource.streams as item}
            <button
              class="btn-source"
              class:active={mainSource.source === item.url}
              onclick={() => {
                mainSource!.source = item.url;
              }}
            >
              {item.name}
            </button>
          {/each}
        </div>
      {/if}

      <h3 class="px-6 mb-6 text-secondary-white text-14">
        Live Popular Matches
      </h3>
      <div class="flex flex-wrap gap-4 mb-6">
        {#each matchesData as item}
          <button
            class="btn-source"
            class:active={currentMatch === item.name}
            onclick={() => getLiveSource(item.name, item.url)}
          >
            {item.name}
          </button>
        {/each}
      </div>

      <!-- <h3 class="px-6 mb-6 text-secondary-white text-14">Live Sports</h3>
      <div class="flex flex-wrap gap-4 mb-6">
        {#each sports as item}
          <button class="btn-source">{item.text}</button>
        {/each}
      </div> -->
    </div>

    <div
      class="layout-white h-36 w-full overflow-hidden rounded-1 flex justify-center items-center"
    >
      <a
        href="/vocab"
        class:active={page.url.pathname === "/vocab"}
        class="btn-nav"
      >
        <Icon icon="solar:compass-square-linear" width="15" height="15" />
      </a>

      <a
        href="/schedule"
        class:active={page.url.pathname === "/schedule"}
        class="btn-nav"
      >
        <Icon icon="solar:calendar-linear" width="15" height="15" />
      </a>

      <a
        href="/quiz"
        class="btn-nav"
        class:active={page.url.pathname === "/quiz"}
      >
        <Icon icon="solar:bill-check-linear" width="15" height="15" />
      </a>

      <a
        href="/sad"
        class="btn-nav"
        class:active={page.url.pathname === "/sad"}
      >
        <Icon icon="solar:sad-circle-outline" width="15" height="15" />
      </a>

      <a
        href="/live"
        class:active={page.url.pathname === "/live"}
        class="btn-nav"
      >
        <Icon icon="solar:tv-outline" width="16" height="16" />
      </a>
    </div>
  </div>
</main>

<style>
  .btn-source {
    @apply px-6 bg-black/60 bg-gradient-to-tr from-teal-200/15 to-zinc-100/15 shadow-md shadow-black/30 ring-1 ring-white/15 backdrop-blur-xl min-w-[110px] h-24 text-center text-secondary-white/30 rounded-3 text-13;
  }

  .btn-source.active {
    @apply text-secondary-white;
  }

  .btn-nav {
    @apply outline-none size-27 flex items-center justify-center text-black/30 hover:text-black transition duration-300;
  }

  .btn-nav.active {
    @apply text-black;
  }
</style>
