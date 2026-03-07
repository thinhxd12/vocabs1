<script lang="ts">
  import type { DBInsert, DBSelect } from "$lib/types";
  import { untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { thumbHashToDataURL } from "thumbhash";
  import { page } from "$app/state";
  import { base64ToUint8Array } from "$lib/utils/functions";

  interface Props {
    word?: DBSelect["vocab_table"] | DBInsert["vocab_table"];
    imageSrc: string;
    width: number;
    height: number;
    className?: string;
    hash?: string;
  }

  let { imageSrc, hash, width, height, className, word }: Props = $props();
  let placeholderData = $state<string>("");

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
          body: JSON.stringify({ imageSrc: v }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const thumbhash = await response.text();

        if (word) {
          let newMeanings = [...word.meanings].map((item) => {
            const updatedDefinitions = item.definitions.map((el) => {
              if (el.image === v) {
                return {
                  ...el,
                  hash: thumbhash,
                };
              }
              return el;
            });
            return { ...item, definitions: updatedDefinitions };
          });

          await page.data.supabase
            .from("vocab_table")
            .update({
              meanings: newMeanings,
            })
            .eq("id", word.id);
        }
      }
    });
  });
</script>

<div
  class={className}
  style="width: {width}px; height: {height}px; overflow: hidden; position: relative;"
>
  {#if placeholderData}
    <img
      transition:fade={{ duration: 50 }}
      class="absolute top-0 left-0 z-10 h-full w-full object-cover"
      src={placeholderData}
      alt="thumbImg"
    />
  {/if}
  <img
    class="h-full w-full object-cover"
    alt="imgSRC"
    src={imageSrc}
    onload={() => (placeholderData = "")}
  />
</div>
