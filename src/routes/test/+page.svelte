<script lang="ts">
  async function name() {
    console.time("label");
    const titleParam = "Discourses and Selected Writings";
    const authorParam = "Epictetus";
    const response = await fetch(
      `/server/getbookinfo?query=${titleParam}&author=${authorParam}`,
    );
    console.timeEnd("label");
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full z-10 flex flex-col justify-center items-center"
>
  <button onclick={name}>click</button>
</div>

<style lang="postcss">
</style>
