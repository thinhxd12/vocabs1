<script lang="ts">
  import type { BookPageContentType } from "$lib/types";
  import { Spring } from "svelte/motion";

  const tween = new Spring(0, {
    stiffness: 0.06,
    damping: 0.4,
  });

  interface Props {
    data: BookPageContentType;
    innerWidth: number;
    innerHeight: number;
    length: number;
    handleFlip: (id: number) => void;
  }

  let { data, innerWidth, innerHeight, length, handleFlip }: Props = $props();

  $effect(() => {
    if (data.flip) {
      tween.target = -180;
    } else {
      tween.target = 0;
    }
  });
</script>

<div
  class="flip"
  style="z-index: {tween.current <= -90
    ? 4 + data.id
    : 4 + length - data.id}; transform: rotateY({tween.current}deg);"
>
  <div
    class="frontPage frontPaper"
    class:highlightContentFirstPage={data.id === 1}
  >
    <div
      class="highlightContent"
      style="width: {innerWidth}px; height: {innerHeight}px;  margin: 3rem 3rem 3rem calc(4rem - {tween.current <=
      -90
        ? 2 * data.id
        : 2 * (1 + length - data.id)}px);"
    >
      {@html data.front}
    </div>
    <span class="pageNumber">{2 * data.id - 1}.</span>
    <button
      class="pageButton"
      aria-label="pageButton"
      onclick={() => handleFlip(data.id)}
    >
      {#if !data.flip}
        <div class="pageFold"></div>
      {/if}
    </button>
  </div>
  <div class="backPage backPaper">
    <div
      class="highlightContent"
      style="width: {innerWidth}px; height: {innerHeight}px;  margin: 3rem calc(3rem - {tween.current <=
      -90
        ? 2 * data.id
        : 2 * (1 + length - data.id)}px) 3rem 4rem;"
    >
      {@html data.back}
    </div>

    <span class="pageNumber">{2 * data.id}.</span>
    <button
      class="pageButton"
      aria-label="pageButton"
      onclick={() => handleFlip(data.id)}
    >
      {#if data.flip}
        <div class="pageFold"></div>
      {/if}
    </button>
  </div>
</div>

<style lang="postcss">
  .flip {
    transform-style: preserve-3d;
    position: absolute;
    bottom: 12px;
    top: 12px;
  }

  .frontPage {
    position: absolute;
    user-select: text;
    top: 0;
    left: 0;
    z-index: 0;
    backface-visibility: hidden;
    box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.45);
  }

  .backPage {
    position: absolute;
    user-select: text;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    z-index: 1;
    transform: rotateY(180deg);
    box-shadow: -2px 0px 2px rgba(0, 0, 0, 0.45);
  }

  .frontPaper {
    background: linear-gradient(
      to right,
      #d9d9d9 0%,
      #f9f9f9 9%,
      #ffffff 12%,
      #ffffff 100%
    );
  }

  .backPaper {
    background: linear-gradient(
      to right,
      #ffffff 0%,
      #ffffff 88%,
      #f9f9f9 91%,
      #d9d9d9 100%
    );
  }

  .pageNumber {
    position: absolute;
    bottom: 1.5rem;
    font-family: "Copernicus", sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #1e1915;
  }

  .frontPage .pageNumber {
    right: 2.5rem;
  }

  .backPage .pageNumber {
    left: 2.5rem;
  }

  .pageButton {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
  }

  .frontPage .pageButton {
    right: 0;
  }

  .backPage .pageButton {
    left: 0;
  }

  .pageFold {
    position: absolute;
    width: 0px;
    height: 0px;
    transition: all 150ms;
  }

  .frontPage .pageFold {
    top: 0;
    right: 0;
    border-left-width: 1px;
    border-left-color: #dddddd;
    border-left-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: -4px 4px 10px #a4a4a4;
  }

  .backPage .pageFold {
    top: 0;
    left: 0;
    border-right-width: 1px;
    border-right-color: #dddddd;
    border-right-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: 4px 4px 10px #a4a4a4;
  }

  .frontPage .pageButton:hover .pageFold {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      45deg,
      rgb(254, 254, 254) 0%,
      rgb(242, 242, 242) 49%,
      rgb(255, 255, 255) 50%,
      rgb(255, 255, 255) 100%
    );
  }

  .backPage .pageButton:hover .pageFold {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      135deg,
      rgb(255, 255, 255) 0%,
      rgb(255, 255, 255) 50%,
      rgb(242, 242, 242) 51%,
      rgb(254, 254, 254) 100%
    );
  }
</style>
