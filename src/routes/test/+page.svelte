<script lang="ts">
  import { SCRAPER_API_URL } from "$lib/utils/constants";

  async function name() {
    console.time("label");
    const titleParam = "Discourses and Selected Writings";
    const authorParam = "Epictetus";
    const response = await fetch(
      `/server/getbookinfo?query=${titleParam}&author=${authorParam}`,
    );

    const urlS = `https://www.goodreads.com/search?utf8=%E2%9C%93&query=${titleParam}&search_type=books`;

    const data = await response.json();
    console.log("🚀 ~ name ~ data:", data);
    console.timeEnd("label");
  }

  async function name1() {
    const url = `/server/getwiktionary?word=pesticide`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("🚀 ~ name1 ~ data:", data);
  }

  let image = $state("01");
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full z-10 flex flex-col justify-center items-center"
>
  <input bind:value={image} />
  <img
    alt="icon"
    class="size-120 object-cover s-P2QlwJdd_0gk"
    style="filter: drop-shadow(0px 0px 9px rgba(0, 0, 0, 0.3));"
    src="/metoffice/{image}.png"
  />
  <button onclick={name}>click</button>
  <button onclick={name1}>check</button>
</div>

<style lang="postcss">
</style>
