<script lang="ts">
  import RainRenderer from "$lib/utils/rain-renderer";
  import Raindrops from "$lib/utils/raindrop";
  import { showLayout } from "$lib/store/layoutstore";
  import type { BackgroundImageType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { innerWidth, innerHeight } from "svelte/reactivity/window";

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.crossOrigin = "anonymous";
      img.src = src;
    });
  }

  function loadImages(images: { name: string; src: string }[]) {
    return Promise.all(
      images.map((item, i) => {
        return loadImage(item.src);
      })
    );
  }

  function createCanvas(width: number, height: number) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  let canvas = $state<HTMLCanvasElement>();
  let textureRainFg = $state<HTMLImageElement>();
  let textureRainBg = $state<HTMLImageElement>();
  let dropColor = $state<HTMLImageElement>();
  let dropAlpha = $state<HTMLImageElement>();
  let textureFg = $state<HTMLCanvasElement>();
  let textureBg = $state<HTMLCanvasElement>();
  let textureFgCtx = $state<CanvasRenderingContext2D | null>(null);
  let textureBgCtx = $state<CanvasRenderingContext2D | null>(null);

  let textureBgSize = {
    width: innerWidth.current! || 1280,
    height: innerHeight.current! || 720,
  };

  let textureFgSize = {
    width: 96,
    height: 64,
  };

  let raindrops: any, renderer: any;

  function generateTextures(fg: any, bg: any, alpha = 1) {
    textureFgCtx!.globalAlpha = alpha;
    textureFgCtx!.drawImage(
      fg,
      0,
      0,
      textureFgSize.width,
      textureFgSize.height
    );
    textureBgCtx!.globalAlpha = alpha;
    textureBgCtx!.drawImage(
      bg,
      0,
      0,
      textureBgSize.width,
      textureBgSize.height
    );
  }

  function loadTextures() {
    loadImages([
      { name: "dropAlpha", src: "/openmeteo/drop-alpha.png" },
      { name: "dropColor", src: "/openmeteo/drop-color.png" },

      {
        name: "textureRainFg",
        src: "/openmeteo/weather/fg.webp",
      },
      {
        name: "textureRainBg",
        src: "/openmeteo/weather/bg.webp",
      },
    ]).then((images) => {
      dropColor = images[0];
      dropAlpha = images[1];
      textureRainFg = images[2];
      textureRainBg = images[3];

      let dpi = window.devicePixelRatio;

      raindrops = new Raindrops(
        innerWidth.current!,
        innerHeight.current!,
        dpi,
        dropColor,
        dropAlpha
      );

      textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
      textureFgCtx = textureFg.getContext("2d");
      textureBg = createCanvas(textureBgSize.width, textureBgSize.height);
      textureBgCtx = textureBg.getContext("2d");

      generateTextures(textureRainFg, textureRainBg);

      renderer = new RainRenderer(
        canvas,
        raindrops.canvas,
        textureFg,
        textureBg,
        null,
        {
          brightness: 1.04,
          alphaMultiply: 6,
          alphaSubtract: 3,
        }
      );
    });
  }

  const weatherTypes = {
    rain: {
      rainChance: 0.35,
      dropletsRate: 50,
      raining: true,
    },
    storm: {
      maxR: 55,
      rainChance: 0.4,
      dropletsRate: 80,
      dropletsSize: [3, 5.5],
      trailRate: 2.5,
      trailScaleRange: [0.25, 0.4],
    },
    fallout: {
      minR: 30,
      maxR: 60,
      rainChance: 0.35,
      dropletsRate: 20,
      trailRate: 4,
      collisionRadiusIncrease: 0,
    },
    drizzle: {
      minR: 10,
      maxR: 40,
      rainChance: 0.15,
      rainLimit: 2,
      dropletsRate: 10,
      dropletsSize: [3.5, 6],
    },
    sunny: {
      rainChance: 0,
      rainLimit: 0,
      droplets: 0,
      raining: false,
    },
  };

  const defaultRain = {
    raining: true,
    minR: 20,
    maxR: 50,
    rainChance: 0.35,
    rainLimit: 6,
    dropletsRate: 50,
    dropletsSize: [3, 5.5],
    trailRate: 1,
    trailScaleRange: [0.25, 0.35],
    collisionRadiusIncrease: 2e-4,
  };

  const defaultOptions = {
    minR: 10,
    maxR: 40,
    maxDrops: 120,
    rainChance: 0.3,
    rainLimit: 3,
    dropletsRate: 50,
    dropletsSize: [2, 4],
    dropletsCleaningRadiusMultiplier: 0.43,
    raining: true,
    globalTimeScale: 1,
    trailRate: 1,
    autoShrink: true,
    spawnArea: [-0.1, 0.95],
    trailScaleRange: [0.2, 0.5],
    collisionRadius: 0.65,
    collisionRadiusIncrease: 0.01,
    dropFallMultiplier: 1,
    collisionBoostMultiplier: 0.05,
    collisionBoost: 1,
  };

  function updateWeather(type: string) {
    showBg = false;
    if (raindrops) {
      raindrops.clearDrops();
      raindrops.options = {
        ...defaultOptions,
        ...defaultRain,
        ...weatherTypes[type as keyof typeof weatherTypes],
      };
    }

    loadTextures();
  }

  let showBg = $state<boolean>(true);
  let bgImage = $state<BackgroundImageType | undefined>(undefined);

  async function changeBackground() {
    raindrops && raindrops.clearDrops();
    const response = await fetch(`/server/getlayoutimage`);
    bgImage = await response.json();
    showBg = true;
  }

  onMount(() => {
    changeBackground();
  });
</script>

{#if showBg}
  {#if bgImage}
    <img
      src={bgImage.url}
      class="w-full h-full object-cover absolute top-0 left-0"
      width={innerWidth.current}
      height={innerHeight.current}
      alt="bg"
    />

    {#if !$showLayout}
      <p
        style="text-shadow: 0 0 3px black;"
        class="absolute w-[calc(50vw-215px)] hidden md:block left-0 bottom-6 z-40 cursor-pointer px-6 pt-3 text-12 leading-16 text-white"
      >
        {@html bgImage.title}
      </p>
    {/if}
  {/if}
{:else}
  <canvas
    bind:this={canvas}
    width={innerWidth.current}
    height={innerHeight.current}
    class="absolute top-0 left-0"
  ></canvas>
{/if}

{#if !$showLayout}
  <div class=" absolute z-50 top-0 left-0 hidden sm:flex">
    <button onclick={() => updateWeather("rain")} class="btn-menu layout-white">
      <Icon icon="mingcute:rainstorm-line" width="15" height="15" />
    </button>

    <button
      onclick={() => updateWeather("storm")}
      class="btn-menu layout-white"
    >
      <Icon icon="mingcute:thunderstorm-line" width="15" height="15" />
    </button>

    <button
      onclick={() => updateWeather("drizzle")}
      class="btn-menu layout-white"
    >
      <Icon icon="mingcute:drizzle-line" width="15" height="15" />
    </button>

    <button onclick={changeBackground} class="btn-menu layout-white">
      <Icon icon="mingcute:sun-line" width="15" height="15" />
    </button>
  </div>
{/if}

<style>
  .btn-menu {
    @apply m-3 flex size-27 items-center justify-center rounded-3 !bg-white/5 hover:!bg-white/15 transition duration-300 text-black/90;
  }
</style>
