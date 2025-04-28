<script lang="ts">
  import { URL_IMAGE_MAIN_PAGE } from "$lib/constants";
  import { showBookmark } from "$lib/store/layoutstore";
  import type { LayoutImageType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  let imageData = $state<LayoutImageType | undefined>(undefined);

  onMount(() => {
    getImageData(URL_IMAGE_MAIN_PAGE);
  });

  async function getImageData(url: string) {
    if (!url) return;
    const response = await fetch(`/server/getdailyart?link=${url}`);
    if (response.status == 200) {
      imageData = await response.json();
    }
  }
</script>

<svelte:head>
  <title>{imageData ? `${imageData.title}` : "Daily Art"}</title>
  <meta name="art" content="Some painting" />
</svelte:head>

<section class="flex-1 h-full p-[48px] overflow-hidden">
  <div
    class="w-full h-full rounded-6 flex overflow-hidden relative shadow-lg shadow-black/45"
  >
    {#if imageData}
      <div
        class="layout-black !bg-black/90 w-[240px] h-full flex flex-col p-15"
      >
        <div class="w-full">
          <p class="text-12 font-500 leading-15 text-secondary-white">
            {imageData.shareDate}
          </p>
          <h3
            class="mb-6 font-roslindale text-24 font-600 leading-30 text-white"
          >
            {imageData.title}
          </h3>
        </div>

        <div class="flex h-1/2 w-full flex-grow flex-col">
          <div class="rounded-6 bg-white/15 p-3">
            <div class="flex">
              <img
                src={imageData.authorImage}
                alt="author"
                class="size-[45px] rounded-6 object-cover shadow shadow-black/10"
              />
              <span class="truncate text-wrap pl-9 text-12 font-400 text-white">
                {imageData.author}
              </span>
            </div>
          </div>
          <div
            class="no-scrollbar my-9 w-full flex-grow overflow-y-scroll text-12 font-400 leading-16 text-secondary-white *:indent-9"
            style="mask-image: linear-gradient(to top, transparent, #fff 5%, #fff 100%)"
          >
            {@html imageData.content}
          </div>
        </div>
      </div>
      <div
        class="layout-black flex-1 h-full no-scrollbar relative overflow-y-scroll"
      >
        <div
          class="flex h-full w-full flex-col items-center px-[10%] pb-[10%] pt-[5%]"
        >
          <img
            src={imageData.mainImage}
            alt="main"
            class="max-h-full max-w-full rounded-6 object-cover shadow-xl shadow-black/80"
          />
          <div class="relative z-50 mt-15 flex w-full justify-between px-27">
            <p class="text-12 font-400 leading-15 text-white">
              {imageData.attr}
            </p>
            <p class="pl-3 text-14 text-white">
              {imageData.authorYears}
            </p>
          </div>
        </div>
      </div>
      <button
        class="btn-menu absolute bottom-6 right-0 z-10"
        onclick={() => getImageData(imageData!.nextImageUrl)}
      >
        <Icon icon="solar:skip-next-linear" width="15" height="15" />
      </button>

      <button
        class="btn-menu absolute bottom-6 left-[240px] z-10"
        onclick={() => ($showBookmark = !$showBookmark)}
      >
        <Icon icon="solar:notebook-linear" width="15" height="15" />
      </button>
    {/if}
  </div>
</section>

<style>
  .btn-menu {
    @apply mx-6 flex size-27 items-center justify-center rounded-full text-white outline-none backdrop-blur-md transition duration-150;
  }

  .btn-menu:active :global svg {
    transform: scale(1.1);
  }
</style>
