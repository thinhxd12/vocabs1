<script lang="ts">
  import HighlightPage from "$lib/components/HighlightPage.svelte";
  import type { BookPageContentType } from "$lib/types";
  import { innerHeight } from "svelte/reactivity/window";
  import { Spring, Tween } from "svelte/motion";
  import { page } from "$app/state";
  import { linear, quadInOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  const ratio = 1.61803398875;

  const content =
    "Quite naturally, this depiction of an end times by an extinctionist covenant will seem abhorrent to those now living in hope of a better future (not necessarily one in which glorious progress has been made toward the alleviation of human misery, but at least one that will partially exculpate them from a depraved indifference to the harm predestined for their young). It may also seem a romanticized utopia, since those who predict major readjustments in humanity’s self-conception (Karl Marx, et al.) often believe that a revolution in ethics will blossom when their “truths” are instituted. Worse, or perhaps better if the solution to human suffering is to be final, the idea of a new humanity may be a smokescreen for a tyrannical oligarchy run by militants of extinction rather than a social and psychological sanctuary for a species harboring the universal goal of delimiting its stay on earth.";

  const pageWidth = () => {
    const width = Math.round(ratio * (innerHeight.current! - 150));
    return width % 2 !== 0 ? width + 1 : width;
  };
  const pageHeight = () => innerHeight.current! - 150;

  const tweenCover = new Spring(0, {
    stiffness: 0.08,
    damping: 0.6,
  });

  const tweenRibbon = new Tween(21, {
    duration: 200,
    easing: quadInOut,
  });

  let flipCover = $state<boolean>(false);
  let like = $state<number>(12);
  let keyPressed = $state<boolean>(false);
  let currentPage = $state<number>(0);

  const dummy = [
    {
      id: 1,
      front:
        "Surely, I thought, when all’s said and done, life must always be right. If life treated my beautiful dreams with derision, my dreams must simply have been stupid and wrong, I thought. But that was of no help at all. And since I had good eyes and ears, and a rather inquisitive nature, I took a really close look at so-called life, at people I knew and my neighbours, fifty or more individuals and their fates. And what did I see, Harry? That my dreams had been right, a thousand times right, just as yours were, whereas life, reality, was wrong. That a woman of my kind should have no alternative but to grow old sitting at a typewriter, working pointlessly and for a pittance in the service",
      back: "of someone well paid, or to marry someone like that for the sake of his money, or else to become a kind of whore – all that seemed just as wrong as someone lonely, shy and in despair like you being forced to reach for his razor. The misery I went through was perhaps more financial and moral, yours more intellectual and spiritual, but our journeys were the same. Do you think I’m incapable of understanding your fear of the foxtrot, your distaste for bars and dance floors, your resistance to jazz music and all that sort of stuff? I understand it all only too well, just as I do your disgust with politics, your sadness at the way the parties and the press ramble on and kick up a fuss about things, your despair over wars, the one there has just been and those still to come, and",
      flip: false,
    },
    {
      id: 2,
      front:
        "about modern habits of thinking, reading, building, making music, celebrating things and providing education! You are right, Steppenwolf, a thousand times right, and yet you must perish. You are far too demanding, too hungry for today’s straightforward, cosy world, satisfied as it is with so little. You have one dimension too many for its liking, so it will spit you out. It is impossible for anyone wishing to live and enjoy life in today’s world to be like you or me. It is no home, this fine world, for people like us who, instead of nonsensical noise, demand music; instead of pleasure, joy; instead of money, soul; instead of industrial production, genuine labour; instead of frivolity, genuine passion …’",
      back: "",
      flip: false,
    },
  ];

  let flipPages = $state<BookPageContentType[]>(dummy);

  function handleFlipPage(id: number) {
    tweenRibbon.target = 21;
    currentPage = id;

    if (flipPages[id - 1].flip) {
      flipPages[id - 1].flip = false;
    } else {
      flipPages[id - 1].flip = true;
    }

    if (flipCover && like > 0) {
      setTimeout(() => {
        tweenRibbon.target = true ? 480 : 480;
      }, 400);
    }
  }

  function flipCoverPage() {
    if (flipCover) {
      flipCover = false;
      tweenCover.target = 0;
    } else {
      flipCover = true;
      tweenCover.target = -180;
    }
  }

  function handleCloseBook() {
    keyPressed = true;
    tweenRibbon.target = 21;

    flipPages.forEach((item, i) => {
      setTimeout(
        () => {
          item.flip = false;
        },
        (flipPages.length - i - 1) * 150,
      );
    });

    setTimeout(() => {
      tweenCover.target = 0;
      currentPage = 0;
      flipCover = false;
      keyPressed = false;
    }, flipPages.length * 150);
  }

  function shadowIn(node: HTMLElement) {
    return {
      duration: 10,
      // easing: linear,
      css: (t: number) => `
        box-shadow: ${1 * t}px ${6 * t}px ${18 * t}px rgba(0, 0, 0, ${0.8 * t});
      `,
    };
  }

  function onKeyDown(e: KeyboardEvent) {
    if (keyPressed) {
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowRight") {
      switch (currentPage) {
        case 0:
          if (flipCover) {
            handleFlipPage(1);
          } else {
            flipCover = true;
            tweenCover.target = -180;
          }
          break;
        case flipPages.length:
          flipPages[currentPage - 1].flip
            ? console.log("nextbookmark")
            : handleFlipPage(currentPage);
          break;
        default:
          flipPages[currentPage - 1].flip
            ? handleFlipPage(currentPage + 1)
            : handleFlipPage(currentPage);
          break;
      }
    } else if (e.key === "ArrowLeft") {
      switch (currentPage) {
        case 0:
          if (flipCover) {
            console.log("handleGetPrevBookmark");
          }
          break;
        case 1:
          flipPages[0].flip
            ? handleFlipPage(1)
            : console.log("handleGetPrevBookmark");
          break;
        default:
          flipPages[currentPage - 1].flip
            ? handleFlipPage(currentPage)
            : handleFlipPage(currentPage - 1);
          break;
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      console.log("handleCheckBookmark");
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
  <button
    class="text-white text-36 absolute bottom-0"
    onclick={handleCloseBook}
  >
    close
  </button>

  <div class="book" style="width: {pageWidth()}px; height: {pageHeight()}px;">
    <div
      class="flip flipCover"
      style="z-index: {tweenCover.current <= -90
        ? 4
        : 4 + flipPages.length}; transform: rotateY({tweenCover.current}deg);"
    >
      <div class="frontPage">
        <div
          class="frontCover"
          style="width: {pageWidth() / 2}px; height: {pageHeight()}px;"
        >
          FRONT
        </div>
        <button
          class="pageButton"
          aria-label="pageButton"
          onclick={() => flipCoverPage()}
        ></button>
      </div>
      <div class="backPage">
        <div
          class="infoPage"
          style="width: {pageWidth() / 2}px; height: {pageHeight()}px;"
        >
          <div class="infoPageContent frontCoverPaper">BACK</div>
        </div>
        <!-- <button
          class="pageButton"
          aria-label="pageButton"
          onclick={handleGetPrevBookmark}
          disabled={keyPressed || isRandomed}
          class:disabled={keyPressed || isRandomed}
        ></button> -->
        <button
          class="pageButton"
          aria-label="pageButton"
          onclick={() => flipCoverPage()}
        ></button>
      </div>
    </div>

    {#each flipPages as item}
      <HighlightPage
        data={item}
        innerWidth={pageWidth() / 2 - 12 - 112}
        innerHeight={pageHeight() - 24 - 96}
        length={flipPages.length}
        handleFlip={handleFlipPage}
      />
    {/each}

    {#if tweenCover.current < -170}
      <div class="frontShadow" style="z-index: 2;" in:shadowIn></div>
    {/if}
    <div class="backShadow" style="z-index: 1;"></div>

    <div class="backCover" style="z-index: 3;">
      <div class="w-full h-full backCoverPaper"></div>
      <button class="pageButton" aria-label="pageButton"></button>
    </div>

    <button
      class="ribbon {tweenRibbon.current > 150 ? 'ribbonLong' : 'ribbonShort'}"
      style="height: {tweenRibbon.current}px; z-index: {tweenRibbon.current > 21
        ? 1001
        : 4};"
      onclick={() => {}}
    >
      {#if tweenRibbon.current > 240}
        <span class="ribbonContent">{like ? like : ""}</span>
      {/if}
      {#if tweenRibbon.current > 21}
        <span
          class="ribbonTail {tweenRibbon.current > 150
            ? 'ribbonTailLong'
            : 'ribbonTailShort'}"
        ></span>
      {/if}
    </button>
  </div>
</section>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
</style>
