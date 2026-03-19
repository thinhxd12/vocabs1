<script lang="ts">
  import { type Snippet } from "svelte";

  interface Props {
    showModal: boolean;
    children?: Snippet;
  }

  let { showModal = $bindable(), children }: Props = $props();

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (showModal) dialog?.showModal();
    else dialog?.close();
  });
</script>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <dialog
    bind:this={dialog}
    onclose={() => (showModal = false)}
    onclick={(e) => {
      if (e.target === dialog) dialog.close();
    }}
  >
    {@render children?.()}
  </dialog>
{/if}

<style lang="postcss">
  dialog {
    border: none;
    padding: 0;
    margin: 0 auto;
    background: transparent;
  }

  dialog::backdrop {
    background: var(--backdrop, #0000004d);
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
