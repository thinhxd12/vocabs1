<script lang="ts">
  interface Props {
    number: number;
    duration?: number;
    delay?: number;
    image?: boolean;
  }
  import { Tween } from "svelte/motion";
  import { bounceOut } from "svelte/easing";
  import { untrack } from "svelte";
  import cup from "$lib/assets/images/cup.webp";

  let { number, duration = 900, delay = 0, image = false }: Props = $props();
  let fromNumber = $state(0);
  let toNumber = $state(0);

  // svelte-ignore state_referenced_locally
  let visualProgress = new Tween(0, {
    duration: duration,
    delay: delay,
    easing: bounceOut,
  });

  $effect(() => {
    const v = number;
    untrack(() => {
      toNumber = number;
      visualProgress.set(0, { duration: 0 });
      visualProgress.target = 1;
    });
  });

  $effect(() => {
    if (visualProgress.current === 1) {
      fromNumber = number;
    }
  });

  const easeOutCubic = (t: number) => {
    let t1 = t - 1;
    return t1 * t1 * t1 + 1;
  };

  const easeOutSine = (t: number) => {
    return Math.sin(t * (Math.PI / 2));
  };

  const cardShadow = () => {
    const visual_progress = visualProgress.current;
    let shadowProgress = 0;
    let dist = 1;

    let d = Math.abs(visual_progress - 0.5);
    if (d < dist) {
      dist = d;
      shadowProgress = visual_progress;
    }
    let s =
      shadowProgress < 0.5
        ? easeOutSine(shadowProgress / 0.5)
        : easeOutSine((1 - shadowProgress) / 0.5);
    return visual_progress < 1 ? s : 0;
  };
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
            {toNumber}
          {/if}
        </span>
      </span>
      <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
    </span>
    <span
      class="tick-flip-panel-back tick-flip-back tick-flip-panel"
      style="transform: rotateX(-180deg);"
    >
      <span class="tick-flip-panel-back-text">
        <span class="tick-flip-panel-text-wrapper"></span>
      </span>
      <span class="tick-flip-panel-back-highlight" style="opacity: 2;"></span>
      <span class="tick-flip-panel-back-shadow"></span>
    </span>
  </span>

  {#if visualProgress.current !== 1}
    <span
      class="tick-flip-card"
      style="z-index: {visualProgress.current > 0.5 ? 10 : 1}"
    >
      <span
        class="tick-flip-panel-front tick-flip-front tick-flip-panel"
        style="transform: rotateX({visualProgress.current * -180}deg)"
      >
        <span class="tick-flip-panel-front-text">
          <span class="tick-flip-panel-text-wrapper">{fromNumber}</span>
        </span>
        <span
          class="tick-flip-panel-front-shadow"
          style="opacity: {1 - Math.abs(visualProgress.current - 0.5) * 2}"
        ></span>
      </span>

      <span
        class="tick-flip-panel-back tick-flip-back tick-flip-panel"
        style="transform: rotateX({-180 + visualProgress.current * -180}deg)"
      >
        <span class="tick-flip-panel-back-text">
          <span class="tick-flip-panel-text-wrapper">
            {#if image}
              <img alt="cup" src={cup} />
            {:else}
              {toNumber}
            {/if}
          </span>
        </span>
        <span
          class="tick-flip-panel-back-highlight"
          style="opacity: {1 - (visualProgress.current - 0.5) / 0.5}"
        ></span>
        <span class="tick-flip-panel-back-shadow" style="opacity: 0;"></span>
      </span>
    </span>
  {/if}

  <span class="tick-flip-card" style="">
    <span
      class="tick-flip-panel-front tick-flip-front tick-flip-panel"
      style="transform: rotateX(-180deg);"
    >
      <span class="tick-flip-panel-front-text">
        <span class="tick-flip-panel-text-wrapper">{fromNumber}</span>
      </span>
      <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
    </span>
    <span
      class="tick-flip-panel-back tick-flip-back tick-flip-panel"
      style="transform: rotateX(-360deg);"
    >
      <span class="tick-flip-panel-back-text">
        <span class="tick-flip-panel-text-wrapper">
          {#if image && visualProgress.current === 1}
            <img alt="cup" src={cup} />
          {:else}
            {fromNumber}
          {/if}
        </span>
      </span>
      <span class="tick-flip-panel-back-highlight" style="opacity: 0;"></span>
      {#if visualProgress.current < 0.5}
        <span
          class="tick-flip-panel-back-shadow"
          style="opacity: {easeOutCubic(visualProgress.current)}"
        ></span>
      {/if}
    </span>
  </span>

  <span class="tick-flip-spacer">{number}</span>
  <span class="tick-flip-shadow-top tick-flip-shadow tick-flip-front"></span>
  <span class="tick-flip-shadow-bottom tick-flip-shadow tick-flip-back"></span>
  <span
    class="tick-flip-card-shadow"
    style="opacity: {cardShadow()};
      transform: scaleY({cardShadow()})"
  ></span>
</span>

<style>
  .tick-flip {
    position: relative;
    text-align: center;
    border-radius: 3px;
    letter-spacing: 3px;
    text-indent: 3px;
    overflow: hidden;
  }

  .tick-flip:nth-child(2) {
    margin: 0 2px;
  }

  .tick-flip * {
    border-radius: inherit;
    white-space: pre;
    letter-spacing: inherit;
    text-indent: inherit;
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
    transform-origin: 0 100%;
    box-shadow:
      0 0.125em 0.25em rgba(0, 0, 0, 0.5),
      0 0.125em 0.5em rgba(0, 0, 0, 0.75);
    z-index: 0;
  }
  .tick-flip-card {
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    perspective: 4em;
  }
  .tick-flip-panel-back,
  .tick-flip-panel-front {
    position: absolute;
    left: 0;
    width: 100%;
    height: 51%;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
  .tick-flip-panel-back-text,
  .tick-flip-panel-front-text {
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
    left: 10%;
    width: 80%;
  }
  .tick-flip-panel-back-text .tick-flip-panel-text-wrapper {
    height: 200%;
    top: -100%;
  }
  .tick-flip-panel-front {
    transform-origin: center bottom;
    top: 0;
    z-index: 2;
    box-shadow: inset 0 1px hsla(0, 0%, 100%, 0.05);
  }
  .tick-flip-panel-back {
    transform-origin: center top;
    top: 50%;
    z-index: 1;
    box-shadow: inset 0 -1px rgba(0, 0, 0, 0.1);
  }
  .tick-flip-panel-back:after {
    z-index: 1;
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.3) 1px,
      rgba(0, 0, 0, 0.15) 0,
      transparent 30%
    );
  }
  .tick-flip-panel-back-shadow {
    z-index: 2;
  }
  .tick-flip-panel-back-highlight {
    z-index: 3;
  }
  .tick-flip-panel-back-highlight,
  .tick-flip-panel-back-shadow {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
  .tick-flip-panel-back-highlight,
  .tick-flip-panel-back-shadow,
  .tick-flip-panel-front-shadow {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
  .tick-flip-panel-front-shadow {
    background-image: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.3)
    );
  }
  .tick-flip-panel-back-shadow {
    background-image: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.5)
    );
  }
  .tick-flip-panel-back-highlight {
    background-image: linear-gradient(
      180deg,
      hsla(0, 0%, 100%, 0.15),
      hsla(0, 0%, 100%, 0.3)
    );
  }

  .tick-flip-panel {
    color: #f8f5f5;
    background-color: #1c1c1c;
  }
  .tick-flip-shadow {
    box-shadow:
      0 0.125em 0.3125em rgba(0, 0, 0, 0.25),
      0 0.02125em 0.06125em rgba(0, 0, 0, 0.25);
  }
</style>
