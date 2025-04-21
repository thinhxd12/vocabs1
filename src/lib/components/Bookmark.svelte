<script lang="ts">
  import { enhance } from "$app/forms";
  import type { BookSearchType, DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { Dialog } from "bits-ui";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade, fly } from "svelte/transition";
  import StarRating from "./StarRating.svelte";
  import { page } from "$app/state";

  const { supabase } = page.data;
  let bookmark = $state<DBSelect["bookmark_table"] | undefined>(undefined);
  let bookInfo = $state<BookSearchType | undefined>(undefined);
  let isReset = $state<boolean>(false);
  let isLoading = $state<boolean>(false);

  onMount(() => {
    handleGetCurrentBookmark();
  });

  async function handleGetCurrentId() {
    const { data } = await supabase
      .from("bookmark_progress")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    if (data) return data[0] as DBSelect["bookmark_progress"];
  }

  async function handleGetCurrentBookmark() {
    isReset = false;
    isLoading = true;
    const idData = await handleGetCurrentId();
    if (!idData) return;
    const { data } = await supabase
      .from("bookmark_table")
      .select("*")
      .eq("id", idData.currentId)
      .limit(1);
    if (data && data.length) {
      isReset = true;
      isLoading = false;
      bookmark = data[0];
      handleGetBookInfo(data[0]);
    }
  }
  async function handleGetNextBookmark() {
    isReset = false;
    isLoading = true;
    const { data } = await supabase
      .from("bookmark_table")
      .select()
      .order("id", { ascending: true })
      .gt("id", bookmark?.id)
      .limit(1);
    if (data && data.length) {
      handleSetBookmark(data[0]);
    } else {
      const { data } = await supabase
        .from("bookmark_table")
        .select()
        .order("id", { ascending: true })
        .limit(1);
      if (data) {
        handleSetBookmark(data[0]);
      }
    }
  }

  async function handleGetPrevBookmark() {
    isReset = false;
    isLoading = true;
    const { data } = await supabase
      .from("bookmark_table")
      .select()
      .order("id", { ascending: false })
      .lt("id", bookmark?.id)
      .limit(1);
    if (data && data.length) {
      handleSetBookmark(data[0]);
    } else {
      const { data } = await supabase
        .from("bookmark_table")
        .select()
        .order("id", { ascending: false })
        .limit(1);
      if (data) {
        handleSetBookmark(data[0]);
      }
    }
  }

  async function handleSetBookmark(data: DBSelect["bookmark_table"]) {
    const { error } = await supabase
      .from("bookmark_progress")
      .update({ currentId: data.id })
      .eq("created_at", "2025-04-13 00:29:28.801084+00");

    isReset = true;
    isLoading = false;
    if (data.bookTile !== bookmark?.bookTile) {
      handleGetBookInfo(data);
    }
    bookmark = data;
  }

  async function handleGetBookInfo(data: DBSelect["bookmark_table"]) {
    const response = await fetch(
      `/server/getbookinfo?query=${data.bookTile.split(":")[0]}&author=${data.authors.split(";")[0]}`
    );
    bookInfo = await response.json();
  }

  async function handleCheckBookmark() {
    if (!bookmark) return;
    if (isReset) {
      const newLike = bookmark.like + 1;
      bookmark = { ...bookmark, like: newLike };
      isReset = !isReset;
      const { error } = await supabase
        .from("bookmark_table")
        .update({ like: newLike })
        .eq("id", bookmark.id);
    } else {
      const newLike = bookmark.like - 1;
      bookmark = { ...bookmark, like: newLike };
      isReset = !isReset;
      const { error } = await supabase
        .from("bookmark_table")
        .update({ like: newLike })
        .eq("id", bookmark.id);
    }
  }

  async function copyBookMarkToClipboard() {
    try {
      if (bookmark) await navigator.clipboard.writeText(bookmark.content);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  async function getRandomBookmark() {
    isReset = true;
    const { data, error } = await supabase.rpc("get_random_bookmark");
    if (data && data.length) {
      if (data[0].bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data[0]);
      }
      bookmark = data[0];
    }
  }

  let showEdit = $state<boolean>(false);
  let showInsert = $state<boolean>(false);
  let showDelete = $state<boolean>(false);

  async function handleDeleteBookmark() {
    if (!bookmark) return;
    const { error } = await supabase
      .from("bookmark_table")
      .delete()
      .eq("id", bookmark.id);
    if (error) {
      toast.error("Error", {
        class: "my-toast",
      });
    } else {
      toast.success("Delete bookmark successfully", {
        class: "my-toast",
      });
    }
    handleGetNextBookmark();
    showDelete = !showDelete;
  }
</script>

<svelte:head>
  <title>
    {bookmark ? `${bookmark.bookTile} by ${bookmark.authors}` : "Bookmark"}
  </title>
  <meta name="bookmark" content="Some bookmark" />
</svelte:head>

<section class="flex-1 h-full pt-[48px] px-[48px] flex flex-col">
  {#if bookmark}
    <div class="w-full flex-1 layout-black rounded-6 flex overflow-hidden">
      <div class="w-[240px] h-full bg-black/30 flex flex-col px-9">
        {#if bookInfo}
          <img
            src={bookInfo.coverImage}
            alt="book-cover"
            class="mx-auto my-21 shadow-xl shadow-black/90"
            width="121"
          />
          {#if bookInfo.authors}
            <p
              class="mb-6 text-16 leading-16 text-white/50 text-center font-garamond font-400"
            >
              {bookInfo.authors.join(", ")}
            </p>
          {/if}
          <h3
            class="mb-3 text-18 font-garamond text-white font-600 leading-21 text-center"
          >
            {bookInfo.title}
          </h3>
          {#if bookInfo.publishedYear}
            <p
              class="mb-6 text-11 leading-12 text-secondary-white/60 text-center"
            >
              First published {bookInfo.publishedYear}
            </p>
          {/if}
          {#if bookInfo.numberOfRatings}
            <div class="mb-6 flex items-center justify-center">
              <StarRating
                rating={Number(bookInfo.averageRating)}
                size={18}
                gap={3}
              />
              <p
                class="ml-6 text-16 pt-6 font-garamond leading-18 text-white/50"
              >
                {bookInfo.averageRating}
              </p>
            </div>
          {/if}
          <div class="mb-3 flex items-center justify-center">
            {#if bookInfo.numberOfRatings}
              <span
                class="text-11 leading-12 text-white/50 after:content-['·'] after:mx-3"
              >
                {Number(bookInfo.numberOfRatings).toLocaleString()} ratings
              </span>
            {/if}
            <button
              class="text-11 leading-12 {isReset
                ? 'text-white/20'
                : 'text-white/50'}"
              onclick={handleCheckBookmark}
            >
              {bookmark.like}
              {bookmark.like > 1 ? "likes" : "like"}
            </button>
          </div>
        {/if}
      </div>

      <div
        class="flex-1 h-full style-1 relative overflow-y-scroll {bookmark.like
          ? "bg-[url('/images/paper.webp')]"
          : 'bg-[#dcd8d1]'} bg-cover bg-local"
      >
        {#if showDelete}
          <div
            class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center p-6"
            transition:fly={{ y: "-100%", duration: 100 }}
          >
            <div
              class="layout-black flex flex-col items-center justify-center rounded-3 p-6"
            >
              <p class="mb-6 text-12 text-white">Delete this bookmark?</p>
              <div class="flex items-center justify-center">
                <button
                  class="btn-bookmark-delete"
                  onclick={() => (showDelete = !showDelete)}
                >
                  Cancel
                </button>
                <button
                  class="btn-bookmark-delete !text-red-600"
                  onclick={handleDeleteBookmark}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/if}

        {#if isLoading}
          <img
            src="/gif/whisperoftheheart.gif"
            alt="loading"
            width={300}
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        {:else}
          <div
            class="bookmarkText p-9 pl-21 font-garamond text-20 font-400 leading-30"
          >
            <div
              class="float-right ml-6 w-[66px] h-[66px] overflow-hidden bg-[#f0f0f0] flex flex-col justify-center shadow-md shadow-black/30 rounded-6"
            >
              <p
                class="bg-[#fe0000] text-9 font-500 font-rubik leading-20 h-18 w-full text-white px-3 text-center"
              >
                {format(new Date(bookmark.dateOfCreation), "EEE MM/yyyy")}
              </p>
              <p
                class="w-full font-rubik text-[40px] leading-[30px] pt-6 text-center"
              >
                {format(new Date(bookmark.dateOfCreation), "dd")}
              </p>
              <p
                class="text-black font-rubik text-9 leading-12 w-full text-center font-500"
              >
                {format(new Date(bookmark.dateOfCreation), "p")}
              </p>
            </div>
            {bookmark.content}
          </div>
        {/if}
      </div>
    </div>

    <div class="h-[48px] flex justify-center items-baseline p-9">
      <button class="layout-white btn-menu" onclick={copyBookMarkToClipboard}>
        <Icon icon="solar:copy-outline" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu" onclick={getRandomBookmark}>
        <Icon icon="solar:refresh-outline" width="15" height="15" />
      </button>

      <button
        class="layout-white btn-menu"
        onclick={() => (showEdit = !showEdit)}
      >
        <Icon icon="solar:document-add-linear" width="15" height="15" />
      </button>

      <button
        class="layout-white btn-menu"
        onclick={() => (showInsert = !showInsert)}
      >
        <Icon icon="solar:library-linear" width="15" height="15" />
      </button>

      <button
        class="layout-white btn-menu"
        onclick={() => (showDelete = !showDelete)}
      >
        <Icon icon="solar:trash-bin-trash-outline" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu" onclick={handleGetPrevBookmark}>
        <Icon icon="solar:alt-arrow-left-linear" width="15" height="15" />
      </button>

      <button class="layout-white btn-menu" onclick={handleGetNextBookmark}>
        <Icon icon="solar:alt-arrow-right-linear" width="15" height="15" />
      </button>
    </div>
  {/if}
</section>

<Dialog.Root bind:open={showEdit} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 100 }}
      class="fixed inset-0 z-30 bg-black/60"
    />
    <Dialog.Content
      class="fixed inset-[48px_450px_48px_288px] z-50 overflow-y-scroll no-scrollbar rounded-6 p-6 outline-none layout-black"
    >
      {#if bookmark}
        <form
          name="editbookmark"
          action="?/editBookmark"
          method="post"
          class="w-full p-18"
          use:enhance={({ formElement, formData, action, cancel }) => {
            return async ({ result }) => {
              if (result.status === 200) {
                toast.success("Update bookmark successfully", {
                  class: "my-toast",
                });
              } else {
                toast.error("Error", {
                  class: "my-toast",
                });
              }
            };
          }}
        >
          <input hidden name="id" autocomplete="off" value={bookmark.id} />
          <textarea
            class="p-9 w-full style-1 rounded-6 border-0 font-garamond text-18 font-400 leading-21 bg-[#dcd8d1] outline-none ring-1 ring-white/30"
            name="content"
            autocomplete="off"
            onkeydown={(e) => e.stopPropagation()}
            rows="12"
            bind:value={bookmark.content}
          ></textarea>
          <div class="flex w-full items-center justify-center gap-24 mt-6">
            <Dialog.Close
              class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white  bg-white/15 transition hover:bg-white/10 py-3 px-6"
              >Cancel</Dialog.Close
            >
            <button
              type="submit"
              class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white bg-white/15 transition hover:bg-white/10 py-3 px-6"
              >Submit</button
            >
          </div>
        </form>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<Dialog.Root bind:open={showInsert} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 100 }}
      class="fixed inset-0 z-30 bg-black/60"
    />
    <Dialog.Content
      class="fixed inset-[48px_450px_48px_288px] z-50 overflow-y-scroll no-scrollbar rounded-6 p-6 outline-none layout-black"
    >
      <form
        name="insertbookmark"
        action="?/insertBookmark"
        method="post"
        class="w-full p-18"
        use:enhance={({ formElement, formData, action, cancel }) => {
          return async ({ result }) => {
            if (result.status === 200) {
              toast.success("Insert items successfully", {
                class: "my-toast",
              });
            } else {
              toast.error("Error", {
                class: "my-toast",
              });
            }
          };
        }}
      >
        <textarea
          class="p-9 w-full style-1 rounded-6 border-0 font-garamond text-18 font-400 leading-21 bg-[#dcd8d1] outline-none ring-1 ring-white/30"
          name="content"
          autocomplete="off"
          onkeydown={(e) => e.stopPropagation()}
          rows="12"
        ></textarea>
        <div class="flex w-full items-center justify-center gap-24 mt-6">
          <Dialog.Close
            class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white  bg-white/15 transition hover:bg-white/10 py-3 px-6"
            >Cancel</Dialog.Close
          >
          <button
            type="submit"
            class="rounded-6 text-center text-12 shadow font-400 leading-18 text-white bg-white/15 transition hover:bg-white/10 py-3 px-6"
            >Insert</button
          >
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  .btn-menu {
    @apply mx-3 flex size-27 items-center justify-center  rounded-3 !bg-white/5 hover:!bg-white/15 transition duration-300 text-black/90;
  }

  .btn-menu:active :global svg {
    transform: scale(1.1);
  }

  .btn-bookmark-delete {
    @apply h-24 w-[60px] rounded-3 bg-black/15 text-center text-12 font-600 leading-18 text-black/75 transition duration-100 first-of-type:mr-6 hover:bg-black/10;
  }

  .bookmarkText::first-letter {
    font-family: "Open Sans";
    font-size: 125px;
    color: #dcd8d1;
    font-style: normal;
    line-height: 100px;
    text-transform: uppercase;
    float: left;
    margin: 6px 6px 0 0;
    display: block;
    background: url("/images/TheEndoftheDay.webp") 0 0 no-repeat;
    background-size: cover;
    background-position: center;
    padding: 0 3px 3px 3px;
    border: 1px solid #111111;
    text-shadow: 0 0 6px rgb(0, 0, 0);
    box-shadow:
      rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  }
</style>
