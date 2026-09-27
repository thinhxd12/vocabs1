<script lang="ts">
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

  async function name1() {}

  async function name2() {}
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full z-10 flex flex-col justify-center items-center"
>
  <button onclick={name1}>check</button>
  <button onclick={name2}>name2</button>
</div>

<style lang="postcss">
</style>
