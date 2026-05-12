<script lang="ts">
  async function name() {
    const response = await fetch(`/server/gettest`);
    console.log("🚀 ~ name ~ response:", response)
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
