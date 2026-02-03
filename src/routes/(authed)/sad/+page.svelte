<script lang="ts">
  import type { PageProps } from "./$types";
  import { onMount } from "svelte";
  import type { DBSelect } from "$lib/types";
  import { format } from "date-fns";
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { innerHeight } from "svelte/reactivity/window";

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  let currentPage = $state<number>(1);
  let itemsPerPage = Math.floor(
    (innerHeight.current! - 46 - 30 - 42 - 30) / 30,
  );
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["saddays_table"][]>([]);

  function onPageChange(page: number) {
    currentPage = page;
    getDataPaginationByIndex(page);
  }

  async function getTablePaginationLength() {
    const { count } = await supabase
      .from("saddays_table")
      .select("*", { count: "exact", head: true });
    if (count) totalItems = count;
  }

  onMount(async () => {
    await getTablePaginationLength();
    getDataPaginationByIndex(1);
  });

  async function getDataPaginationByIndex(index: number) {
    const totalPages = Math.ceil(totalItems! / itemsPerPage);
    const from = (totalPages - index) * itemsPerPage;
    const to = (totalPages - index + 1) * itemsPerPage - 1;
    const { data } = await supabase
      .from("saddays_table")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (data) {
      paginationItems = data;
    }
  }

  async function addDay() {
    const { data, error } = await supabase.from("saddays_table").insert({});
    getDataPaginationByIndex(currentPage);
  }

  async function deleteDay(day: string) {
    const { error } = await supabase
      .from("saddays_table")
      .delete()
      .eq("created_at", day);
    getDataPaginationByIndex(currentPage);
  }
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<Container zIndex={6}>
  <h1 class="font-copernicus text-24 text-center mt-10 uppercase font-600">
    Sad <span class="font-garamond lowercase italic">days</span>
  </h1>

  <ul class="text-center flex-1">
    <li class="!shadow-none hover:!bg-transparent">
      <button aria-label="add" class="btn-add" onclick={addDay}></button>
    </li>
    {#each paginationItems as item}
      <li class="light">
        <button
          aria-label="delete"
          class="btn-delete"
          onclick={() => deleteDay(item.created_at)}
        ></button>
        <span>{format(item.created_at, "p, yyyy-MM-dd")}</span>
      </li>
    {/each}
  </ul>

  {#if totalItems}
    <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
  {/if}
</Container>

<style lang="postcss">
  li {
    @apply p-6 rounded-2 flex items-center justify-start font-basier font-500 text-15 text-left leading-12 italic mb-3 hover:bg-white/40 shadow shadow-black/40;
  }

  .btn-add {
    @apply size-15 border-black border mr-6 hover:bg-green-400/90;
  }

  .btn-delete {
    @apply size-15 border-black border mr-6 hover:bg-red-400/90;
  }
</style>
