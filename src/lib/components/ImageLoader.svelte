<script lang="ts">
  import LaImageSolid from "~icons/la/image-solid";

  interface Props {
    imageSrc: string;
    width: number;
    height: number;
  }

  let { imageSrc, width, height }: Props = $props();

  let loaded = $state<boolean>(false);

  $effect(() => {
    imageSrc;
    loaded = false;
  });
</script>

<div
  style="width: {width}px; height: {height}px; overflow: hidden; position: relative; background: #fff;"
>
  <div class="skeleton">
    <LaImageSolid class="h-1/2 w-auto" color="#e0e0e0" />
  </div>
  <img
    class="actual-image {loaded ? 'opacity-100' : 'opacity-0'}"
    alt="loaded"
    src={imageSrc}
    onload={() => (loaded = true)}
  />
</div>

<style lang="postcss">
  .skeleton {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .actual-image {
    position: absolute;
    z-index: 2;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
