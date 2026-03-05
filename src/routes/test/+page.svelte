<script lang="ts">
  import { toast } from "svelte-sonner";

  let show = $state<boolean>(false);

  function name() {
    toast.error("Error", {
      description: "erorrrrrr",
      class: "my-toast my-toast-error",
    });
  }

  function selectOnMount(node: any) {
    node.focus();
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div class="absolute w-full h-full z-10 flex justify-center items-start">
  <button
    onclick={() => (show = !show)}
    class="absolute bottom-0 text-white z-50 left-1/2">show</button
  >
</div>

<style lang="postcss">
</style>
