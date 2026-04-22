<script lang="ts">
  import { onMount } from "svelte";
  import type { DBSelect } from "$lib/types";
  import { format } from "date-fns";
  import Container from "$lib/components/Container.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { innerHeight } from "svelte/reactivity/window";
  import { showTimer } from "$lib/store/navstore";
  import type { PageProps } from "./$types";
  import StreamlinePlumpFeatherPenSolid from "~icons/streamline-plump/feather-pen-solid";
  import Modal from "$lib/components/Modal.svelte";
  import MaterialSymbolsDeleteForeverOutlineRounded from "~icons/material-symbols/delete-forever-outline-rounded";
  import MaterialSymbolsSaveOutline from "~icons/material-symbols/save-outline";
  import { addToast } from "$lib/store/layoutstore";
  import { v7 as uuidv7 } from "uuid";

  const todayDate = format(new Date(), "yyyy-MM-dd");
  let { data: layoutData }: PageProps = $props();

  let currentPage = $state<number>(1);
  let itemsPerPage = Math.floor(
    (innerHeight.current! - 44 - 38 - 26 - 24) / 26,
  );
  let totalItems = $state<number | undefined>(undefined);
  let paginationItems = $state<DBSelect["diary_table"][]>([]);
  let showModal = $state<boolean>(false);
  const mockItem: DBSelect["diary_table"] = {
    id: "",
    date: todayDate,
    text: "",
  };
  let editItem = $state<DBSelect["diary_table"]>(mockItem);

  function onPageChange(page: number) {
    currentPage = page;
    getDataPaginationByIndex(page);
  }

  async function getTablePaginationLength() {
    const { count } = await layoutData.supabase
      .from("diary_table")
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
    const { data } = await layoutData.supabase
      .from("diary_table")
      .select("*")
      .order("id", { ascending: true })
      .range(from, to);

    if (data) {
      paginationItems = data;
    }
  }

  async function addItem() {
    const insertItem: DBSelect["diary_table"] = {
      id: uuidv7(),
      date: editItem.date,
      text: editItem.text,
    };

    if (editItem.text === "") {
      addToast({
        type: "error",
        title: "Error!",
        message: "Invalid data.",
      });
      return;
    }

    const { data, error } = await layoutData.supabase
      .from("diary_table")
      .insert(insertItem);
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      await getTablePaginationLength();
      getDataPaginationByIndex(1);
      showModal = false;
    }
  }

  async function deleteItem(id: string) {
    const { error } = await layoutData.supabase
      .from("diary_table")
      .delete()
      .eq("id", id);
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      addToast({
        type: "success",
        title: "Success!",
        message: "Delete successfully.",
        timeout: 1000,
      });
      setTimeout(() => {
        getDataPaginationByIndex(currentPage);
        showModal = false;
      }, 1000);
    }
  }

  async function updateItem() {
    const { error } = await layoutData.supabase
      .from("diary_table")
      .update({ date: editItem.date, text: editItem.text })
      .eq("id", editItem.id);
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      getDataPaginationByIndex(currentPage);
      showModal = false;
    }
  }
</script>

<svelte:head>
  {#if !$showTimer}
    <title>📝</title>
  {/if}
  <meta name="Diary" content="Diary" />
</svelte:head>

<Container>
  <h1 class="font-copernicus text-24 text-center mt-10 uppercase font-600">
    Days <span class="font-garamond lowercase italic">like these</span>
  </h1>

  <div class="flex-1 w-full">
    <table class="w-full rounded-2 overflow-hidden">
      <thead>
        <tr
          class="w-full text-12 leading-24 h-24 font-400 bg-gray-400 text-black"
        >
          <th colspan="1">Date</th>
          <th colspan="2">Content</th>
        </tr>
      </thead>
      <tbody>
        {#each paginationItems as item}
          <tr
            class="bg-white/90 hover:bg-white w-full h-24 mb-12 text-12 leading-14 cursor-pointer"
            onclick={(e) => {
              e.currentTarget.blur();
              editItem = { ...item };
              showModal = true;
            }}
          >
            <td class="text-center font-600 leading-24" colspan="1">
              {item.date}
            </td>
            <td class="h-24 leading-24 truncate max-w-300 indent-3" colspan="2">
              {item.text}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if totalItems}
    <Pagination {totalItems} {itemsPerPage} {currentPage} {onPageChange} />
  {/if}

  <button
    class="size-28 absolute bottom-3 right-3 opacity-70 hover:opacity-100"
    onclick={(e) => {
      e.currentTarget.blur();
      editItem.id = "";
      editItem.date = todayDate;
      editItem.text = "";
      showModal = true;
    }}
  >
    <StreamlinePlumpFeatherPenSolid width="24" height="24" />
  </button>

  <Modal bind:showModal>
    <div
      class="w-main h-[calc(100vh-44px)] bg-white rounded-2 overflow-hidden flex flex-col"
    >
      <div class="w-full h-54 flex items-end justify-start bg-teal-600">
        <input
          name="date"
          autocomplete="off"
          type="date"
          bind:value={editItem.date}
          max={todayDate}
          class="bg-transparent outline-none border-none ml-12 mb-3 text-14 text-white leading-18"
        />
      </div>
      <div
        class="w-full h-28 bg-teal-800 flex justify-center items-center gap-12"
      >
        {#if editItem.id}
          <button
            class="size-24 text-white flex items-center justify-center"
            onclick={(e) => {
              e.currentTarget.blur();
              deleteItem(editItem.id);
            }}
          >
            <MaterialSymbolsDeleteForeverOutlineRounded
              width="18"
              height="18"
            />
          </button>
        {/if}

        <button
          class="size-24 text-white flex items-center justify-center"
          onclick={(e) => {
            e.currentTarget.blur();
            if (editItem.id) {
              updateItem();
            } else {
              addItem();
            }
          }}
        >
          <MaterialSymbolsSaveOutline width="18" height="18" />
        </button>
      </div>

      <textarea
        class="w-full flex-1 my-scrollbar cursor-auto border-0 bg-transparent p-6 text-14 font-400 leading-21 outline-none"
        name="text-content"
        autocomplete="off"
        onkeydown={(e) => e.stopPropagation()}
        bind:value={editItem.text}
        onchange={(e) => {
          e.preventDefault();
        }}
      ></textarea>
    </div>
  </Modal>
</Container>

<style lang="postcss">
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
</style>
