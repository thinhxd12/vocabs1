<script lang="ts">
  import ImageLoader from "./ImageLoader.svelte";
  import type { DBSelect, DBInsert } from "$lib/types";
  import MingcuteCornerDownRightLine from "~icons/mingcute/corner-down-right-line";

  interface Props {
    item: DBSelect["vocab_table"] | DBInsert["vocab_table"];
    onEdit?: () => void;
    onCheck?: () => void;
  }

  let { item, onCheck, onEdit }: Props = $props();
</script>

{#each item.meanings as entry}
  <div class="definition light w-full min-h-min rounded-2 overflow-hidden py-3">
    <div class="flex justify-between px-9 pb-6">
      <button
        class="cursor-pointer font-roslindale text-24 leading-28 font-500"
        onclick={onEdit || onCheck}
      >
        {entry.partOfSpeech}
      </button>
      <span class="text-14 leading-18 opacity-0 hover:opacity-100">
        {entry.translation.join("-")}
      </span>
    </div>

    {#each entry.definitions as el}
      {#if el.image || el.example.sentence}
        <div
          class="relative mb-3 w-full min-h-215 flex flex-col justify-between"
        >
          {#if el.image}
            <div class="absolute w-full h-full">
              <ImageLoader width={382} height={215} imageSrc={el.image} />
            </div>
          {/if}
          {#if el.example.sentence}
            <div class="z-30 flex flex-1 items-center p-18">
              <h2 class="text-center text-18 leading-27">
                <span class="definition-example shadow shadow-black/30">
                  {@html el.example.sentence}
                </span>
              </h2>
            </div>
          {/if}
          <div class="definition-credit relative z-30">
            {#if el.example.author}
              <span class="definition-author">
                {el.example.author}
              </span>
            {/if}
            {#if el.example.title}
              <span class="!font-700 uppercase">
                {el.example.title}
              </span>
            {/if}
            {#if el.example.year}
              <span>
                {el.example.year}
              </span>
            {/if}
          </div>
        </div>
      {/if}

      {#each el.definition as def}
        <p class="flex px-12">
          <span
            class="inline-block min-w-12 text-12 font-700 uppercase leading-15"
          >
            {def.letter}
          </span>
          {#if def.num}
            <small
              class="inline-block min-w-12 pr-2 text-12 font-500 leading-15"
            >
              {def.num}
            </small>
          {/if}
          <span class="text-12 font-500 leading-15">{def.sense}</span>
        </p>
      {/each}
    {/each}

    {#if entry.synonyms.length}
      <div class="flex items-start justify-start px-3 mt-3">
        <MingcuteCornerDownRightLine
          width="15"
          height="15"
          class="min-w-15 -mt-1"
        />
        <span class="pl-3 text-12 font-500 leading-14 text-black">
          {entry.synonyms.join(", ")}
        </span>
      </div>
    {/if}
  </div>
{/each}

<style lang="postcss">
  .definition-example {
    background: #fff none repeat scroll 0 0;
    box-decoration-break: clone;
    padding: 0 6px;
  }

  .definition-example :global {
    b,
    em {
      font-weight: 500;
      font-style: normal;
      color: #f90000;
    }
  }

  .definition-credit {
    @apply ml-auto flex w-fit flex-wrap items-end justify-end;
  }

  .definition-credit span {
    @apply bg-white/30 px-3 pt-2 text-13 font-500 leading-17 text-black;
  }

  .definition-credit > span:first-child {
    @apply border-l border-black pl-18;
  }

  .definition-author {
    font-variant: "small-caps";
  }
</style>
