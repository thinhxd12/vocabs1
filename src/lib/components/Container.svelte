<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    children: Snippet;
    scrollable?: boolean;
    fullscreen?: boolean;
  }

  let { children, scrollable = false, fullscreen = false }: Props = $props();
</script>

<div
  class="{fullscreen
    ? 'w-full'
    : 'w-main'} relative h-[calc(100vh-44px)] flex flex-col justify-start items-center gap-2 {scrollable
    ? 'no-scrollbar overflow-y-scroll'
    : ''}"
>
  {@render children?.()}
</div>

<style lang="postcss">
</style>
