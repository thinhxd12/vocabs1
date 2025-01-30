<script lang="ts">
  import { showLayout } from "$lib/store/layoutstore";
  import { modal, showEdit, showTranslate } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import Translate from "$lib/components/Translate.svelte";
  import { AlertDialog } from "bits-ui";
</script>

<div class="flex flex-col items-center justify-center w-30">
  <form method="POST" action="/login?/logout">
    <button class="btn-menu">
      <Icon icon="garden:exit-stroke-16" width="15" height="15" />
    </button>
  </form>

  <button class="btn-menu">
    <span>700</span>
  </button>
  <button class="btn-menu">
    <span>700</span>
  </button>
  {#if $showLayout}
    <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}
      ><Icon icon="ri:layout-right-line" width="15" height="15" /></button
    >
  {:else}
    <button class="btn-menu" onclick={() => ($showLayout = !$showLayout)}
      ><Icon icon="ri:layout-left-line" width="15" height="15" /></button
    >
  {/if}

  <button class="btn-menu" onclick={() => ($showTranslate = true)}
    ><Icon icon="ri:translate" width="15" height="15" /></button
  >
  <button class="btn-menu"
    ><Icon icon="cuida:image-outline" width="15" height="15" /></button
  >
  <button class="btn-menu" onclick={() => ($showEdit = true)}
    ><Icon icon="hugeicons:pencil-edit-02" width="15" height="15" /></button
  >
  <button class="btn-menu"
    ><Icon icon="ri:hourglass-2-line" width="15" height="15" /></button
  >
</div>

<style>
  .btn-menu {
    @apply my-2 flex h-27 w-27 items-center justify-center rounded-full text-white shadow shadow-black/30 outline-none backdrop-blur-md transition duration-100 hover:shadow;
  }
  .btn-menu span {
    @apply text-9;
  }
</style>
