<script lang="ts">
  import TickFlip from "./TickFlip.svelte";

  interface Props {
    flipNumber: number;
  }

  let { flipNumber }: Props = $props();
</script>

<div
  class="light w-full rounded-2 overflow-hidden min-h-148 pb-3 flex justify-center items-center gap-5 font-helvetica text-128 font-400 leading-120"
>
  <TickFlip number={Math.floor(flipNumber / 100)} delay={300} />
  <TickFlip number={Math.floor((flipNumber % 100) / 10)} delay={150} />
  <TickFlip number={flipNumber % 10} image={flipNumber === 0} />
</div>

<style lang="postcss">
</style>
