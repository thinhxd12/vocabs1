<script lang="ts">
  interface Props {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  }

  let { totalItems, itemsPerPage, currentPage, onPageChange }: Props = $props();

  let showInputPrev = $state<boolean>(false);
  let showInputNext = $state<boolean>(false);
  let pageInputPrev = $state<number>(1);
  let pageInputNext = $state<number>(1);

  let totalPages = Math.ceil(totalItems / itemsPerPage);

  function changePage(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      currentPage = page;
      showInputPrev = showInputNext = false;
      onPageChange(page);
    }
    pageInputPrev = currentPage - 3;
    pageInputNext = currentPage + 3;
  }

  function handlePageInput(page: number) {
    changePage(page);
    showInputPrev = showInputNext = false;
  }

  function getPageNumbers() {
    let range = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (totalPages <= 6 && totalPages > 1) {
      start = 2;
      end = totalPages - 1;
    }

    if (currentPage <= 3 && totalPages > 6) {
      start = 2;
      end = Math.min(5, currentPage + 2);
    }

    if (currentPage >= totalPages - 2 && totalPages > 6) {
      start = Math.max(totalPages - 4, 1);
      end = totalPages - 1;
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }
</script>

<div class="pagination">
  <button
    class:disabled={currentPage === 1}
    onclick={() => changePage(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Prev
  </button>

  <button onclick={() => changePage(1)} class:current={currentPage === 1}>
    1
  </button>

  {#if totalPages >= 7 && currentPage > 4}
    {#if showInputPrev}
      <input
        name="InputPrev"
        type="number"
        min="1"
        max={totalPages}
        bind:value={pageInputPrev}
        onkeydown={(e) => e.key === "Enter" && handlePageInput(pageInputPrev)}
        onblur={() => handlePageInput(pageInputPrev)}
      />
    {:else}
      <button class="ellipsis" onclick={() => (showInputPrev = true)}>
        ...
      </button>
    {/if}
  {/if}

  {#each getPageNumbers() as page}
    <button
      class={page === currentPage ? "current" : ""}
      onclick={() => changePage(page)}
    >
      {page}
    </button>
  {/each}

  {#if totalPages >= 7 && currentPage < totalPages - 3}
    {#if showInputNext}
      <input
        name="InputNext"
        type="number"
        min="1"
        max={totalPages}
        bind:value={pageInputNext}
        onkeydown={(e) => e.key === "Enter" && handlePageInput(pageInputNext)}
        onblur={() => handlePageInput(pageInputNext)}
      />
    {:else}
      <button class="ellipsis" onclick={() => (showInputNext = true)}>
        ...
      </button>
    {/if}
  {/if}

  {#if totalPages > 1}
    <button
      onclick={() => changePage(totalPages)}
      class:current={currentPage === totalPages}
    >
      {totalPages}
    </button>
  {/if}

  <button
    class:disabled={currentPage === totalPages}
    onclick={() => changePage(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }

  .pagination button {
    padding: 6px 8px 4px;
    min-width: 24px;
    height: 22px;
    transition: color 0.1s;
    font-size: 12px;
    line-height: 1;
    font-family: "Rubik", sans-serif;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.6);
    background-color: rgba(250, 250, 252, 0.3);
    backdrop-filter: blur(6px);
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .pagination button:hover {
    color: rgba(0, 0, 0, 1);
  }

  .pagination button.disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.1);
  }

  .pagination .current {
    color: rgba(0, 0, 0, 1);
    background-color: rgba(250, 250, 252, 0.8);
  }

  .pagination input {
    padding-top: 3px;
    font-size: 12px;
    line-height: 1;
    font-family: "Rubik", sans-serif;
    font-weight: 400;
    color: rgba(0, 0, 0, 1);
    height: 22px;
    width: 48px;
    background-color: rgba(250, 250, 252, 0.3);
    backdrop-filter: blur(6px);
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    text-align: center;
    outline: none;
  }

  .pagination .ellipsis {
    cursor: pointer;
    font-weight: bold;
    padding: 8px 12px;
  }
</style>
