<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    children: Snippet;
    zIndex: number;
    scrollable?: boolean;
    fullscreen?: boolean;
  }

  let {
    children,
    zIndex,
    scrollable = false,
    fullscreen = false,
  }: Props = $props();
</script>

<section
  class="absoblue w-full h-full flex items-start justify-center z-[{zIndex}]"
>
  <div
    class="{fullscreen
      ? 'w-full'
      : 'w-main'} h-[calc(100vh-44px)] flex flex-col gap-2 {scrollable
      ? 'no-scrollbar overflow-y-scroll'
      : ''}"
  >
    {@render children?.()}
  </div>
</section>

<style lang="postcss">
</style>
