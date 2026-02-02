<script lang="ts">
  import { enhance } from "$app/forms";
  import type { DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { toast } from "svelte-sonner";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/state";
  import { Tween } from "svelte/motion";
  import { quadInOut } from "svelte/easing";
  import { onDestroy, onMount, untrack } from "svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import { bookmark, bookInfo } from "$lib/store/highlightstore";
  import { innerWidth, innerHeight } from "svelte/reactivity/window";
  import postcss from "postcss";
  import Modal from "$lib/components/Modal.svelte";

  type PageContent = {
    zIndex: number;
    rotate: number;
    front: string;
    back: string;
  };

  let showModal = $state(false);

  const content =
    "Quite naturally, this depiction of an end times by an extinctionist covenant will seem abhorrent to those now living in hope of a better future (not necessarily one in which glorious progress has been made toward the alleviation of human misery, but at least one that will partially exculpate them from a depraved indifference to the harm predestined for their young). It may also seem a romanticized utopia, since those who predict major readjustments in humanity’s self-conception (Karl Marx, et al.) often believe that a revolution in ethics will blossom when their “truths” are instituted. Worse, or perhaps better if the solution to human suffering is to be final, the idea of a new humanity may be a smokescreen for a tyrannical oligarchy run by militants of extinction rather than a social and psychological sanctuary for a species harboring the universal goal of delimiting its stay on earth.";

  function test(
    pText: string,
    pFont: string,
    pSize: number,
    pWeight: number,
    pLine: number,
    pWidth: number,
  ) {
    const style = document.createElement("style");
    style.innerHTML = `
    div {
      font-family: ${pFont}, sans-serif;
      font-weight: ${pWeight};
      font-size: ${pSize}px;
      line-height: ${pLine};
      letter-spacing: 0px;
      overflow: hidden;
      text-align: left;
      width: ${pWidth}px;
    }

    div:first-letter {
      initial-letter: 5;
      padding: 9px 12px;
      margin: 12px 6px 0 0;
      font-family: "Baskervville";
      font-weight: 700;
      color: #f0f0f0;
      border: 1px solid #111111;
    }

    p {
      text-indent: 1.5em;
    }

    cite {
      display: block;
      text-align: right;
    }
    `;
    document.head.appendChild(style);
    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);
    lDiv.innerHTML = pText;
    const height = lDiv.clientHeight;
    console.log("🚀 ~ test ~ height:", height);
    document.body.removeChild(lDiv);
  }

  function test1() {
    document.querySelector("")?.remove();
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<section
  class="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pt-60 px-60 pb-90 z-[5]"
>
  <button
    onclick={() => test(content, "Bookerly", 15, 400, 1.55, 324)}
    class="text-white text-30"
  >
    Show
  </button>
  <button onclick={test1} class="text-white text-30"> Del</button>
</section>

<style lang="postcss">

</style>
