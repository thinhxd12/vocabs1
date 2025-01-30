<script lang="ts">
  import { enhance } from "$app/forms";
  import { showLayout } from "$lib/store/layoutstore";
  import { showEdit } from "$lib/store/vocabstore";
  import Icon from "@iconify/svelte";
  import { Dialog } from "bits-ui";
  import { fade } from "svelte/transition";
</script>

<Dialog.Root bind:open={$showEdit} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 50 }}
      class="fixed inset-0 z-50 bg-black/30"
    />
    <Dialog.Content
      class="fixed top-0 {$showLayout
        ? 'right-0 -translate-x-12'
        : 'left-[50%] -translate-x-[calc(50%+15px)]'} outline-none z-50 layout-light mt-[48px] h-[calc(100vh-96px)] overflow-y-scroll no-scrollbar rounded-6 p-6 w-content"
    >
      <form
        action="asdfasfd"
        method="post"
        class="w-full"
        use:enhance={() => {}}
      >
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

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="audio"
          autocomplete="off"
          on:keydown|stopPropagation
        />

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="phonetics"
          autocomplete="off"
          on:keydown|stopPropagation
        />

        <textarea
          class="mt-24 w-full rounded-6 border-0 bg-transparent p-6 text-12 font-400 leading-15 text-white outline-none ring-1 ring-white/30"
          name="meanings"
          autocomplete="off"
          on:keydown|stopPropagation
          rows="12"
        ></textarea>

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="meaning"
          autocomplete="off"
          on:keydown|stopPropagation
        />

        <input
          class="mb-3 w-full border-0 h-30 border-b border-white/30 bg-transparent p-3 pl-15 text-12 font-400 leading-15 text-white outline-none"
          name="number"
          type="number"
          max={240}
          min={1}
          autocomplete="off"
          on:keydown|stopPropagation
        />

        <div class="flex w-full items-center justify-center gap-24 mt-6">
          <Dialog.Close
            class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white  bg-white/15 transition hover:bg-white/10 py-3 px-6"
            >Cancel</Dialog.Close
          >
          <button
            type="submit"
            class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white bg-white/15 transition hover:bg-white/10 py-3 px-6"
            >Submit</button
          >
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
