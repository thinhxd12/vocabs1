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

  type PageContent = {
    zIndex: number;
    rotate: number;
    front: string;
    back: string;
  };

  let windowHeight = $state<number>(703);
  const ratio = 1.61803398875;

  const pageWidth = (wHeight: number) => {
    const width = Math.round(ratio * (wHeight - 150));
    return width % 2 !== 0 ? width + 1 : width;
  };
  const pageHeight = (wHeight: number) => wHeight - 150;

  const dumb = [
    {
      zIndex: 4,
      front: "",
      back: "",
      rotate: 0,
    },
    {
      zIndex: 3,
      front:
        "Fate, however, can improve; moreover, we will not ask much of it if we are inwardly rich. A poor wretch, on the other hand, remains a wretch, a dunce remains a dunce to the end of his life, even if he were in paradise surrounded by houris. Hence Goethe says: <p>Nations, rulers, slaves subjected</p> <p>All on this one point agree: <p>Joy of earthlings is perfected</p> <p>In the personality.</p> <p>West-Eastern Divana</p> That the subjective is incomparably more essential for our happiness and our pleasure than the objective is confirmed by everything: from the fact that hunger is the best sauce and that the old man looks with indifference at the goddess of the young, to the life of the genius and the saint.",
      back: "Especially health so far outweighs all external goods that a healthy beggar is truly more fortunate than a king in poor health. A calm and cheerful temperament resulting from perfect health and a lucky bodily organization, a clear, lively, penetrating and accurately comprehending understanding, a moderate, gentle will, and consequently a good conscience – these are advantages for which no rank or wealth can compensate. For what somebody is in himself, what accompanies him in solitude, and what nobody can give him or take away from him, is obviously more essential to him than anything that he possesses or that he may be in the eyes of others. A witty person, all alone, has excellent entertainment in his own thoughts and fantasies, whereas in a dullard the continuous diversion of parties, plays, excursions, and amusements cannot",
      rotate: 0,
    },
    {
      zIndex: 2,
      front:
        "fend off the torments of boredom. A good, moderate, gentle character can be contented in meagre circumstances, whereas a greedy, envious, and malicious one is not in spite of all his wealth. Indeed, for the person who continuously enjoys an extraordinary, intellectually eminent personality, most of the generally desired pleasures are entirely superfluous, even just troublesome and annoying. Hence Horace says of himself: Gems, marble, ivory, Etruscan figurines, pictures, Silver, clothes dyed in Gaetulian purple, Many there are who own none, one who does not care to own.",
      back: "",
      rotate: 0,
    },
  ];

  let visualProgress = new Tween(18, {
    duration: 300,
    easing: quadInOut,
  });
  let currentPage = $state<number>(0);
  let flipPages = $state<PageContent[]>(dumb);

  function handleFlipPage(index: number) {
    // console.log(index);
    visualProgress.target = 18;

    flipPages[index].zIndex = 999;

    if (flipPages[index].rotate) {
      flipPages[index].rotate = 0;
      setTimeout(() => {
        flipPages[index].zIndex = 1 + flipPages.length - index;
      }, 600);
    } else {
      flipPages[index].rotate = 180;
      setTimeout(() => {
        flipPages[index].zIndex = 1 + index;
      }, 600);
    }

    if (flipPages[0].rotate !== 0) {
      setTimeout(() => {
        visualProgress.target = 580;
      }, 600);
    }
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<section
  class="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pt-60 px-60 pb-90 z-[5]"
>
  <h1 class="absolute text-white top-0 left-1/2">{visualProgress.current}</h1>

  <div
    class="book"
    style="width: {pageWidth(windowHeight)}px; height:{pageHeight(
      windowHeight,
    )}px;"
  >
    {#each flipPages as page, i}
      {#if i === 0}
        <div
          class="flip coverPage"
          style="z-index: {page.zIndex}; transform: rotateY(-{page.rotate}deg);"
        >
          <div class="pageFront bg-[#0a0905]">
            <div class="w-full h-full flex items-center p-45">
              <p
                class="text-[#d0c9c5] text-500 text-[45px] leading-[50px] font-copernicus"
              >
                take a small step every day
              </p>
            </div>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            ></button>
          </div>

          <div class="pageBack p-9 pr-0 bg-[#0a0905]">
            <div class="content backPaper"></div>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            ></button>
          </div>
        </div>
      {:else}
        <div
          class="flip normalPage"
          style="z-index: {page.zIndex}; transform: rotateY(-{page.rotate}deg);"
        >
          <div class="pageFront" class:firstPage={i === 1}>
            <div class="content frontPaper">
              {@html page.front}
            </div>
            <p class="pageNumber">{2 * i - 1}</p>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            >
              {#if page.rotate === 0}
                <div class="pageFold"></div>
              {/if}
            </button>
          </div>
          <div class="pageBack">
            <div class="content backPaper">
              {@html page.back}
            </div>
            <p class="pageNumber">{2 * i}</p>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            >
              {#if page.rotate === 180}
                <div class="pageFold"></div>
              {/if}
            </button>
          </div>
        </div>
      {/if}
    {/each}

    <div class="backCover" style="z-index: 1;">
      <div class="w-full h-full frontPaper"></div>
    </div>

    <button
      class="ribbon {visualProgress.current > 150
        ? 'ribbonLong'
        : 'ribbonShort'}"
      style="height: {visualProgress.current}px; z-index: {visualProgress.current >
      18
        ? 1001
        : 1};"
    >
      {#if visualProgress.current > 240}
        <span class="ribbonContent">1</span>
      {/if}
      <span
        class="ribbonTail {visualProgress.current > 150
          ? 'ribbonTailLong'
          : 'ribbonTailShort'}"
      ></span>
    </button>
  </div>
</section>

<svelte:window bind:innerHeight={windowHeight} />

<style>
  .book {
    perspective: 4500px;
    position: relative;
  }

  .backCover {
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
    background: #0a0905;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    padding: 9px 9px 9px 0;
    box-shadow: 8px 4px 12px #0009;
  }

  .backPaper {
    background-color: #f5f5f5;
    background-image: linear-gradient(
        90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 12%
      ),
      linear-gradient(0deg, rgb(212, 212, 212) 0%, rgba(247, 247, 247, 0) 12%),
      linear-gradient(
        -90deg,
        rgba(212, 212, 212, 0.6) 0%,
        rgba(247, 247, 247, 0.3) 18%
      ),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 12%);
  }

  .frontPaper {
    background-color: #f5f5f5;
    background-image: linear-gradient(
        90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 12%
      ),
      linear-gradient(0deg, rgb(212, 212, 212) 0%, rgba(247, 247, 247, 0) 12%),
      linear-gradient(
        -90deg,
        rgba(212, 212, 212, 0.6) 0%,
        rgba(247, 247, 247, 0.3) 18%
      ),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 12%);
  }

  .flip {
    transform-style: preserve-3d;
    position: absolute;
    transition: transform 0.5s ease-in-out;
    transform-origin: left center;
  }

  .normalPage {
    position: absolute;
    height: calc(100% - 18px);
    width: calc(50% - 9px);
    right: 9px;
    top: 9px;
  }

  .coverPage {
    position: absolute;
    height: 100%;
    width: 50%;
    right: 0;
    top: 0;
  }

  .pageFront {
    position: absolute;
    height: 100%;
    width: 100%;
    user-select: text;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .pageBack {
    position: absolute;
    height: 100%;
    width: 100%;
    user-select: text;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    z-index: 0;
    transform: rotateY(180deg);
  }

  .coverPage .pageBack {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    box-shadow: -8px 4px 12px #0009;
  }

  .coverPage .pageFront {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .content {
    width: 100%;
    height: 100%;
    font-family: "Proxima Nova", sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.4375;
    letter-spacing: 0px;
    padding: 55px 50px 55px 60px;
    overflow: hidden;
    text-align: left;
    text-size-adjust: 100%;
    color: #1e1915;
  }

  .content :global {
    p {
      text-indent: 15px;
    }
  }

  .firstPage::first-letter {
    font-family: "Open Sans";
    font-size: 125px;
    color: #dcd8d1;
    font-style: normal;
    line-height: 100px;
    text-transform: uppercase;
    float: left;
    margin: 6px 6px 0 0;
    display: block;
    background: url("/images/TheEndoftheDay.webp") 0 0 no-repeat;
    background-size: cover;
    background-position: center;
    padding: 0 3px 3px 3px;
    border: 1px solid #111111;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 1);
    box-shadow: inset 0 1px 9px rgba(0, 0, 0, 1);
  }

  .pageNumber {
    position: absolute;
    bottom: 21px;
    left: 0;
    width: 100%;
    text-align: center;
    font-family: "Copernicus", sans-serif;
    font-weight: 500;
    font-size: 14px;
  }

  .pageButton {
    position: absolute;
    top: 0;
    height: 100%;
    width: 60px;
  }

  .pageFront .pageButton {
    right: 0;
  }

  .pageBack .pageButton {
    left: 0;
  }

  .pageFold {
    position: absolute;
    width: 0px;
    height: 0px;
    transition: all 0.3s ease-out;
  }

  .pageFront .pageFold {
    top: 0;
    right: 0;
    border-left-width: 1px;
    border-left-color: #dddddd;
    border-left-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: -3px 3px 9px rgba(0, 0, 0, 0.45);
  }

  .pageFront .pageButton:hover .pageFold {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      45deg,
      #f7f7f7 0%,
      rgba(247, 247, 247, 0.3) 49%,
      transparent 50%,
      transparent 100%
    );
  }

  .pageBack .pageFold {
    top: 0;
    left: 0;
    border-right-width: 1px;
    border-right-color: #dddddd;
    border-right-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: 3px 3px 9px rgba(0, 0, 0, 0.45);
  }

  .pageBack .pageButton:hover .pageFold {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      135deg,
      transparent 0%,
      transparent 49%,
      #e9e8e8 50%,
      #dadada 100%
    );
  }

  .ribbon {
    position: relative;
    top: -9px;
    left: calc(50% + 6px);
    user-select: none;
    border-top-left-radius: 3px;
    width: 36px;
    height: 18px;
    font-size: 1em;
    container-type: inline-size;
    z-index: 3;
  }

  .ribbonContent {
    font-family: "Copernicus", sans-serif;
    font-size: 60cqi;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    user-select: none;
  }

  .ribbon::before {
    content: "";
    position: absolute;
    height: 9px;
    width: 6px;
    right: -6px;
    top: 0px;
    z-index: 1;
    border-bottom: 9px solid #600909;
    border-right: 6px solid transparent;
  }

  .ribbonShort {
    background: #a90909;
  }

  .ribbonLong {
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    background: linear-gradient(
      180deg,
      rgb(169, 9, 9) 0%,
      rgba(229, 33, 28, 1) 20%,
      rgba(164, 5, 2, 1) 40%,
      rgb(229, 10, 0) 100%
    );
  }

  .ribbonTail {
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 0;
    height: 0;
    z-index: inherit;

    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
  }

  .ribbonTailLong {
    border-top: 20px solid #e40900;
  }

  .ribbonTailShort {
    border-top: 20px solid #a90909;
  }
</style>
