<script lang="ts">
  import { fade } from "svelte/transition";
  import LaImageSolid from "~icons/la/image-solid";

  interface Props {
    imageSrc: string;
    width: number;
    height: number;
  }

  let { imageSrc, width, height }: Props = $props();

  let loading = $state<boolean>(true);
</script>

<img
  class="w-full h-full object-cover relative z-1"
  {width}
  {height}
  alt="loaded"
  src={imageSrc}
  onload={() => (loading = false)}
/>

{#if loading}
  <div class="skeleton" out:fade={{ duration: 100 }}>
    <LaImageSolid class="h-1/2 w-auto" color="#e0e0e0" />
  </div>
{/if}

<style lang="postcss">
  .skeleton {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
