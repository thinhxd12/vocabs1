<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { toast } from "svelte-sonner";

  let totalItems = 180;
  let itemsPerPage = 10;
  let currentPage = 2;

  function onPageChange(page: number) {
    currentPage = page;
    console.log("Page changed to:", page);
    // You can also fetch new data here based on the current page
  }

  function test() {
    // toast.error(`Memorized !`, {
    //   duration: Number.POSITIVE_INFINITY,
    //   class: "my-toast-error",
    // });

    toast("Hello World", {
      duration: Number.POSITIVE_INFINITY,
      unstyled: true,
      classes: {
        toast: "bg-blue-400",
        title: "text-red-400 text-2xl",
        description: "text-red-400",
        actionButton: "bg-zinc-400",
        cancelButton: "bg-orange-400",
        closeButton: "bg-lime-400",
      },
    });
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div class="absolute z-50 w-full h-full flex justify-center">
  <button onclick={test} class="text-white z-50 relative">click</button>
  <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
</div>

<style>
</style>
