<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import MaterialSymbolsLightCheckCircleRounded from "~icons/material-symbols-light/check-circle-rounded";
  import MaterialSymbolsErrorRounded from "~icons/material-symbols/error-rounded";
  import MaterialSymbolsInfoRounded from "~icons/material-symbols/info-rounded";
  import { toast } from "$lib/store/layoutstore";

  let dialog = $state<HTMLDialogElement>();
  let timeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    $toast;
    untrack(() => {
      if ($toast.showToast) {
        dialog?.showModal();
        timeout = setTimeout(() => {
          dialog?.close();
        }, $toast.timeout);
      } else {
        dialog?.close();
        clearTimeout(timeout);
      }
    });
  });

  onDestroy(() => {
    clearTimeout(timeout);
  });
</script>

<dialog
  bind:this={dialog}
  onclick={(e) => {
    if (e.target === dialog) {
      dialog.close();
      clearTimeout(timeout);
    }
  }}
>
  <div class="toast-content" data-type={$toast.type}>
    {#if $toast.type === "success"}
      <MaterialSymbolsLightCheckCircleRounded width="24" height="24" />
    {:else if $toast.type === "error"}
      <MaterialSymbolsErrorRounded width="24" height="24" />
    {:else}
      <MaterialSymbolsInfoRounded width="24" height="24" />
    {/if}

    <div class="toast-text">
      <h3>{$toast.title}</h3>
      <p>{$toast.message}</p>
    </div>
  </div>
</dialog>

<style lang="postcss">
  dialog {
    outline: none;
    margin: 0 auto;
    padding: 30px;
    background: transparent;
  }

  dialog::backdrop {
    background: transparent;
  }

  .toast-content {
    margin-top: 15px;
    max-width: 360px;
    border: 1px solid;
    border-radius: 2px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 12px;
    backdrop-filter: blur(12px);
    box-shadow: 0 9px 15px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }

  .toast-text {
    width: 300px;
    display: flex;
    flex-wrap: wrap;
  }

  .toast-text h3 {
    width: 100%;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
  }

  .toast-text p {
    width: 100%;
    color: rgb(23, 23, 23);
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    overflow-wrap: break-word;
  }

  [data-type="success"] {
    color: hsl(140, 100%, 27%);
    border-color: hsl(145, 92%, 87%);
    background-color: hsl(143, 85%, 96%);
  }

  [data-type="error"] {
    color: hsl(360, 100%, 45%);
    border-color: hsl(359, 100%, 94%);
    background-color: hsl(359, 100%, 97%);
  }

  [data-type="info"] {
    color: hsl(0, 0%, 9%);
    border-color: hsl(0, 0%, 93%);
    background-color: #fff;
  }

  dialog[open] {
    animation: flyIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes flyIn {
    from {
      transform: translateY(-100%) scale(0.9);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
</style>
