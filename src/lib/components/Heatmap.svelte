<script lang="ts">
  interface Props {
    year: number;
  }

  let { year }: Props = $props();

</script>

<div class="w-full h-full relative">
    <h1 class="text-white text-center">{year}</h1>
</div>

<style lang="postcss">
</style>
