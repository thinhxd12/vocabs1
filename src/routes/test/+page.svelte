<script lang="ts">
  import TickFlip from "$lib/components/TickFlip.svelte";
  import { toast } from "svelte-sonner";

  let num = $state<number>(0);

  function name() {
    toast.error("Error", {
      description: "erorrrrrr",
      class: "my-toast my-toast-error",
    });
  }

  function selectOnMount(node: any) {
    node.focus();
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full bg-white z-10 flex justify-center items-start"
>
  <div class="relative flex gap-2 font-helvetica text-40 font-600 leading-36">
    {#key num}
      <TickFlip number={num} />
    {/key}
    <TickFlip number={num} />
    <TickFlip number={num} image={num === 0} />
  </div>
  <div class="absolute bottom-0 flex justify-center gap-3">
    <button onclick={() => (num = 0)} class=" text-white bg-black px-6"
      >0</button
    >
    <button onclick={() => (num = 1)} class=" text-white bg-black px-6">
      1
    </button>
    <button onclick={() => (num = 6)} class=" text-white bg-black px-6">
      6
    </button>
    <button onclick={() => (num = 9)} class=" text-white bg-black px-6">
      9
    </button>
  </div>
</div>

<style lang="postcss">
</style>
