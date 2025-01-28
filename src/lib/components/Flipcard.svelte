<script lang="ts">
  import Tick from "./Tick.svelte";

  interface Props {
    number: number;
  }

  let { number }: Props = $props();
</script>

<div class="relative flex font-helvetica text-[40px] font-600 leading-[36px]">
  <Tick number={Math.floor(number / 100)} delay={300} />
  <Tick number={Math.floor((number % 100) / 10)} delay={150} />
  <Tick number={number % 10} image={number === 0} />
</div>
