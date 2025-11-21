<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { PageProps } from "./$types";
  import { onMount } from "svelte";
  import type { DBSelect } from "$lib/types";
  import { format } from "date-fns";
  import Container from "$lib/components/Container.svelte";

  let { data: layoutData }: PageProps = $props();
  const { supabase } = layoutData;

  let currentPage = $state<number>(1);
  let totalPages = $state<number>(1);
  let pages = $state<(string | number)[]>([]);
  let progressItems = $state<DBSelect["saddays_table"][]>([]);

  async function getTableLength() {
    const { count } = await supabase
      .from("saddays_table")
      .select("*", { count: "exact", head: true });
    if (count) totalPages = Math.ceil(count / 18);
  }

  onMount(async () => {
    await getTableLength();
    getPages(1);
  });

  async function getProgressByIndex(index: number) {
    const { data } = await supabase
      .from("saddays_table")
      .select("*")
      .order("created_at", { ascending: true })
      .range(index * 18, index * 18 + 17);

    if (data) {
      progressItems = data;
    }
  }

  async function getPages(current: number) {
    currentPage = current;
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    pages = rangeWithDots;
    getProgressByIndex(totalPages - current);
  }

  async function addDay() {
    const { data, error } = await supabase.from("saddays_table").insert({});
    getPages(currentPage);
  }

  async function deleteDay(day: string) {
    const { error } = await supabase
      .from("saddays_table")
      .delete()
      .eq("created_at", day);
    getPages(currentPage);
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
    <li class="!shadow-none">
      <button aria-label="add" class="btn-add" onclick={addDay}></button>
    </li>

    {#each progressItems as item}
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

  <div class="flex justify-center items-center mt-6">
    <button
      class="size-24 light select-none rounded-6 flex items-center justify-center disabled:cursor-not-allowed disabled:text-black/10"
      onclick={() => getPages(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <Icon icon="solar:alt-arrow-left-linear" width="14" height="14" />
    </button>

    <div class="rounded-6 light flex justify-center items-center mx-3 h-24">
      {#each pages as page}
        {#if page === "..."}
          <span class="text-12 leading-14 select-none">…</span>
        {:else}
          <button
            class:active={page === currentPage}
            class="page-button"
            onclick={() => getPages(page as number)}
          >
            {page}
          </button>
        {/if}
      {/each}
    </div>

    <button
      class="size-24 light select-none rounded-6 flex items-center justify-center disabled:cursor-not-allowed disabled:text-black/10"
      onclick={() => getPages(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <Icon icon="solar:alt-arrow-right-linear" width="14" height="14" />
    </button>
  </div>
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

  .page-button {
    @apply select-none text-black/30 text-center size-24 font-rubik text-12 leading-21 pt-3;
  }

  .page-button.active {
    @apply text-black;
  }
</style>
