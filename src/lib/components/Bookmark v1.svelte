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
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt dignissimos fugiat laudantium aperiam ea enim mollitia quam vero, quos dolore eius, accusantium, officiis fuga ullam! Excepturi ab fuga laboriosam voluptas maiores! Sequi velit ea, consectetur exercitationem unde totam, delectus eligendi nisi minima doloribus alias, perferendis nam placeat nemo voluptatibus magnam esse quam. Expedita, ut quo provident nostrum enim alias consequuntur saepe amet eaque et nisi adipisci quibusdam sapiente doloribus suscipit fugit laborum reprehenderit omnis facilis magnam dignissimos excepturi dicta, dolores tenetur. Ipsum quae nulla earum repellendus ex ipsam quia voluptates assumenda porro magni recusandae commodi ab, eligendi delectus illum unde molestias aut amet. Praesentium mollitia eos, hic pariatur velit quidem non ut labore eum, sequi, officiis accusantium quas voluptate. Soluta debitis facere molestiae ad reiciendis? Nisi necessitatibus ex alias non velit error sint fugiat nostrum? Nemo, natus ut, iure molestiae illo delectus sint sed quos eius provident vero. Officia quo a asperiores est totam voluptates rem omnis recusandae at! Reprehenderit perferendis voluptatibus doloribus ex asperiores ducimus! Debitis quia praesentium exercitationem repudiandae dignissimos? Facere, sequi tempora! Ipsa corporis quisquam delectus commodi officiis aperiam modi animi in asperiores beatae, eaque nihil atque repudiandae pariatur! Vitae repellendus non itaque cumque. Quae dolores molestiae, iste ab iure aliquam quasi dolorem, nam quam incidunt illum quia in fugit placeat distinctio possimus autem exercitationem iusto. Laboriosam nesciunt hic asperiores iste odit repellendus, quos blanditiis optio! Necessitatibus repellendus porro tempora itaque, veritatis harum vel alias veniam magni exercitationem sed dolor, adipisci repellat velit architecto voluptatibus culpa doloremque, minima esse quo recusandae dolorem error cumque. Ea, laborum voluptas dolores esse voluptates debitis, in atque magnam voluptatibus eligendi eveniet provident commodi. Quisquam, sint sed? Mollitia, beatae dignissimos neque eligendi blanditiis, obcaecati eaque repudiandae consectetur hic totam quia doloribus, labore perferendis facere atque maxime. Quisquam nulla ea veniam quia, vero accusantium, quam ex suscipit maiores rem dicta laborum quas cumque. Beatae officiis repudiandae itaque eveniet velit fugiat natus. Voluptates enim repudiandae recusandae aliquid. Incidunt reprehenderit eligendi reiciendis consectetur earum ratione eius. Eligendi excepturi porro odit aliquid odio nam laboriosam blanditiis quaerat culpa voluptas sunt consequatur, cupiditate nihil, illo dolore libero accusantium ipsum maiores beatae eius qui ipsa numquam harum. Assumenda quod beatae eaque neque nostrum impedit totam voluptatem animi voluptates rem culpa dicta ex fugiat aspernatur vero explicabo reprehenderit error, corrupti libero! Blanditiis quas ad a delectus dicta similique facilis.";
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

    return chunks;
  }

  const pages = splitWithFirstMaxLength(content, 510, 600);
  console.log(pages);
</script>

<div class="flex flex-col items-center justify-center flex-1 h-full">
  <!-- <div class="book">
    <label class="book-page book-page-1" for="page-1">
      <p class="book-content">{pages[0]}</p>
    </label>

    <label class="book-page book-page-4" for="page-2">
      <p class="book-content">{pages[3]}</p>
    </label>

    <input type="radio" name="page" id="page-1" />
    <input type="radio" name="page" id="page-2" />
    <div class="book-page book-page-2">
      <div class="book-page-front">
        <p class="book-content">{pages[1]}</p>
      </div>
      <div class="book-page-back">
        <p class="book-content">{pages[2]}</p>
      </div>
    </div>
  </div> -->

  <div class="book">
    <label class="book-page book-page-1" for="page-1">
      <p class="book-content">{pages[0]}</p>
    </label>

    <label class="book-page book-page-4" for="page-2">
      <p class="book-content">{pages[3]}</p>
    </label>
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
  /* --body-bg: #fafafa;
    --page-bg: #f5f5f5;
    --dark-text: #2a2935; */

  .book {
    width: 750px;
    height: 550px;
    display: flex;
    perspective: 2000px;
  }

  .book::before {
    content: "";
    position: absolute;
    width: 770px;
    height: 550px;
    top: 0;
    left: -10px;
    background-color: #e5e5e5;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  }

  .book-page {
    position: relative;
    width: 50%;
    height: 100%;
    display: grid;
    transform: rotateY(0deg);
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transform-origin: 0% 0%;
    background-color: #f5f5f5;
    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
    border: 1px solid rgba(204, 204, 204, 0.7);
  }
  .book-page:nth-of-type(1) {
    background-image: linear-gradient(
      -90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
  }

  .book-page-1 {
    cursor: pointer;
    overflow: hidden;
  }

  .book-page-2 {
    position: absolute;
    right: 0;
    pointer-events: none;
    transform-style: preserve-3d;
    background-color: #f5f5f5;
    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
  }
  .book-page-4 {
    cursor: pointer;
  }

  .book-page-front {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: rotateY(0deg) translateZ(1px);
  }
  .book-page-back {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: rotateY(180deg) translateZ(1px);
  }

  .flipped {
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transform: rotateY(-180deg);
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
  }
  /* 
  .book-page-1 .book-content,
  .book-page-back .book-content {
    padding: 50px 25px 50px 45px;
  }

  .book-page-4 .book-content,
  .book-page-front .book-content {
    padding: 50px 45px 50px 25px;
  } */

  .book-page-1 .book-content::first-letter {
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

  .book input[type="radio"] {
    display: none;
  }
  .book input[type="radio"]:checked + .book-page {
    transition: transform 0.9s cubic-bezier(0.645, 0.045, 0.355, 1);
    transform: rotateY(-180deg);
  }
</style>
