<script>
  let flipped = false;

  function flipRight() {
    flipped = true;
  }

  function flipLeft() {
    flipped = false;
  }

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
  console.log(pages);
</script>

<div class="book-container">
  <!-- Page 1 -->
  <div class="page left-page">
    <p>{pages[0]}</p>
  </div>

  <!-- Page 2 (flipping) -->
  <div class="page flip-page {flipped ? 'flipped' : ''}">
    <div class="face front">
      <p>{pages[1]}</p>
    </div>
    <div class="face back">
      <p>{pages[2]}</p>
    </div>
  </div>

  <!-- Page 3 -->
  <div class="page right-page">
    <p>{pages[3]}</p>
  </div>
</div>

<!-- Controls -->
<div class="controls">
  <button on:click={flipLeft}>⬅️ Flip Left</button>
  <button on:click={flipRight}>➡️ Flip Right</button>
</div>

<style>
  .book-container {
    position: relative;
    width: 600px;
    height: 400px;
    margin: auto;
    perspective: 2000px;
    display: flex;
  }

  .page {
    width: 50%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .page p,
  .face p {
    font-size: 12px;
    line-height: 16px;
  }

  .left-page {
    z-index: 1;
    border-right: 1px solid #ccc;
  }

  .right-page {
    z-index: 1;
    border-left: 1px solid #ccc;
  }

  .flip-page {
    position: absolute;
    left: 50%;
    top: 0;
    width: 50%;
    height: 100%;
    transform-style: preserve-3d;
    transform-origin: left;
    transition: transform 0.3s ease;
    z-index: 3;
  }

  .flip-page .face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    padding: 16px;
  }

  .flip-page .front {
    border-left: 1px solid #ccc;
    z-index: 9;
  }

  .flip-page .back {
    transform: rotateY(180deg);
    background: #f0f0f0;
    border-left: 1px solid #ccc;
    z-index: 8;
  }

  .flip-page.flipped .back {
    z-index: 11;
    transform: rotateY(0deg);
  }

  .flip-page .back > * {
    transform: rotateY(180deg);
  }

  .flip-page.flipped {
    transform: rotateY(-180deg);
  }

  .controls {
    text-align: center;
    margin-top: 1rem;
  }
</style>
