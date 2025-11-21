<script lang="ts">
  import { URL_IMAGE_MAIN_PAGE } from "$lib/utils/constants";
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

<section
  class="absolute top-0 left-0 w-screen h-screen flex justify-center p-60 z-[5]"
>
  <div
    class="w-full h-full flex overflow-hidden relative shadow-lg shadow-black/45"
  >
    {#if imageData}
      <div class="dark !bg-black/80 w-1/5 h-full flex flex-col p-15">
        <div class="w-full mb-9">
          <p class="text-12 font-500 leading-15 text-secondary-white">
            {imageData.shareDate}
          </p>
          <h3 class="font-roslindale text-24 font-600 leading-30 text-white">
            {imageData.title}
          </h3>

          <p class="text-12 font-400 leading-15 text-white">
            {imageData.attr}
          </p>
        </div>

        <div class="flex h-1/2 w-full flex-grow flex-col">
          <div class="rounded-6 bg-white/15 p-3">
            <div class="flex">
              <img
                src={imageData.authorImage}
                alt="author"
                class="size-[45px] rounded-6 object-cover shadow shadow-black/10"
              />
              <div>
                <p class="truncate text-wrap pl-9 text-12 font-400 text-white">
                  {imageData.author}
                </p>
                <p class="pl-9 text-12 font-400 text-white">
                  {imageData.authorYears}
                </p>
              </div>
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

      <div class="dark flex-1 h-full no-scrollbar relative overflow-hidden">
        <div
          class="h-full w-full flex items-center justify-center pt-20 pb-40"
        >
          <img
            src={imageData.mainImage}
            alt="main"
            class="max-h-full max-w-full object-cover shadow-xl shadow-black/80"
          />
        </div>
        <button
          class="btn-menu absolute bottom-6 right-0 z-10"
          onclick={() => getImageData(imageData!.nextImageUrl)}
        >
          <Icon icon="solar:arrow-right-bold" width="15" height="15" />
        </button>
      </div>
    {/if}
  </div>
</section>

<style>
  .btn-menu {
    @apply mx-6 flex size-27 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 outline-none backdrop-blur-md;
  }
</style>
