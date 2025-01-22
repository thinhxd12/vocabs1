<script lang="ts">
  import { enhance } from "$app/forms";
  let password = $state("");
  import loadingIcon from "$lib/assets/svg/loader-button.svg";
  let { form } = $props();
  let creating = $state(false);
</script>

<div class="w-full h-full flex justify-center items-center">
  <form
    action="?/login"
    method="post"
    class="w-[210px]"
    use:enhance={() => {
      creating = true;
      return async ({ update }) => {
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
        class="w-full h-27 leading-27 rounded-3 border-0 bg-black/30 px-9 py-3 text-center text-white shadow-md shadow-black/30 outline-none backdrop-blur-md transition focus:bg-black/25 focus:ring-white/10"
        required
      />
      <button
        type="submit"
        class="absolute right-0 top-0 z-30 flex h-27 w-27 items-center justify-center transition {creating
          ? 'opacity-100'
          : 'opacity-0'}"
      >
        <img alt="loading" src={loadingIcon} width={15} height={15} />
      </button>
    </div>
    {#if form?.error}
      <p
        class="text-[#de0000] leading-12 text-12 font-600 text-center mt-9"
        style="text-shadow: 0 0 1px white;"
      >
        {form.error}
      </p>
    {/if}
  </form>
</div>
