<script lang="ts">
  import { showLayout } from "$lib/store/layoutstore";
  import type { BackgroundImageType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { innerWidth, innerHeight } from "svelte/reactivity/window";

  let showBg = $state<boolean>(false);
  let bgImage = $state<BackgroundImageType | undefined>(undefined);
  let bgSrc = $state<string>("/gif/rain1.mp4");

  async function changeBackgroundImg() {
    const response = await fetch(`/server/getlayoutimage`);
    bgImage = await response.json();
    showBg = true;
  }

  let videos = $state([
    ...Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      src: `/gif/rain${i + 1}.mp4`,
    })),
  ]);
</script>

{#if showBg}
  {#if bgImage}
    <img
      src={bgImage.url}
      class="w-full h-full object-cover absolute top-0 left-0"
      width={innerWidth.current}
      height={innerHeight.current}
      alt="bg"
    />

    {#if !$showLayout}
      <p
        style="text-shadow: 0 0 3px black;"
        class="absolute w-[calc(50vw-215px)] hidden md:block left-0 bottom-6 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white"
      >
        {@html bgImage.title}
      </p>
    {/if}
  {/if}
{:else}
  <video
    src={bgSrc}
    autoplay
    loop
    muted
    playsinline
    class="w-full h-full object-cover absolute top-0 left-0 brightness-75"
  >
    Your browser does not support the video tag.
  </video>
{/if}

{#if !$showLayout}
  <div class=" absolute z-50 top-0 left-0 hidden sm:flex">
    <select
      bind:value={bgSrc}
      onchange={() => (showBg = false)}
      class="layout-white btn-menu"
    >
      {#each videos as video}
        <option value={video.src}>
          {video.id}
        </option>
      {/each}
    </select>

    <button onclick={changeBackgroundImg} class="btn-menu layout-white">
      <Icon icon="mingcute:sun-line" width="15" height="15" />
    </button>
  </div>
{/if}

<style>
  .btn-menu {
    @apply m-3 flex size-27 items-center justify-center  appearance-none text-center cursor-pointer rounded-3 !bg-white/5 hover:!bg-white/15 transition duration-300 text-black/90 text-9 leading-27 font-500 outline-none;
  }
</style>
