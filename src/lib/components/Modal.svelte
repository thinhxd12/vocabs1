<script lang="ts">
  import Icon from "@iconify/svelte";

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

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  class="w-main"
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
>
  <div class="header">
    <div>{@render header?.()}</div>
    <!-- svelte-ignore a11y_autofocus -->
    <button onclick={() => dialog!.close()}>
      <Icon icon="material-symbols:close-rounded" width="14" height="14" />
    </button>
  </div>
  <div class="content">
    {@render children?.()}
  </div>
</dialog>

<style>
  dialog {
    border: none;
    padding: 0;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
    animation: fade 0.2s ease-out;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  button {
    display: block;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #000000;
    color: #ffffff;
    padding: 6px 12px;
  }

  .content {
    background-color: #ffffff;
  }
</style>
