<script lang="ts">
  import Icon from "@iconify/svelte";

  let flipped = false;

  function flipRight() {
    flipped = true;
  }

  function flipLeft() {
    flipped = false;
  }

  let content =
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt dignissimos fugiat laudantium aperiam ea enim mollitia quam vero, quos dolore eius, accusantium, officiis fuga ullam! Excepturi ab fuga laboriosam voluptas maiores! Sequi velit ea, consectetur exercitationem unde totam, delectus eligendi nisi minima doloribus alias, perferendis nam placeat nemo voluptatibus magnam esse quam. Expedita, ut quo provident nostrum enim alias consequuntur saepe amet eaque et nisi adipisci quibusdam sapiente doloribus suscipit fugit laborum reprehenderit omnis facilis magnam dignissimos excepturi dicta, dolores tenetur. Ipsum quae nulla earum repellendus ex ipsam quia voluptates assumenda porro magni recusandae commodi ab, eligendi delectus illum unde molestias aut amet. Praesentium mollitia eos, hic pariatur velit quidem non ut labore eum, sequi, officiis accusantium quas voluptate. Soluta debitis facere molestiae ad reiciendis? Nisi necessitatibus ex alias non velit error sint fugiat nostrum? Nemo, natus ut, iure molestiae illo delectus sint sed quos eius provident vero. Officia quo a asperiores est totam voluptates rem omnis recusandae at! Reprehenderit perferendis voluptatibus doloribus ex asperiores ducimus! Debitis quia praesentium exercitationem repudiandae dignissimos? Facere, sequi tempora! Ipsa corporis quisquam delectus commodi officiis aperiam modi animi in asperiores beatae, eaque nihil atque repudiandae pariatur! Vitae repellendus non itaque cumque. Quae dolores molestiae, iste ab iure aliquam quasi dolorem, nam quam incidunt illum quia in fugit placeat distinctio possimus autem exercitationem iusto. Laboriosam nesciunt hic asperiores iste odit repellendus, quos blanditiis optio! Necessitatibus repellendus porro tempora itaque, veritatis harum vel alias veniam magni exercitationem sed dolor, adipisci repellat velit architecto voluptatibus culpa doloremque, minima esse quo recusandae dolorem error cumque. Ea, laborum voluptas dolores esse voluptates debitis, in atque magnam voluptatibus eligendi eveniet provident commodi. Quisquam, sint sed? Mollitia, beatae dignissimos neque eligendi blanditiis, obcaecati eaque repudiandae consectetur hic totam quia doloribus, labore perferendis facere atque maxime. Quisquam nulla ea veniam quia, vero accusantium, quam ex suscipit maiores rem dicta laborum quas cumque. Beatae officiis repudiandae itaque eveniet velit fugiat natus. Voluptates enim repudiandae recusandae aliquid. Incidunt reprehenderit eligendi reiciendis consectetur earum ratione eius. Eligendi excepturi porro odit aliquid odio nam laboriosam blanditiis quaerat culpa voluptas sunt consequatur, cupiditate nihil, illo dolore libero accusantium ipsum maiores beatae eius qui ipsa numquam harum. Assumenda quod beatae eaque neque nostrum.  Ipsa corporis quisquam delectus commodi officiis aperiam modi animi in asperiores beatae, eaque nihil atque repudiandae pariatur! Vitae repellendus non itaque cumque. Quae dolores molestiae, iste ab iure aliquam quasi dolorem, nam quam incidunt illum quia in fugit placeat distinctio possimus autem exercitationem iusto. Laboriosam nesciunt hic asperiores iste odit repellendus, quos blanditiis optio! Necessitatibus repellendus porro tempora itaque,  Assumenda quod beatae eaque neque nostrum 123";
  // console.log(content.length);

  function splitWithFirstMaxLength(text: string, firstLen = 600, maxLen = 600) {
    const words = text.split(" ");
    const chunks = [];
    let currentChunk = "";
    let currentMax = firstLen;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // If adding the word exceeds the current chunk's max length
      if ((currentChunk + " " + word).trim().length > currentMax) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
        currentMax = maxLen; // Switch to maxLen after first page
      } else {
        currentChunk += (currentChunk ? " " : "") + word;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    if (chunks.length % 2 !== 0) chunks.push("");

    return chunks;
  }

  let pages = splitWithFirstMaxLength(content, 510, 600);
  const middle = pages.slice(1, -1);
  // console.log(middle);

  let flipPages = [];
  for (let i = 0; i < middle.length; i += 2) {
    flipPages.push({
      flipLeft: false,
      flipRight: false,
      front: middle[i],
      back: middle[i + 1] || "",
    });
  }
  // console.log(flipPages);
  // import { Tween } from "svelte/motion";
  // import { cubicOut } from "svelte/easing";

  // let progress = new Tween(0, {
  //   duration: 900,
  //   easing: cubicOut,
  // });

  // let isFlipping = $state(false);
</script>

<div class="flex flex-col items-center justify-center flex-1 h-full">
  <!-- <progress value={progress.current}></progress>

  <button onclick={() => (progress.target = 0)}> 0% </button>

  <button onclick={() => (progress.target = 0.25)}> 25% </button> -->

  <div class="book">
    <!-- {#each flipPages as page, i}
      <input type="checkbox" id="c-{i}" class="" />
    {/each} -->
    <div class="cover-front">
      <p class="book-content">{pages[0]}</p>
    </div>

    <div class="flip-book">
      {#each flipPages as page, i}
        <div
          class="flip"
          class:flipped={page.flipLeft}
          style="z-index: {page.flipLeft
            ? flipPages.length - i
            : page.flipRight
              ? flipPages.length - i - 1
              : i + 1};"
        >
          <button
            class="back"
            onclick={() => {
              flipPages[i].flipLeft = false;
              flipPages[i].flipRight = true;
            }}
          >
            <p class="book-content">{page.back}</p>
          </button>
          <button
            class="front"
            onclick={() => {
              flipPages[i].flipLeft = true;
              flipPages[i].flipRight = false;
            }}
          >
            <p class="book-content">{page.front}</p>
          </button>
        </div>

        <!-- <label
          for="c-{i}"
          class="flip"
          id="p-{i}"
          style="z-index: {flipPages.length - i};"
        >
          <div class="back">
            <p class="book-content">{page.back}</p>
          </div>
          <div class="front">
            <p class="book-content">{page.front}</p>
          </div>
        </label> -->
      {/each}

      <div class="cover-back">
        <p class="book-content">{pages[pages.length - 1]}</p>
      </div>
    </div>
  </div>

  <div class="controls">
    <div class="h-[48px] flex justify-center items-baseline p-9">
      <button class="layout-white btn-menu">
        <Icon icon="solar:copy-outline" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu">
        <Icon icon="solar:refresh-outline" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu">
        <Icon icon="solar:document-add-linear" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu">
        <Icon icon="solar:library-linear" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu">
        <Icon icon="solar:trash-bin-trash-outline" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu" onclick={flipLeft}>
        <Icon icon="solar:alt-arrow-left-linear" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu" onclick={flipRight}>
        <Icon icon="solar:alt-arrow-right-linear" width="15" height="15" />
      </button>
    </div>
  </div>
</div>

<style>
  /* #p-0 {
    z-index: 3;
  }
  #p-1 {
    z-index: 2;
  }
  #p-2 {
    z-index: 1;
  } */
  /* #c-0:checked ~ .flip-book #p-0 {
    transform: rotateY(-180deg);
    z-index: 2 !important;
  }
  #c-1:checked ~ .flip-book #p-1 {
    transform: rotateY(-180deg);
    z-index: 3 !important;
  }
  #c-2:checked ~ .flip-book #p-2 {
    transform: rotateY(-180deg);
    z-index: 3 !important;
  } */

  .book {
    display: flex;
  }
  .cover-front {
    width: 375px;
    height: 550px;
    background-color: #f5f5f5;
    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
    cursor: pointer;
  }

  .cover-back {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #f5f5f5;
    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
    cursor: pointer;
  }
  .flip-book {
    width: 375px;
    height: 550px;
    position: relative;
    perspective: 2000px;
  }
  .flip {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: left;
    transform-style: preserve-3d;
    transform: rotateY(0deg);
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    color: #000;
    border: 1px solid rgba(204, 204, 204, 0.7);
    cursor: pointer;
  }

  .flipped {
    transform: rotateY(-180deg);
  }

  .front {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    box-sizing: border-box;

    background-color: #f5f5f5;

    background-image: linear-gradient(
      -90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
  }
  .back {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 99;
    transform: rotateY(180deg);
    backface-visibility: hidden;
    background-color: #f5f5f5;

    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
  }

  .book-content {
    height: 100%;
    width: 100%;
    font-family: GaramondPro, sans-serif;
    font-weight: 400;
    font-size: 18px;
    line-height: 28px;
    padding: 50px 45px;
    overflow: hidden;
    text-align: left;
  }
  .next-btn {
    position: absolute;
    bottom: 13px;
    right: 13px;
    cursor: pointer;
    color: #000;
  }
  .back-btn {
    position: absolute;
    bottom: 13px;
    right: 13px;
    cursor: pointer;
    color: #fff;
  }

  .cover-front .book-content::first-letter {
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
    text-shadow: 0 0 6px rgb(0, 0, 0);
    box-shadow:
      rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  }

  .btn-menu {
    @apply mx-3 flex size-27 items-center justify-center  rounded-3 !bg-white/5 hover:!bg-white/15 transition duration-300 text-black/90;
  }

  .btn-menu:active :global svg {
    transform: scale(1.1);
  }
</style>
