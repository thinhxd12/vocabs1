<script lang="ts">
  import type { BackgroundImageType } from "$lib/types";
  import Icon from "@iconify/svelte";

  interface VideoType {
    label: string;
    value: string;
  }

  const startedImage = {
    title: "Stunning Icelandic region of volcanoes, beaches, and glaciers.",
    url: "/images/Icescape.jpg",
    place: "Snæfellsnes peninsula, Iceland",
  };

  const readingImage = {
    title: "",
    url: "/images/joshua-bartell.avif",
    place: "",
  };

  let bgImage = $state<BackgroundImageType>(startedImage);

  async function changeBackgroundImg() {
    const response = await fetch(`/server/getlayoutimage`);
    bgImage = await response.json();
  }

  let showVideoBackground = $state<boolean>(false);
  let videoSrc = $state<string>("rain4");
  let isMuted = $state<boolean>(true);
  let videos: VideoType[] = [
    {
      label: "1",
      value: "rain1",
    },
    {
      label: "2",
      value: "rain2",
    },
    {
      label: "3",
      value: "rain3",
    },
    {
      label: "4",
      value: "rain4",
    },
  ];
</script>

{#if showVideoBackground}
  <video
    src="/gif/{videoSrc}.mp4"
    autoplay
    loop
    muted={isMuted}
    playsinline
    class="absolute w-full h-full object-cover z-[0]"
  >
    Your browser does not support the video tag.
  </video>

  <div class="z-[9] absolute left-3 top-3 flex gap-2">
    <button
      onclick={() => (showVideoBackground = false)}
      class="btn-menu light"
    >
      <Icon
        icon="material-symbols:imagesmode-outline-rounded"
        width="13"
        height="13"
      />
    </button>

    <select bind:value={videoSrc} class="btn-menu light">
      {#each videos as item}
        <option value={item.value}>
          {item.label}
        </option>
      {/each}
    </select>

    <button onclick={() => (isMuted = !isMuted)} class="btn-menu light">
      {#if isMuted}
        <Icon
          icon="material-symbols:volume-off-outline-rounded"
          width="13"
          height="13"
        />
      {:else}
        <Icon
          icon="material-symbols:volume-up-outline-rounded"
          width="13"
          height="13"
        />
      {/if}
    </button>

    <button
      onclick={() => {
        showVideoBackground = false;
        bgImage = startedImage;
      }}
      class="btn-menu light"
    >
      <Icon icon="material-symbols:imagesmode-rounded" width="13" height="13" />
    </button>

    <button
      onclick={() => {
        showVideoBackground = false;
        bgImage = readingImage;
      }}
      class="btn-menu light"
    >
      <Icon
        icon="material-symbols:book-ribbon-outline-rounded"
        width="13"
        height="13"
      />
    </button>
  </div>
{:else}
  <img
    src={bgImage.url}
    alt="main-layout-bg"
    class="absolute w-full h-full object-cover z-[0]"
    loading="lazy"
  />

  <div
    class="z-[9] absolute w-[calc(50vw-215px)] hidden md:flex flex-col items-start left-0 top-3 px-3 text-12 leading-16 text-white"
  >
    <button
      onclick={(e) => {
        showVideoBackground = true;
        e.currentTarget.blur();
      }}
      style="text-shadow: 0 0 3px black;"
      class="text-left"
    >
      {@html bgImage.title || "Show video background."}
    </button>
    <button
      onclick={(e) => {
        changeBackgroundImg();
        e.currentTarget.blur();
      }}
      style="text-shadow: 0 0 3px black;"
      class="text-left"
    >
      {bgImage.place.split("©")[0].trim() || "Change background image."}
    </button>
  </div>
{/if}

<style lang="postcss">
  .btn-menu {
    @apply w-17 h-15 flex items-center justify-center text-9 appearance-none text-center cursor-pointer rounded-2 hover:bg-white/40 transition duration-100 outline-none ring-1 ring-black/5 shadow shadow-black/30;
  }

  option {
    font-size: 9px;
    width: 17px;
  }

  option:checked {
    background-color: #eaebeb;
    font-weight: bold;
  }

  option:hover {
    background-color: #eaebeb;
  }

  option:focus-visible {
    outline: none;
    background-color: #dedfdf;
  }

  option::checkmark {
    display: none;
  }
</style>
