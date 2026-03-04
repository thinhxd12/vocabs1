<script lang="ts">
  import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";

  let { showModal = $bindable(), header, children }: Props = $props();

  interface Props {
    showModal: any;
    header?: any;
    children: any;
  }

  let dialog = $state<HTMLDialogElement>(); // HTMLDialogElement

  $effect(() => {
    if (showModal) dialog!.showModal();
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
    class="w-main"
  >
    {#if header}
      <div class="header w-main">
        {@render header?.()}
        <!-- svelte-ignore a11y_autofocus -->
        <button class="closeBtn" onclick={() => dialog!.close()}>
          <MaterialSymbolsCloseRounded width="14" height="14" />
        </button>
      </div>
    {/if}

    <div class="content w-main">
      {@render children?.()}
    </div>
  </dialog>
{/if}

<style lang="postcss">
  dialog {
    height: var(--height, 100vh);
    min-height: var(--height, 100vh);
    margin: var(--margin, 0 auto);
    border: none;
    padding: 0;
    border-radius: 2px;
    overflow: hidden;
    background: none;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
  }

  dialog::-webkit-scrollbar {
    display: none;
  }

  dialog::backdrop {
    background: var(--backdrop, #0000004d);
  }

  dialog[open] {
    animation: zoom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .header {
    width: 100%;
    height: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #000000;
    color: #ffffff;
    padding: 3px 6px;
  }

  .content {
    width: 100%;
    flex-grow: 1;
    background-color: var(--bg, #ffffff);
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.1s ease-out;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .closeBtn {
    @apply size-24 flex justify-center items-center transition duration-100 text-white/60 hover:text-white;
  }
</style>
