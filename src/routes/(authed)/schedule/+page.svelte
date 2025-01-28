<script lang="ts">
  import Flipcard from "$lib/components/Flipcard.svelte";

  let state = $state(123);
</script>

<main class="flex items-center justify-center flex-col">
  <div class="flex">
    <button onclick={() => (state = 100)} class="mr-2 rounded-1 border px-1">
      100
    </button>
    <button onclick={() => (state = 127)} class="mr-2 rounded-1 border px-1">
      127
    </button>
    <button onclick={() => (state = 1)} class="mr-2 rounded-1 border px-1">
      1
    </button>
    <button onclick={() => (state = 0)} class="mr-2 rounded-1 border px-1">
      0
    </button>
  </div>
  <Flipcard number={state} />
</main>
