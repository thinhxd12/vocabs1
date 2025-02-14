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
    placeholderData = "";
    untrack(async () => {
      if (hash) {
        const thumbHashFromBase64 = base64ToUint8Array(hash);
        placeholderData = thumbHashToDataURL(thumbHashFromBase64);
      } else {
        const response = await fetch("/server/thumbhash", {
          method: "POST",
          body: JSON.stringify({ imageSrc }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const thumbhash = await response.text();
        const thumbHashFromBase64 = base64ToUint8Array(thumbhash);
        placeholderData = thumbHashToDataURL(thumbHashFromBase64);

        if (word) {
          let newMeanings = [...word.meanings].map((item) => {
            const updatedDefinitions = item.definitions.map((el) => {
              return {
                ...el,
                hash: el.image === imageSrc ? thumbhash : "",
              };
            });
            return { ...item, definitions: updatedDefinitions };
          });
          fetch("/server/updateword", {
            method: "POST",
            body: JSON.stringify({ vocab: { ...word, meanings: newMeanings } }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
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
      transition:fade={{ duration: 50 }}
      class="absolute left-0 top-0 z-20 h-full w-full object-cover"
      src={placeholderData}
      alt="thumbnail"
    />
  {/if}

  <img
    class="absolute left-0 top-0 z-10 h-full w-full object-cover"
    alt="fullimage"
    src={imageSrc}
    onload={handleLoad}
    loading="eager"
  />
</div>
