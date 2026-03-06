<script lang="ts">
  import { type Snippet } from "svelte";

  interface Props {
    showModal: boolean;
    children?: Snippet;
  }

  let { showModal = $bindable(), children }: Props = $props();

  let dialog = $state();
</script>

{#if showModal}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    bind:this={dialog}
    class="backdrop"
    onclick={(e) => {
      if (e.target === dialog) showModal = false;
    }}
    onkeydown={(e) => {
      e.stopPropagation();
    }}
  >
    <div
      class="modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      data-open={showModal}
    >
      {@render children?.()}
    </div>
  </div>
{/if}

<style lang="postcss">
  .backdrop {
    position: fixed;
    width: 100vw;
    height: 100vh;
    inset: 0;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: start;
    background: var(--backdrop, #0000004d);
    animation: fade 0.1s ease-out;
  }

  .modal {
    position: relative;
    z-index: inherit;
    outline: none;
  }

  .modal[data-open] {
    animation: zoom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
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
