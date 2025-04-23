<script lang="ts">
  // let pages = ["Page 2", "Page 4", "Page 6"];
  // let flippedPages = [];

  // function flipRight() {
  //   if (flippedPages.length < pages.length) {
  //     flippedPages = [...flippedPages, flippedPages.length];
  //   }
  // }

  // function flipLeft() {
  //   if (flippedPages.length > 0) {
  //     flippedPages = flippedPages.slice(0, -1);
  //   }
  // }

  function splitIntoPages(content, charLimit = 1000) {
    const sentences = content.match(/[^.!?]+[.!?]*/g) || [];
    const pages = [];
    let currentPage = "";
    let currentLength = 0;

    for (let sentence of sentences) {
      if (currentLength + sentence.length > charLimit && currentPage) {
        pages.push(currentPage.trim());
        currentPage = "";
        currentLength = 0;
      }
      currentPage += sentence + " ";
      currentLength += sentence.length;
    }

    if (currentPage) {
      pages.push(currentPage.trim());
    }
    // if (pages.length % 2 !== 0) pages.push("");

    return pages;
  }

  let aaa =
    "when he sank, then you saw a lifeboat full of children with a helicopter hovering over it. there was a middle-aged woman might have been a Jewess sitting up in the bow with a little boy about three years old in her arms, little boy screaming with fright and hiding his head between her breasts as if he was trying to burrow right into her and the woman putting her arms round him and comforting him although she was blue with fright herself all the time covering him up as much as possible as if she thought her arms could keep the bullets off him. then the helicopter planted a 20 kilo bomb in among them terrific flash and the boat went all to matchwood, then there was a wonderful shot of a child’s arm going up up up right up into the air a helicopter with a camera in its nose must have followed it up and there was a lot of applause from the party seats but a woman down in the prole part of the house suddenly started kicking up a fuss and shouting they didnt oughter of showed it not in front of kids they didnt it aint right not in front of kids it aint until the police turned her turned her out i dont suppose anything happened to her nobody cares what the proles say typical prole reaction they never - Winston stopped writing, partly because he was suffer¬ ing from cramp. He did not know what had made him pour out this stream of rubbish. But the curious thing was that while he was doing so a totally different memory had clar¬ ified itself in his mind, to the point where he almost felt equal to writing it down. It was, he now realized, because of this other incident that he had suddenly decided to come 12 1984.";

  const pages = splitIntoPages(aaa);

  // function roundToEven(n) {
  //   return 2 * Math.round(n / 2);
  // }
  // console.log(roundToEven(3));
  console.log(pages);
</script>

<main
  class="w-screen h-[calc(100vh-42px)] flex flex-col overflow-y-scroll no-scrollbar"
>
  <!-- <div class="book-container">
    <div class="page left static-page">
      <p>Page 1</p>
    </div>

    {#each pages as page, i}
      <div
        class="page right"
        class:flipped={flippedPages.includes(i)}
        style="z-index: {100 - i}"
      >
        <p>{page}</p>
      </div>
    {/each}
  </div> -->
  <div class="book-container">
    {#each pages as page, i}
      <div class="page" style="z-index: {i};">
        <p>{page}</p>
      </div>
    {/each}
    <!-- <div class="page" style="z-index: 1; transform: rotateY(76deg);">
      <div class="page-front"><p>{pages[0]}</p></div>
      <div class="page-back"><p>{pages[0]}</p></div>
    </div> -->
  </div>

  <!-- <div class="controls">
    <button on:click={flipLeft}>⬅️ Flip Left</button>
    <button on:click={flipRight}>➡️ Flip Right</button>
  </div> -->
</main>

<style>
  .book-container {
    position: relative;
    width: 600px;
    height: 400px;
    perspective: 2000px;
    margin: 2rem auto;
    /* background-color: green; */
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 1s ease;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  .page p {
    font-size: 12px;
    width: 100%;
    height: 100%;
    padding: 15px;
  }

  .left {
    left: 0;
    border-right: none;
    z-index: 101;
  }

  .static-page {
    background-color: #f5f5f5;
  }

  .right {
    right: 0;
    transform-origin: left;
  }

  .right.flipped {
    transform: rotateY(-180deg);
  }
  .controls {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
    gap: 1rem;
    position: relative;
  }
</style>
