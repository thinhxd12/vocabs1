<script lang="ts">
  import { Tween } from "svelte/motion";
  import { untrack } from "svelte";
  import cup from "$lib/assets/images/cup.webp";

  // https://github.com/pqina/flip/blob/master/src/js/index.js
  interface Props {
    number: number;
    duration?: number;
    delay?: number;
    image?: boolean;
  }

  let { number, duration = 800, delay = 0, image = false }: Props = $props();

  let oldNumber = $state<number>(0);
  let newNumber = $state<number>(0);

  // svelte-ignore state_referenced_locally
  let visual_progress = new Tween(0, {
    duration,
    delay,
    easing: easeOutBounce,
  });

  function easeOutCubic(t: number) {
    let t1 = t - 1;
    return t1 * t1 * t1 + 1;
  }

  function easeOutSine(t: number) {
    return Math.sin(t * (Math.PI / 2));
  }

  function easeOutBounce(t: number) {
    let scaledTime = t / 1;
    if (scaledTime < 1 / 2.75) {
      return 7.5625 * scaledTime * scaledTime;
    } else if (scaledTime < 2 / 2.75) {
      let scaledTime2 = scaledTime - 1.5 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
    } else if (scaledTime < 2.5 / 2.75) {
      let _scaledTime = scaledTime - 2.25 / 2.75;
      return 7.5625 * _scaledTime * _scaledTime + 0.9375;
    } else {
      let _scaledTime2 = scaledTime - 2.625 / 2.75;
      return 7.5625 * _scaledTime2 * _scaledTime2 + 0.984375;
    }
  }

  function shadowProgress(vp: number) {
    let shadowProgress = 0;
    let d = Math.abs(vp - 0.5);
    if (d < 1) {
      shadowProgress = vp;
    }
    return shadowProgress < 0.5
      ? easeOutSine(shadowProgress / 0.5)
      : easeOutSine((1 - shadowProgress) / 0.5);
  }

  $effect(() => {
    number;
    untrack(() => {
      visual_progress.set(0, { duration: 0 });
      visual_progress.target = 1;
      setTimeout(() => {
        newNumber = number;
      }, delay);
      setTimeout(() => {
        oldNumber = number;
      }, duration + delay);
    });
  });
</script>

<span class="tick-flip">
  <span class="tick-flip-card">
    <span
      class="tick-flip-panel-front tick-flip-front tick-flip-panel"
      style="transform: rotateX(0deg);"
    >
      <span class="tick-flip-panel-front-text">
        <span class="tick-flip-panel-text-wrapper">
          {#if image}
            <img alt="cup" src={cup} />
          {:else}
            {newNumber}
          {/if}
        </span>
      </span>
      <span class="tick-flip-panel-front-shadow" style="opacity: 0;"> </span>
    </span>
    <span
      class="tick-flip-panel-back tick-flip-back tick-flip-panel"
      style="transform: rotateX(-180deg);"
    >
      <span class="tick-flip-panel-back-text">
        <span class="tick-flip-panel-text-wrapper"></span>
      </span>
      <span class="tick-flip-panel-back-highlight" style="opacity: 2;"> </span>
      <span class="tick-flip-panel-back-shadow" style="opacity: 0;"></span>
    </span>
  </span>

  <span
    class="tick-flip-card"
    style="z-index: {visual_progress.current > 0.5 ? 10 : 1};"
  >
    <span
      class="tick-flip-panel-front tick-flip-front tick-flip-panel"
      style="transform: rotateX({visual_progress.current * -180}deg);"
    >
      <span class="tick-flip-panel-front-text">
        <span class="tick-flip-panel-text-wrapper">
          {oldNumber}
        </span>
      </span>
      <span
        class="tick-flip-panel-front-shadow"
        style="opacity: {1 - Math.abs(visual_progress.current - 0.5) * 2};"
      >
      </span>
    </span>
    <span
      class="tick-flip-panel-back tick-flip-back tick-flip-panel"
      style="transform: rotateX({-180 + visual_progress.current * -180}deg);"
    >
      <span class="tick-flip-panel-back-text">
        <span class="tick-flip-panel-text-wrapper">
          {#if image}
            <img alt="cup" src={cup} />
          {:else}
            {newNumber}
          {/if}
        </span>
      </span>
      <span
        class="tick-flip-panel-back-highlight"
        style="opacity: {1 - (visual_progress.current - 0.5) / 0.5};"
      >
      </span>
      <span class="tick-flip-panel-back-shadow" style="opacity: 0;"></span>
    </span>
  </span>

  <span class="tick-flip-card">
    <span
      class="tick-flip-panel-front tick-flip-front tick-flip-panel"
      style="transform: rotateX(-180deg); z-index: 2;"
    >
      <span class="tick-flip-panel-front-text">
        <span class="tick-flip-panel-text-wrapper">
          {oldNumber}
        </span>
      </span>
      <span class="tick-flip-panel-front-shadow" style="opacity: 0;"> </span>
    </span>
    <span
      class="tick-flip-panel-back tick-flip-back tick-flip-panel"
      style="transform: rotateX(-360deg);"
    >
      <span class="tick-flip-panel-back-text">
        <span class="tick-flip-panel-text-wrapper">
          {oldNumber}
        </span>
      </span>
      <span class="tick-flip-panel-back-highlight" style="opacity: 0;"> </span>
      {#if visual_progress.current > 0.5 && visual_progress.current > 0}
        <span
          class="tick-flip-panel-back-shadow"
          style="opacity: {easeOutCubic(visual_progress.current)};"
        ></span>
      {/if}
    </span>
  </span>

  <span class="tick-flip-spacer">{number}</span>
  <span class="tick-flip-shadow-top tick-flip-shadow tick-flip-front"></span>
  <span class="tick-flip-shadow-bottom tick-flip-shadow tick-flip-back"></span>
  <span
    class="tick-flip-card-shadow"
    style="opacity: {shadowProgress(
      visual_progress.current,
    )}; transform: scaleY( {shadowProgress(visual_progress.current)});"
  ></span>
</span>

<style lang="postcss">
  .tick-flip {
    position: relative;
    text-align: center;
    min-width: 0.72em;
    border-radius: 0.08em;
  }

  .tick-flip * {
    border-radius: inherit;
    white-space: pre;
  }

  .tick-flip * {
    letter-spacing: inherit;
    text-indent: inherit;
  }

  .tick-flip-panel {
    color: rgba(255, 255, 255, 0.85);
    background: url("$lib/assets/images/clock.png");
  }

  .tick-flip-front {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .tick-flip-back {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .tick-flip-spacer {
    display: block;
    visibility: hidden;
  }

  .tick-flip-shadow {
    position: absolute;
    left: 1px;
    right: 1px;
    top: 1px;
    bottom: 1px;
    color: transparent !important;
    background: transparent !important;
    box-shadow:
      0 0.125em 0.3125em rgba(0, 0, 0, 0.25),
      0 0.02125em 0.06125em rgba(0, 0, 0, 0.25);
  }

  .tick-flip-shadow-top {
    bottom: calc(50% - 1px);
  }

  .tick-flip-shadow-bottom {
    top: calc(50% + 1px);
  }

  .tick-flip-card-shadow {
    position: absolute;
    left: 0.15em;
    right: 0.15em;
    bottom: 0.125em;
    height: 0.5em;
    background-color: transparent;
    border-radius: 0;
    opacity: 0;
    -webkit-transform-origin: 0 100%;
    transform-origin: 0 100%;
    box-shadow:
      0 0.125em 0.25em rgba(0, 0, 0, 0.5),
      0 0.125em 0.5em rgba(0, 0, 0, 0.75);
    z-index: 0;
  }

  /* CARD */
  .tick-flip-card {
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    -webkit-perspective: 4em;
    perspective: 4em;
  }

  .tick-flip-panel-front,
  .tick-flip-panel-back {
    position: absolute;
    left: 0;
    width: 100%;
    height: 51%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
  }

  .tick-flip-panel-front-text,
  .tick-flip-panel-back-text {
    position: absolute;
    left: -1px;
    top: 0;
    right: -1px;
    height: 100%;
    overflow: hidden;
  }

  .tick-flip-panel-text-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 100%;
  }

  .tick-flip-panel-text-wrapper img {
    position: absolute;
    left: 12%;
    top: 0;
    width: 76%;
    height: auto;
    object-fit: cover;
  }

  .tick-flip-panel-back-text .tick-flip-panel-text-wrapper {
    height: 200%;
    top: -100%;
  }

  .tick-flip-panel-front {
    -webkit-transform-origin: center bottom;
    transform-origin: center bottom;
    top: 0;
    z-index: 2;
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.05);
  }

  .tick-flip-panel-back {
    -webkit-transform-origin: center top;
    transform-origin: center top;
    top: 50%;
    z-index: 1;
    box-shadow: inset 0 -1px rgba(0, 0, 0, 0.1);
  }
  .tick-flip-panel-back::after {
    z-index: 1;
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: -webkit-linear-gradient(
      top,
      rgba(0, 0, 0, 0.3) 1px,
      rgba(0, 0, 0, 0.15) 1px,
      rgba(0, 0, 0, 0) 30%
    );
    background-image: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 1px,
      rgba(0, 0, 0, 0.15) 1px,
      rgba(0, 0, 0, 0) 30%
    );
  }

  .tick-flip-panel-back-shadow {
    z-index: 2;
  }

  .tick-flip-panel-back-highlight {
    z-index: 3;
  }

  .tick-flip-panel-back-shadow,
  .tick-flip-panel-back-highlight {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }

  .tick-flip-panel-front-shadow,
  .tick-flip-panel-back-shadow,
  .tick-flip-panel-back-highlight {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }

  .tick-flip-panel-front-shadow {
    background-image: -webkit-linear-gradient(
      bottom,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.3)
    );
    background-image: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.3)
    );
  }

  .tick-flip-panel-back-shadow {
    background-image: -webkit-linear-gradient(
      top,
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.5)
    );
    background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.5)
    );
  }

  .tick-flip-panel-back-highlight {
    background-image: -webkit-linear-gradient(
      top,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.3)
    );
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.3)
    );
  }
</style>
