<script lang="ts">
  import { enhance } from "$app/forms";
  import type { SelectBookmark } from "$lib/db/schema";
  import type { BookSearchType } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { Dialog } from "bits-ui";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fly } from "svelte/transition";

  let dummy = {
    id: "019406cb-a459-7718-b722-0da365846a03",
    authors: "Adolf Hitler",
    bookTile: "Hitler's Table Talk 1941-1944: Secret Conversations",
    page: 523,
    location: "8015-8019",
    dateOfCreation: "Added on Monday, February 20, 2023 10:26:10 PM".slice(9),
    content:
      "I have seen so many cases among members of our Party, whose wives have not been able to keep pace with their husbands’ rise in life. Grasping their opportunities, these latter have seen their talents blossom and expand in the execution of the tasks I have confided to them; burdened with wives who have ceased to be worthy of them, and exposed to unending petty domestic squabbles, they gradually come to accept as inevitable the idea of separation. To my mind, it is obvious that a man should seek in his wife qualities which are complementary to his own as the path towards a full and ideal life. But one cannot make hard and fast rules, and there are many exceptions.",
    type: "HIGHLIGHT",
    selected: true,
    like: 2,
  };
  const bookdummy = {
    title: "Hitler's Table Talk, 1941-1944",
    authors: ["Norman Cameron", "R.H. Stevens", "Hugh Trevor-Roper"],
    coverImage:
      "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1328003686i/54332._SX500_.jpg",
    detailsUrl:
      "https://www.goodreads.com/book/show/54332.Hitler_s_Table_Talk_1941_1944?from_search=true&from_srp=true&qid=OvFEDpFiHY&rank=1",
    goodreadsId: "54332",
    publishedYear: "1953",
    averageRating: "3.85",
    numberOfRatings: "593",
  };
  let bookmark = $state<SelectBookmark | undefined>(undefined);
  let bookInfo = $state<BookSearchType | undefined>(undefined);

  let isReset = $state<boolean>(true);

  onMount(async () => {
    const response = await fetch(`/server/getbookmark?select=true`);
    bookmark = await response.json();
    if (bookmark) handleGetBookInfo(bookmark);
  });

  async function handleGetBookInfo(data: SelectBookmark) {
    const response = await fetch(
      `/server/getbookinfo?query=${data.bookTile.split(":")[0]}&author=${data.authors.split(";")[0]}`
    );
    bookInfo = await response.json();
  }

  async function handleGetNextBookmark() {
    isReset = true;
    const response = await fetch(`/server/getbookmark?nextid=${bookmark!.id}`);
    const data = await response.json();
    if (data) {
      if (data.bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data);
      }
      bookmark = data;
    }
  }

  async function handleGetPrevBookmark() {
    isReset = true;
    const response = await fetch(`/server/getbookmark?previd=${bookmark!.id}`);
    const data = await response.json();
    if (data) {
      if (data.bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data);
      }
      bookmark = data;
    }
  }

  async function handleCheckBookmark() {
    if (!bookmark) return;
    if (isReset) {
      bookmark = { ...bookmark, like: (bookmark.like += 1) };
      fetch(`/server/getbookmark?like=${bookmark.id}`);
      isReset = !isReset;
      // show like effect
    } else {
      bookmark = { ...bookmark, like: (bookmark.like += -1) };
      fetch(`/server/getbookmark?unlike=${bookmark.id}`);
      isReset = !isReset;
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
</script>

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
          {#if bookInfo.numberOfRatings}
            <div class="mb-3 flex items-center">
              <Icon
                icon="mage:star-fill"
                width="13"
                height="13"
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
          {#if bookInfo.publishedYear}
            <p class="text-11 leading-12 text-secondary-white/60">
              First published {bookInfo.publishedYear}
            </p>
          {/if}
        {/if}
      </div>
      <div
        class="flex-1 h-full no-scrollbar relative overflow-y-scroll {bookmark.like
          ? "bg-[url('/images/paper.webp')]"
          : 'bg-[#dcd8d1]'} bg-cover bg-local"
      >
        <div
          class="bookmarkText p-9 pl-21 font-garamond text-20 font-400 leading-30"
        >
          <div
            class="float-right w-[60px] h-[60px] overflow-hidden bg-[#f0f0f0] flex flex-col shadow-md shadow-black/30 rounded-7"
          >
            <div
              class="bg-[#fe0000] h-18 text-12 pt-3 uppercase leading-14 text-center w-full font-rubik font-500 text-white px-3"
            >
              <small>
                {format(new Date(bookmark.dateOfCreation), "MMM")}
              </small>
              {format(new Date(bookmark.dateOfCreation), "yyyy")}
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
      </div>
    </div>

    <div class="h-[48px] flex justify-center items-center">
      <div
        class=" flex flex-col items-center justify-center mr-6 pt-6 relative"
      >
        <button class="btn-heart text-black" onclick={handleCheckBookmark}>
          <Icon
            icon="bi:heart-fill"
            width="18"
            height="18"
            color={bookmark.like ? (isReset ? "#f08399" : "#fd2c55") : "white"}
          />
        </button>

        <span class="text-9 leading-9 w-full text-center text-white">
          {bookmark.like}
        </span>
      </div>

      <button class="btn-menu" onclick={copyBookMarkToClipboard}>
        <Icon icon="solar:copy-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={getRandomBookmark}>
        <Icon icon="meteor-icons:dice" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (showEdit = !showEdit)}>
        <Icon icon="hugeicons:book-edit" width="15" height="15" />
      </button>

      <button class="btn-menu">
        <Icon icon="hugeicons:row-insert" width="15" height="15" />
      </button>

      <button class="btn-menu">
        <Icon icon="hugeicons:property-search" width="15" height="15" />
      </button>

      <button class="btn-menu">
        <Icon icon="hugeicons:delete-throw" width="15" height="15" />
      </button>

      <button class="btn-menu">
        <Icon
          icon="icon-park-outline:left"
          width="15"
          height="15"
          onclick={handleGetPrevBookmark}
        />
      </button>

      <button class="btn-menu">
        <Icon
          icon="icon-park-outline:right"
          width="15"
          height="15"
          onclick={handleGetNextBookmark}
        />
      </button>
    </div>
  {/if}
</section>

<Dialog.Root bind:open={showEdit} closeOnOutsideClick>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fly}
      transitionConfig={{ duration: 50 }}
      class="fixed inset-0 z-30 bg-black/30"
    />
    <Dialog.Content
      class="fixed inset-[48px_450px_48px_288px] z-50 overflow-y-scroll no-scrollbar rounded-6 p-6 outline-none layout-light"
    >
      {#if bookmark}
        <form
          action="?/editBookmark"
          method="post"
          class="w-full p-18"
          use:enhance={({ formElement, formData, action, cancel }) => {
            return async ({ result }) => {
              if (result.type === "failure") {
                toast.error(result.data?.error as string);
              } else {
                toast.success("Update bookmark successfully");
              }
            };
          }}
        >
          <input hidden name="id" autocomplete="off" value={bookmark.id} />
          <textarea
            class="p-9 w-full rounded-6 border-0 font-garamond text-18 font-400 leading-21 bg-[#dcd8d1] outline-none ring-1 ring-white/30"
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

<style>
  .btn-menu {
    @apply mr-6 flex size-27 items-center justify-center rounded-full text-white shadow shadow-black/30 outline-none backdrop-blur-md transition duration-100 hover:shadow;
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
