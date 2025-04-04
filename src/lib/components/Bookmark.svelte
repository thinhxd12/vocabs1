<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SelectBookmark } from "$lib/db/schema";
  import type { BookSearchType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { Dialog } from "bits-ui";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fade, fly } from "svelte/transition";

  let bookmark = $state<SelectBookmark | undefined>(undefined);
  let bookInfo = $state<BookSearchType | undefined>(undefined);

  let isReset = $state<boolean>(false);
  let isLoading = $state<boolean>(false);

  onMount(async () => {
    const response = await fetch(`/server/getbookmark?select=true`);
    bookmark = await response.json();
    if (bookmark) {
      isReset = true;
      handleGetBookInfo(bookmark);
    }
  });

  async function handleGetBookInfo(data: SelectBookmark) {
    const response = await fetch(
      `/server/getbookinfo?query=${data.bookTile.split(":")[0]}&author=${data.authors.split(";")[0]}`
    );
    bookInfo = await response.json();
  }

  async function handleGetNextBookmark() {
    isReset = false;
    isLoading = true;
    const response = await fetch(`/server/getbookmark?nextid=${bookmark!.id}`);
    const data = await response.json();
    isReset = true;
    isLoading = false;

    if (data) {
      if (data.bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data);
      }
      bookmark = data;
    }
  }

  async function handleGetPrevBookmark() {
    isReset = false;
    isLoading = true;
    const response = await fetch(`/server/getbookmark?previd=${bookmark!.id}`);
    const data = await response.json();
    isReset = true;
    isLoading = false;

    if (data) {
      if (data.bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data);
      }
      bookmark = data;
    }
  }

  async function handleCheckBookmark() {
    if (!bookmark) return;
    isLoading = true;
    if (isReset) {
      bookmark = { ...bookmark, like: (bookmark.like += 1) };
      fetch(`/server/getbookmark?like=${bookmark.id}`);
      isReset = !isReset;
      isLoading = false;
    } else {
      bookmark = { ...bookmark, like: (bookmark.like += -1) };
      fetch(`/server/getbookmark?unlike=${bookmark.id}`);
      isReset = !isReset;
      isLoading = false;
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
    const response = await fetch(`/server/getbookmark?random=true`);
    const data = await response.json();
    if (data) {
      if (data.bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data);
      }
      bookmark = data;
    }
  }

  let showEdit = $state<boolean>(false);
  let showInsert = $state<boolean>(false);
  let showDelete = $state<boolean>(false);

  async function handleDeleteBookmark() {
    if (!bookmark) return;
    const response = await fetch(`/server/deletebookmark?id=${bookmark.id}`);
    if (response.status === 200) {
      toast.success("Delete bookmark successfully");
    } else {
      toast.error("Error");
    }
    handleGetNextBookmark();
    showDelete = !showDelete;
  }
</script>

<svelte:head>
  <title
    >{bookmark
      ? `${bookmark.bookTile} by ${bookmark.authors}`
      : "Bookmark"}</title
  >
  <meta name="bookmark" content="Some bookmark" />
</svelte:head>

<section class="flex-1 h-full pt-[48px] px-[48px] flex flex-col">
  {#if bookmark}
    <div class="w-full flex-1 layout-light rounded-6 flex overflow-hidden">
      <div class="bg-black/15 w-[240px] h-full flex flex-col px-9">
        {#if bookInfo}
          <img
            src={bookInfo.coverImage}
            alt="book-cover"
            class="mx-auto my-18 w-3/4 shadow-xl shadow-black/90"
          />
          <h3 class="mb-3 text-15 font-400 leading-18 text-white">
            {bookInfo.title}
          </h3>
          <p class="mb-3 text-12 leading-14 text-secondary-white/60">
            {bookInfo.authors.join(", ")}
          </p>
          {#if bookInfo.publishedYear}
            <p class="mb-3 text-11 leading-12 text-secondary-white/60">
              First published {bookInfo.publishedYear}
            </p>
          {/if}
          {#if bookInfo.numberOfRatings}
            <div class="mb-3 flex items-center">
              <Icon
                icon="solar:star-bold"
                width="15"
                height="15"
                color="#f1ce42"
              />
              <span class="ml-3 text-11 leading-12 text-secondary-white/60">
                {bookInfo.averageRating}
              </span>
              <span class="ml-3 text-11 leading-12 text-secondary-white/60">
                ({Number(bookInfo.numberOfRatings).toLocaleString()}{" "}
                ratings)
              </span>
            </div>
          {/if}
        {/if}

        <div class="flex items-center w-full mt-3">
          <button class="btn-heart" onclick={handleCheckBookmark}>
            <Icon
              icon="solar:heart-bold"
              width="15"
              height="15"
              color={bookmark.like
                ? isReset
                  ? "#f08399"
                  : "#fd2c55"
                : "#f1f1f199"}
            />
          </button>

          <span class="text-11 ml-3 leading-12 text-secondary-white/60">
            {bookmark.like}
          </span>
        </div>
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
              class="layout-light flex flex-col items-center justify-center rounded-3 p-6"
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
            src="/svg/loader.svg"
            alt="loading"
            width={45}
            class="absolute left-1/2 top-1/2 -translate-x-1/2"
          />
        {:else}
          <div
            class="bookmarkText p-9 pl-21 font-garamond text-20 font-400 leading-30"
            transition:fade={{ duration: 300 }}
          >
            <div
              class="float-right ml-6 w-[60px] h-[60px] overflow-hidden bg-[#f0f0f0] flex flex-col shadow-md shadow-black/30 rounded-7"
            >
              <div
                class="bg-[#fe0000] h-18 w-full text-white px-3 flex items-end"
              >
                <small
                  class="text-8 font-rubik font-500 uppercase leading-13 mr-2"
                >
                  {format(new Date(bookmark.dateOfCreation), "E")}
                </small>
                <span class="text-11 font-rubik font-500 uppercase leading-14">
                  {format(new Date(bookmark.dateOfCreation), "MM/yy")}
                </span>
              </div>
              <div
                class="flex-1 w-full font-rubik text-[36px] leading-[27px] mt-6 text-center"
              >
                {format(new Date(bookmark.dateOfCreation), "dd")}
              </div>
              <p
                class="text-black font-rubik text-9 leading-10 text-center font-500"
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
      <button class="btn-menu" onclick={copyBookMarkToClipboard}>
        <Icon icon="solar:copy-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={getRandomBookmark}>
        <Icon icon="solar:refresh-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (showEdit = !showEdit)}>
        <Icon icon="solar:document-add-linear" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (showInsert = !showInsert)}>
        <Icon icon="solar:library-linear" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (showDelete = !showDelete)}>
        <Icon icon="solar:trash-bin-trash-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={handleGetPrevBookmark}>
        <Icon icon="solar:alt-arrow-left-linear" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={handleGetNextBookmark}>
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
      class="fixed inset-[48px_450px_48px_288px] z-50 overflow-y-scroll no-scrollbar rounded-6 p-6 outline-none layout-light"
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
                toast.success("Update bookmark successfully");
              } else {
                toast.error("Error");
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
      class="fixed inset-[48px_450px_48px_288px] z-50 overflow-y-scroll no-scrollbar rounded-6 p-6 outline-none layout-light"
    >
      <form
        name="insertbookmark"
        action="?/insertBookmark"
        method="post"
        class="w-full p-18"
        use:enhance={({ formElement, formData, action, cancel }) => {
          return async ({ result }) => {
            if (result.status === 200) {
              toast.success("Insert items successfully");
            } else {
              toast.error("Error");
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
    @apply mr-6 flex size-27 items-center justify-center rounded-full text-white shadow shadow-black/30 outline-none backdrop-blur-md transition duration-150;
  }

  .btn-menu:active :global svg {
    transform: scale(1.1);
  }

  .btn-heart:active {
    transform: scale(1.1);
    transition-duration: 300ms ease;
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
