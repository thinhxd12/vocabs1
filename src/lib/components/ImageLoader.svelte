<script lang="ts">
  import type { InsertVocab, SelectVocab } from "$lib/db/schema";
  import { base64ToUint8Array } from "$lib/functions";
  import { untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { thumbHashToDataURL } from "thumbhash";

  interface Props {
    word?: SelectVocab | InsertVocab;
    imageSrc: string;
    width: number;
    height: number;
    className?: string;
    hash?: string;
  }

  let { imageSrc, hash, width, height, className, word }: Props = $props();
  let placeholderData = $state<string>("");

  const handleLoad = () => {
    placeholderData = "";
  };

  $effect(() => {
    const v = imageSrc;
    untrack(() => {
      placeholderData = "";
      if (hash) {
        const thumbHashFromBase64 = base64ToUint8Array(hash);
        placeholderData = thumbHashToDataURL(thumbHashFromBase64);
      } else {
        // create thumhash
      }
    });
  });
</script>

<div
  class={className}
  style="width: {width}px;
  height: {height}px;
  position: relative;
  overflow: hidden"
>
  {#if placeholderData}
    <img
      transition:fade
      class="absolute left-0 top-0 z-20 h-full w-full object-cover"
      src={placeholderData}
      alt="placeholder"
    />
  {/if}

  <img
    class="absolute left-0 top-0 z-10 h-full w-full object-cover"
    alt="mainimage"
    src={imageSrc}
    onload={handleLoad}
    loading="eager"
  />
</div>
