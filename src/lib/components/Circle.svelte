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
    height: var(--height, 530px);
    width: var(--width, 530px);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .circle {
    position: absolute;
    z-index: 3;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    padding: var(--border, 3px);
    /* background: linear-gradient(to bottom right, #c3aa71, #aa8a45, #886b2b); */
    background: black;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .square {
    position: absolute;
    z-index: 3;
    width: 100%;
    height: 100%;
    /* background: linear-gradient(to bottom right, #c3aa71, #aa8a45, #886b2b); */
    background: black;
    clip-path: polygon(
      15% 15%,
      85% 15%,
      85% 85%,
      15% 85%,
      15% 15%,
      calc(15% + var(--border, 3px)) calc(15% + var(--border, 3px)),
      calc(15% + var(--border, 3px)) calc(85% - var(--border, 3px)),
      calc(85% - var(--border, 3px)) calc(85% - var(--border, 3px)),
      calc(85% - var(--border, 3px)) calc(15% + var(--border, 3px)),
      calc(15% + var(--border, 3px)) calc(15% + var(--border, 3px))
    );
    clip-rule: evenodd;
  }

  .content {
    position: relative;
    z-index: 2;
    width: calc(70% - var(--border, 3px));
    height: calc(70% - var(--border, 3px));
  }

  @media screen and (max-width: 500px) {
    .container {
      height: 380px;
      width: 380px;
    }
  }
</style>
