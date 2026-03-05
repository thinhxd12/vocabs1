<script lang="ts">
  import { type Snippet } from "svelte";

  interface Props {
    showModal: boolean;
    children?: Snippet;
  }

  let { showModal = $bindable(), children }: Props = $props();
</script>

{#if showModal}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal" tabindex="-1">
    <div
      class="backdrop"
      onclick={(e) => {
        showModal = false;
      }}
    ></div>
    <div class="content" data-open={showModal}>
      {@render children?.()}
    </div>
  </div>
{/if}

<style lang="postcss">
  .modal {
    position: fixed;
    width: 100vw;
    height: 100vh;
    inset: 0;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: start;
  }

  .content {
    position: relative;
    z-index: inherit;
    outline: none;
  }

  .content[data-open] {
    animation: zoom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .backdrop {
    position: fixed;
    width: 100vw;
    height: 100vh;
    inset: 0;
    z-index: 9998;
    background: var(--backdrop, #0000004d);
    animation: fade 0.1s ease-out;
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
