<script lang="ts">
  import { enhance } from "$app/forms";
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
  let password = $state("");
  let { form } = $props();
  let creating = $state(false);
</script>

<svelte:head>
  <title>login</title>
  <meta name="login" content="login" />
</svelte:head>

<div class="login w-main">
  <p class="font-sfpro text-24 text-secondary-white mb-9 indent-6">Log in</p>
  <form
    name="signin"
    action="?/signin"
    method="post"
    use:enhance={({ formElement, formData, action, cancel }) => {
      creating = true;
      return async ({ result, update }) => {
        await update();
        creating = false;
      };
    }}
  >
    <div class="relative">
      <input
        type="password"
        id="password"
        name="password"
        autocomplete="off"
        bind:value={password}
        class="password dark w-full h-36 rounded-full outline-none text-center mb-6"
        required
      />

      {#if creating}
        <div
          class="absolute right-0 top-0 z-30 flex h-36 w-36 items-center justify-center"
          transition:fade={{ duration: 100 }}
        >
          <img
            alt="loading"
            src="/svg/loader-button.svg"
            width={16}
            height={16}
          />
        </div>
      {/if}

      {#if form?.error}
        <div
          class="ml-3 text-[#e30000] text-12 leading-16 flex items-top gap-3"
        >
          <Icon icon="cuida:alert-outline" width="16" height="16" />
          <span> {form.error}</span>
        </div>
      {/if}
    </div>
  </form>
</div>

<style>
  .password:-webkit-autofill,
  .password:-webkit-autofill:focus {
    transition:
      background-color 600000s 0s,
      color 600000s 0s;
    -webkit-text-fill-color: #fff !important;
  }

  .password :global [data-autocompleted] {
    background-color: transparent !important;
  }

  .login {
    position: absolute;
    top: 0;
    left: 0;
    padding: 90px 60px 30px 3px;
    height: 100%;
    z-index: 2;
  }

  @media (max-width: 500px) {
    .login {
      margin: 0 auto;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 30px 30px 30px;
    }
  }
</style>
