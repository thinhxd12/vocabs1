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
  <div class="main">
    <img
      src="/images/Laugee George The End of the Day.avif"
      alt=""
      class="absolute z-10 object-cover w-full h-full grayscale-[1]"
    />
    <img
      src="/images/Laugee George The End of the Day.avif"
      alt=""
      class="absolute z-20 object-cover w-full h-full"
      style="mask-image: conic-gradient(
      from 0deg,
      black 0deg 120deg,
      transparent 120deg 360deg
    );"
    />
    <div class="static"></div>
    <div class="dynamic"></div>
    <!-- <div class="pie"></div> -->
    <h1>7:00</h1>
  </div>

  <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
</div>

<style>
  .main {
    position: relative;
    width: 500px;
    height: 300px;
    overflow: hidden;
    /* background-image: url("/images/Laugee George The End of the Day.avif"); */
    /* filter: grayscale(1); */
    /* background-size: cover;
    background-position: left center;
    overflow: hidden; */
    /* mask-image: conic-gradient(
      from 0deg,
      black 0deg 120deg,
      transparent 120deg 360deg
    ); */
  }

  .static {
    position: absolute;
    width: 1px;
    height: 150px;
    left: 250px;
    background-color: black;
    z-index: 30;
  }
  .dynamic {
    position: absolute;
    width: 1px;
    height: 500px;
    top: -350px;
    left: 250px;
    background-color: black;
    z-index: 30;
    transform-origin: bottom;
    transform: rotate(120deg);
  }
</style>
