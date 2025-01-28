<script lang="ts">
  import Flipcard from "$lib/components/Flipcard.svelte";
  import ImageLoader from "$lib/components/ImageLoader.svelte";

  let num = $state(123);
  let src = $state("");
  let hash = $state("");

  const func1 = () => {
    hash = "0TgKFYR3bEdwh4Znh3eqh2aARgY3";
    src =
      "https://media.gettyimages.com/id/482190327/photo/portrait-of-sultry-young-woman-reclining-on-bedroom-seat.jpg?s=612x612&w=0&k=20&c=LX0RMJh5XY7R8SucAqSc28hHWIrSGD4QzI5Y_G8oMtA=";
  };

  const func2 = () => {
    src =
      "https://www.shutterstock.com/image-photo/family-tree-genealogy-600nw-399516166.jpg";
    hash = "YggKBgB5V+eYhzdniH93g1d4VWtAmAY=";
  };
</script>

<main class="flex items-center justify-center flex-col">
  <div class="flex">
    <button onclick={() => (num = 100)} class="mr-2 rounded-1 border px-1">
      100
    </button>
    <button onclick={() => (num = 127)} class="mr-2 rounded-1 border px-1">
      127
    </button>
    <button onclick={() => (num = 1)} class="mr-2 rounded-1 border px-1">
      1
    </button>
    <button onclick={() => (num = 0)} class="mr-2 rounded-1 border px-1">
      0
    </button>

    <button onclick={func1} class="mr-2 rounded-1 border px-1"> img1 </button>

    <button onclick={func2} class="mr-2 rounded-1 border px-1"> img2 </button>
  </div>
  <!-- <Flipcard number={state} /> -->

  <ImageLoader width={388} height={218} imageSrc={src} {hash} />
</main>
