<script lang="ts">
  import Flipcard from "$lib/components/Flipcard.svelte";
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import Tick from "$lib/components/Tick.svelte";

  let state = $state(123);
</script>

<main class="flex items-center justify-center flex-col">
  <div class="flex">
    <button onclick={() => (state = 1714)} class="mr-2 rounded-1 border px-1">
      1714
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
  <!-- <Flipcard number={state} /> -->

  <div class="font-tupa text-18 font-600 leading-15">
    <Tick number={state} />
  </div>

  <!-- <ImageLoader
    width={360}
    height={208}
    hash="qggKDYKKnUh/dpiEiImJhyfF/6XI"
    imageSrc="https://media.gettyimages.com/id/2157231571/photo/a-senior-couple-embracing-on-a-public-bench-in-a-park.jpg?s=612x612&w=0&k=20&c=mr4D1DEukt60L44QJC5IeQqXKnnLbdaP_lcNRljy3tI="
  /> -->
</main>
