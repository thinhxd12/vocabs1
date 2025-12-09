<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  let totalItems = 180;
  let itemsPerPage = 10;
  let currentPage = 2;

  function onPageChange(page: number) {
    currentPage = page;
    console.log("Page changed to:", page);
    // You can also fetch new data here based on the current page
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div class="absolute z-50 w-full h-full flex justify-center">
  <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
</div>
