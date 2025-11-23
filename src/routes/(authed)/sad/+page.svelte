<script lang="ts">
  import type { PageProps } from "./$types";
  import { onMount } from "svelte";
  import type { DBSelect } from "$lib/types";
  import { format } from "date-fns";
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  let currentPage = $state<number>(1);
  let itemsPerPage = $state<number>(1);
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["saddays_table"][]>([]);

  function onPageChange(page: number) {
    currentPage = page;
    getDataByIndex(page);
  }

  async function getTableLength() {
    const { count } = await supabase
      .from("saddays_table")
      .select("*", { count: "exact", head: true });
    if (count) totalItems = count;
  }

  onMount(async () => {
    let divHeight = window.innerHeight;
    itemsPerPage = Math.floor((divHeight - 200) / 27);
    await getTableLength();

    getDataByIndex(1);
  });

  async function getDataByIndex(index: number) {
    const { data } = await supabase
      .from("saddays_table")
      .select("*")
      .order("created_at", { ascending: false })
      .range((index - 1) * itemsPerPage, index * itemsPerPage - 1);

    if (data) {
      paginationItems = data;
    }
  }

  async function addDay() {
    const { data, error } = await supabase.from("saddays_table").insert({});
    getDataByIndex(currentPage);
  }

  async function deleteDay(day: string) {
    const { error } = await supabase
      .from("saddays_table")
      .delete()
      .eq("created_at", day);
    getDataByIndex(currentPage);
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
        <span>{format(item.created_at, "Pp")}</span>
      </li>
    {/each}
  </ul>

  {#if totalItems}
    <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
  {/if}
</Container>

<style>
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
