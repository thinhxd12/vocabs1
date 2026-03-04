<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Heatmap from "$lib/components/Heatmap.svelte";
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<Container zIndex={6}>
  <Heatmap />
</Container>

<style lang="postcss">
</style>
