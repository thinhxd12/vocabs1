<script lang="ts">
  import type { ToastType } from "$lib/types";

  function name() {}
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div class="absolute w-full h-full z-10 flex justify-center items-start">
  <div class="absolute bottom-0 flex justify-center gap-3">
    <button onclick={name} class=" text-white bg-black px-6">
      add toast
    </button>
  </div>
</div>

<style lang="postcss">
</style>
