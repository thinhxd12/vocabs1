<script lang="ts">
  import { URL_IMAGE_MAIN_PAGE } from "$lib/utils/constants";
  import type { LayoutImageType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  const startedImageData = {
    mainImage: "/images/main-image.webp",
    shareDate: "01 July 2023",
    title: "The Red Buoy, Saint-Tropez",
    attr: "Oil on canvas • 81 × 65 cm",
    authorImage: "/images/main-author.webp",
    author: "Paul Signac",
    authorYears: "1895",
    content:
      "<p>Hello July!</p> <p>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!</p> <p>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.</p> <p>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.</p> <p>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.</p> <p>P.S. Our sale is on! Save 20% on our <a href=\"https://shop.dailyartmagazine.com/product-category/prints/?utm_campaign=DailyArt-Prints&amp;utm_medium=text&amp;utm_source=DailyArtapp&amp;utm_term=fine-art-prints\">Prints Collection</a> and order a high-quality reproduction of the greatest masterpieces.&nbsp;</p>",
    nextImageUrl:
      "https://www.getdailyart.com/en/22194/edouard-manet/women-at-the-races",
  };

  let imageData = $state<LayoutImageType>(startedImageData);

  onMount(async () => {
    const response = await fetch(
      `/server/getdailyart?link=${URL_IMAGE_MAIN_PAGE}`,
    );
    if (response.status == 200) {
      let data = await response.json();
      imageData.nextImageUrl = data.nextImageUrl;
    }
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

<section class="absolute top-0 left-0 w-screen h-screen flex z-[5]">
  <div
    class="relative bg-[#19191C] overflow-hidden flex-1 h-full flex items-center justify-center pt-60 pb-80 px-40"
  >
    <img
      src={imageData.mainImage}
      alt="main"
      class="absolute top-0 left-0 w-full h-full object-cover"
      style="filter: blur(150px); z-index: 1;"
    />
    <img
      src={imageData.mainImage}
      alt="main"
      class="max-h-full max-w-full object-cover shadow-xl shadow-black/80 z-10"
    />
    <button
      class="btn-menu absolute top-6 right-0 z-50"
      onclick={() => getImageData(imageData!.nextImageUrl)}
    >
      <Icon icon="solar:arrow-right-bold" width="15" height="15" />
    </button>
  </div>
  <div class="w-[360px] h-full dark !bg-black/80 flex flex-col p-15">
    <div class="w-full mb-9">
      <p class="mb-6 text-13 font-500 leading-15 text-secondary-white">
        {imageData.shareDate}
      </p>
      <h3 class="mb-6 font-roslindale text-27 font-600 leading-30 text-white">
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
            <p class="truncate text-wrap pl-9 text-13 font-400 text-white">
              {imageData.author}
            </p>
            <p class="pl-9 text-13 font-400 text-white">
              {imageData.authorYears}
            </p>
          </div>
        </div>
      </div>
      <div
        class="no-scrollbar my-9 w-full flex-grow overflow-y-scroll text-13 font-400 leading-18 text-secondary-white *:indent-9"
        style="mask-image: linear-gradient(to top, transparent, #fff 5%, #fff 100%)"
      >
        {@html imageData.content}
      </div>
    </div>
  </div>
</section>

<style lang="postcss">
  .btn-menu {
    @apply mx-6 flex size-27 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 outline-none backdrop-blur-md;
  }
</style>
