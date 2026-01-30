<script lang="ts">
  import { enhance } from "$app/forms";
  import type { DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { toast } from "svelte-sonner";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/state";
  import { Tween } from "svelte/motion";
  import { quadInOut } from "svelte/easing";
  import { onDestroy, onMount, untrack } from "svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import { bookmark, bookInfo } from "$lib/store/highlightstore";
  import { innerWidth, innerHeight } from "svelte/reactivity/window";
  import postcss from "postcss";
  import Modal from "$lib/components/Modal.svelte";

  type PageContent = {
    zIndex: number;
    rotate: number;
    front: string;
    back: string;
  };

  let showModal = $state(false);
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<section
  class="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pt-60 px-60 pb-90 z-[5]"
>
  <button onclick={() => (showModal = true)}> show modal </button>

  <Modal bind:showModal>
    {#snippet header()}
      <h2>
        modal
        <small><em>adjective</em> mod·al \ˈmō-dəl\</small>
      </h2>
    {/snippet}

    <ol class="definition-list">
      <li>of or relating to modality in logic</li>
      <li>
        containing provisions as to the mode of procedure or the manner of
        taking effect —used of a contract or legacy
      </li>
      <li>of or relating to a musical mode</li>
      <li>of or relating to structure as opposed to substance</li>
      <li>
        of, relating to, or constituting a grammatical form or category
        characteristically indicating predication
      </li>
      <li>of or relating to a statistical mode</li>
    </ol>

    <a href="https://www.merriam-webster.com/dictionary/modal"
      >merriam-webster.com</a
    >
  </Modal>
</section>

<style lang="postcss">
</style>
