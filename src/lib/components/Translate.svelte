<script lang="ts">
  import { enhance } from "$app/forms";
  import Icon from "@iconify/svelte";

  function handleKeydown(e: KeyboardEvent) {
    e.stopPropagation();
  }
</script>

<form action="asdfasfd" method="post" class="w-full" use:enhance={() => {}}>
  <div
    class="w-[330px] mx-auto h-30 relative rounded-full bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]"
  >
    <input
      name="word"
      autocomplete="off"
      on:keydown|stopPropagation
      class="absolute left-0 top-0 h-full w-full rounded-9 bg-transparent px-9 text-center font-constantine text-18 font-700 uppercase leading-30 text-white outline-none"
    />
    <button
      class="w-28 h-28 text-white/30 hover:text-white transition duration-100 absolute top-1 right-1"
      ><Icon
        icon="material-symbols:search-rounded"
        width="22"
        height="22"
      /></button
    >
  </div>
</form>
