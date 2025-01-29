<script>
  import Icon from "@iconify/svelte";

  export let onClose;
</script>

<button
  on:click={onClose}
  class="flex h-18 w-18 top-3 right-3 absolute z-50 items-center justify-center text-white/30 outline-none transition duration-100 hover:text-white"
  ><Icon icon="material-symbols:close-rounded" width="15" height="15" /></button
>
