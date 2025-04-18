<script lang="ts">
  import { enhance } from "$app/forms";
  let password = $state("");
  let { form } = $props();
  let creating = $state(false);
</script>

<svelte:head>
  <title>login</title>
  <meta name="login" content="login" />
</svelte:head>

<div class="w-full h-full flex justify-center items-center">
  <form
    name="signin"
    action="?/signin"
    method="post"
    class="w-[210px]"
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
        class="password w-full h-27 leading-27 rounded-3 border-0 bg-black/30 px-9 py-3 text-center text-white shadow-md shadow-black/30 outline-none backdrop-blur-md transition focus:bg-black/25 focus:ring-white/10"
        required
      />
      <button
        type="submit"
        class="absolute right-0 top-0 z-30 flex h-27 w-27 items-center justify-center transition {creating
          ? 'opacity-100'
          : 'opacity-0'}"
      >
        <img
          alt="loading"
          src="/svg/loader-button.svg"
          width={15}
          height={15}
        />
      </button>
      {#if form?.error}
        <p class="text-[#de0000] leading-12 text-12 font-500 text-center mt-9">
          {form.error}
        </p>
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
</style>
