<script lang="ts">
  import { type Snippet } from "svelte";
  interface Props {
    children?: Snippet;
  }
  let { children }: Props = $props();
</script>

<div class="container">
  <div class="circle"></div>
  <div class="square"></div>
  <div class="dark content">
    {@render children?.()}
  </div>
</div>

<style lang="postcss">
  .container {
    height: var(--height, 540px);
    width: var(--width, 540px);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    padding: var(--border, 9px);
    background: linear-gradient(to bottom right, #f9f0d9, #e0c384, #bfa054);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .square {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, #f9f0d9, #e0c384, #bfa054);
    clip-path: polygon(
      16% 16%,
      84% 16%,
      84% 84%,
      16% 84%,
      16% 16%,
      calc(16% + var(--border, 9px)) calc(16% + var(--border, 9px)),
      calc(16% + var(--border, 9px)) calc(84% - var(--border, 9px)),
      calc(84% - var(--border, 9px)) calc(84% - var(--border, 9px)),
      calc(84% - var(--border, 9px)) calc(16% + var(--border, 9px)),
      calc(16% + var(--border, 9px)) calc(16% + var(--border, 9px))
    );
    clip-rule: evenodd;
  }

  .content {
    width: calc(68% - 2 * var(--border, 9px));
    height: calc(68% - 2 * var(--border, 9px));
  }

  @media screen and (max-width: 500px) {
    .container {
      height: 380px;
      width: 380px;
    }
  }
</style>
