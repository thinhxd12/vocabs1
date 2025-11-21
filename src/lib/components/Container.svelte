<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    children: Snippet;
    zIndex: number;
    scrollable?: boolean;
  }

  let { children, zIndex, scrollable = false }: Props = $props();
</script>

<section class="absoblue w-full h-full flex justify-center z-[{zIndex}]">
  {#if scrollable}
    <div
      class="w-main h-[calc(100vh-44px)] flex flex-wrap content-start gap-2 no-scrollbar overflow-y-scroll"
    >
      {@render children?.()}
    </div>
  {:else}
    <div class="w-main h-[calc(100%-44px)] flex flex-col gap-2">
      {@render children?.()}
    </div>
  {/if}
</section>
