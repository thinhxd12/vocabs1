<script lang="ts">
  import { enhance } from "$app/forms";
  import type { BookSearchType, DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fly } from "svelte/transition";
  import StarRating from "./StarRating.svelte";
  import { page } from "$app/state";
  import { showBookmark } from "$lib/store/layoutstore";

  type PageContent = {
    flipped: boolean;
    front: string;
    back: string;
  };

  let bookmark = $state<DBSelect["bookmark_table"] | undefined>(undefined);
  let bookInfo = $state<BookSearchType | undefined>(undefined);
  let isReset = $state<boolean>(false);
  let promise = $state(handleGetCurrentBookmark());

  async function handleGetCurrentId() {
    const { data } = await page.data.supabase
      .from("bookmark_progress")
      .select("*")
      .eq("id", 1);
    if (data) return data[0] as DBSelect["bookmark_progress"];
  }

  async function handleGetCurrentBookmark() {
    isReset = false;
    const idData = await handleGetCurrentId();
    if (!idData) return;
    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select("*")
      .eq("id", idData.currentId)
      .limit(1);
    if (data && data.length) {
      isReset = true;
      bookmark = data[0];
      handleGetBookInfo(data[0]);
      setBookContent(data[0].content);
    }
  }

  async function handleGetNextBookmark() {
    isReset = false;
    if (!bookmark) return;
    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select()
      .order("id", { ascending: true })
      .gt("id", bookmark.id)
      .limit(1);
    if (data && data.length) {
      handleSetBookmark(data[0]);
    } else {
      const { data } = await page.data.supabase
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
    if (!bookmark) return;
    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select()
      .order("id", { ascending: false })
      .lt("id", bookmark.id)
      .limit(1);

    if (data && data.length) {
      handleSetBookmark(data[0]);
    } else {
      const { data } = await page.data.supabase
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
    const { error } = await page.data.supabase
      .from("bookmark_progress")
      .update({ currentId: data.id })
      .eq("id", 1);

    isReset = true;
    if (data.bookTile !== bookmark?.bookTile) {
      handleGetBookInfo(data);
    }
    bookmark = data;
    setBookContent(data.content);
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
      const { error } = await page.data.supabase
        .from("bookmark_table")
        .update({ like: newLike })
        .eq("id", bookmark.id);
    } else {
      const newLike = bookmark.like - 1;
      bookmark = { ...bookmark, like: newLike };
      isReset = !isReset;
      const { error } = await page.data.supabase
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
    const { data, error } = await page.data.supabase.rpc("get_random_bookmark");
    if (data && data.length) {
      if (data[0].bookTile !== bookmark?.bookTile) {
        handleGetBookInfo(data[0]);
      }
      bookmark = data[0];
      setBookContent(data[0].content);
    }
  }

  let showEdit = $state<boolean>(false);
  let showInsert = $state<boolean>(false);
  let showDelete = $state<boolean>(false);

  async function handleDeleteBookmark() {
    if (!bookmark) return;
    const { error } = await page.data.supabase
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

  function getHeight(
    pText: string,
    pFont: string,
    pSize: number,
    pLine: number,
    pWidth: number
  ) {
    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);

    lDiv.innerHTML = pText;
    lDiv.style.fontFamily = pFont;
    lDiv.style.fontSize = "" + pSize + "px";
    lDiv.style.lineHeight = "" + pLine + "px";
    lDiv.style.width = "" + pWidth + "px";
    lDiv.style.padding = "0";
    lDiv.style.margin = "0";
    lDiv.style.boxSizing = "border-box";

    const height = lDiv.clientHeight;
    document.body.removeChild(lDiv);
    return height;
  }

  function getHeightFirstPage(
    pText: string,
    pFont: string,
    pSize: number,
    pLine: number,
    pWidth: number
  ) {
    let firstLetter = pText.slice(0, 1);
    let rest = pText.slice(1);
    if (!/^[a-zA-z0-9]+$/.test(firstLetter)) {
      firstLetter = pText.slice(0, 2);
      rest = pText.slice(2);
    }

    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);
    let cText = document.createElement("span");
    lDiv.appendChild(cText);
    cText.textContent = firstLetter;
    let restTextNode = document.createTextNode(rest);
    lDiv.appendChild(restTextNode);

    lDiv.style.fontFamily = pFont;
    lDiv.style.fontSize = "" + pSize + "px";
    lDiv.style.lineHeight = "" + pLine + "px";
    lDiv.style.width = "" + pWidth + "px";
    lDiv.style.padding = "0";
    lDiv.style.margin = "0";
    lDiv.style.boxSizing = "border-box";

    cText.style.fontFamily = "Open Sans";
    cText.style.fontSize = "125px";
    cText.style.lineHeight = "100px";
    cText.style.textTransform = "uppercase";
    cText.style.float = "left";
    cText.style.margin = "6px 6px 0 0";
    cText.style.padding = "0 3px 3px 3px";
    cText.style.border = "1px solid black";

    const height = lDiv.clientHeight;
    document.body.removeChild(lDiv);
    return height;
  }

  function splitIntoBlocks(text: string, maxHeight: number) {
    const words = text.split(" ");

    const result = words.reduce(
      (acc, curr) => {
        const last = acc[acc.length - 1];
        if (acc.length > 1) {
          if (
            getHeight(
              last + " " + curr,
              "Copernicus, sans-serif",
              14,
              24,
              285
            ) < maxHeight
          ) {
            acc[acc.length - 1] = (last + " " + curr).trim();
          } else {
            acc.push(curr);
          }
          return acc;
        } else {
          if (
            getHeightFirstPage(
              last + " " + curr,
              "Copernicus, sans-serif",
              14,
              24,
              285
            ) < maxHeight
          ) {
            acc[acc.length - 1] = (last + " " + curr).trim();
          } else {
            acc.push(curr);
          }
          return acc;
        }
      },
      [""]
    );
    if (result.length % 2 !== 0) result.push("");
    return result;
  }

  let currentPage = $state<number>(999);
  let pages = $state<string[]>([]);
  let flipPages = $state<PageContent[]>([]);

  function setBookContent(content: string) {
    pages = splitIntoBlocks(content, 450);
    let result: PageContent[] = [];
    const middle = pages.slice(1, -1);
    for (let i = 0; i < middle.length; i += 2) {
      result.push({
        flipped: false,
        front: middle[i],
        back: middle[i + 1] || "",
      });
    }
    flipPages = result;
  }

  let insertData = $state<DBSelect["bookmark_table"][] | undefined>(undefined);

  async function showInsertBookmark() {
    showInsert = !showInsert;
    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select("*")
      .order("id", { ascending: false })
      .limit(12);
    if (data) insertData = data;
  }

  let isSubmitting = $state<boolean>(false);
</script>

<svelte:head>
  <title>
    {bookmark ? `${bookmark.bookTile}` : "Bookmark"}
  </title>
  <meta name="bookmark" content="Some bookmark" />
</svelte:head>

<div class="flex items-center justify-between flex-1 h-full relative">
  <div
    class="w-[240px] h-full relative z-50 flex flex-col items-center justify-between overflow-hidden backdrop-blur-xl bg-gradient-to-b from-black/80 via-black/70 via-70% to-black/15 border-r border-black/10 shadow-lg shadow-black/30"
  >
    <div class="flex flex-col items-center">
      {#if bookmark}
        <div class="grid grid-cols-2 gap-3 w-3/4 px-3 py-6">
          <span class="text-white text-12 leading-18 font-500 text-left">
            {format(new Date(bookmark.dateOfCreation), "p cccc")}
          </span>
          <span class="text-white text-12 leading-18 font-500 text-right">
            {format(new Date(bookmark.dateOfCreation), "do MMMM yyyy")}
          </span>
        </div>
      {/if}
      {#if bookInfo}
        {#if bookInfo.coverImage}
          <img
            src={bookInfo.coverImage}
            alt="book-cover"
            class="mb-9 mt-[40px] shadow-lg shadow-black/60"
            width="120"
          />

          <div class="w-[120px] flex justify-end items-center mb-9">
            <button
              class="size-15 flex items-center justify-center {isReset
                ? 'text-white/40'
                : 'text-[#a90909]'} hover:text-[#a90909] transition-all"
              onclick={handleCheckBookmark}
            >
              <Icon icon="solar:heart-bold" width="15" height="15" />
            </button>
            <span
              class="text-10 leading-15 font-500 mx-3 text-white/40 select-none"
            >
              {bookmark?.like}
            </span>

            {#if bookInfo && bookInfo.numberOfRatings}
              <Icon
                icon="solar:eye-bold"
                width="15"
                height="15"
                class="text-white/40 ml-6"
              />
              <span
                class="text-10 leading-15 font-500 mx-3 text-white/40 select-none"
              >
                {Number(bookInfo.numberOfRatings).toLocaleString()}
              </span>
            {/if}
          </div>
        {/if}

        {#if bookInfo.title}
          <p
            class="mb-3 w-3/4 text-14 text-white font-500 leading-18 text-center"
          >
            {bookInfo.title}
          </p>
        {/if}

        {#if bookInfo.authors}
          <p class="mb-3 text-12 leading-18 text-white/70 text-center font-500">
            {bookInfo.authors.join(", ")}
          </p>
        {/if}

        {#if bookInfo.publishedYear}
          <p class="mb-3 text-11 leading-18 text-white/60 text-center">
            First published {bookInfo.publishedYear}
          </p>
        {/if}
        {#if bookInfo.numberOfRatings}
          <div class="mb-3 flex items-center justify-center pl-33">
            <StarRating
              rating={Number(bookInfo.averageRating)}
              size={15}
              gap={3}
            />
            <span
              class="ml-3 w-30 text-center text-12 pt-3 leading-15 text-white/70"
            >
              ({bookInfo.averageRating})
            </span>
          </div>
        {/if}
      {/if}
    </div>

    <div class="flex justify-center items-baseline w-full py-9">
      <button class="btn-menu" onclick={copyBookMarkToClipboard}>
        <Icon icon="solar:copy-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (promise = getRandomBookmark())}>
        <Icon icon="solar:refresh-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (showEdit = !showEdit)}>
        <Icon icon="solar:document-add-linear" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={showInsertBookmark}>
        <Icon icon="solar:library-linear" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => (showDelete = !showDelete)}>
        <Icon icon="solar:trash-bin-trash-outline" width="15" height="15" />
      </button>

      <button class="btn-menu" onclick={() => ($showBookmark = !$showBookmark)}>
        <Icon icon="solar:pallete-2-linear" width="15" height="15" />
      </button>
    </div>
  </div>

  <div class="flex-1 h-full flex justify-center items-center">
    <div class="book">
      <div class="cover-front">
        {#await promise}
          <img
            src="/gif/whisperoftheheart.gif"
            alt="loading"
            width={270}
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        {:then data}
          <p class="book-content">{pages[0]}</p>
          <button
            onclick={() => (promise = handleGetPrevBookmark())}
            class="btn-prev"
            aria-label="left"
          >
          </button>
        {:catch error}
          <p style="color: red">{error.message}</p>
        {/await}
      </div>

      {#if bookmark && bookmark.like}
        <button
          class="ribbon {isReset ? 'text-white/80' : 'text-white'}"
          onclick={handleCheckBookmark}
        >
          {bookmark?.like}
        </button>
      {:else}
        <button
          class="ribbon-zero"
          onclick={handleCheckBookmark}
          aria-label="zero"
        ></button>
      {/if}

      <div class="flip-book">
        {#await promise}
          <div class="cover-back"></div>
        {:then data}
          {#each flipPages as page, i}
            <button
              class="flip"
              class:flipped={page.flipped}
              style="z-index: {i == currentPage
                ? 999
                : page.flipped
                  ? i + 1
                  : flipPages.length - i};"
              onclick={() => {
                currentPage = i;
                flipPages[i].flipped = !flipPages[i].flipped;
                setTimeout(() => {
                  currentPage = 999;
                }, 300);
              }}
            >
              <div class="front">
                <p class="book-content">{page.front}</p>
                <div class="page-fold-right" aria-label="right"></div>
              </div>
              <div class="back">
                <p class="book-content">{page.back}</p>
                <div class="page-fold-left" aria-label="left"></div>
              </div>
            </button>
          {/each}
          <div class="cover-back">
            <p class="book-content">
              {pages[pages.length - 1]}
            </p>
            <button
              onclick={() => (promise = handleGetNextBookmark())}
              class="btn-next"
              aria-label="right"
            >
            </button>
          </div>
        {:catch error}
          <div class="cover-back"></div>
        {/await}
      </div>
    </div>
  </div>

  {#if showEdit}
    <div
      class="w-[calc(100%-240px)] h-full absolute left-[240px] top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-black/80 via-black/60 via-70% to-black/15"
      transition:fly={{ y: "-100%", duration: 300 }}
    >
      {#if bookmark}
        <form
          name="editbookmark"
          action="?/editBookmark"
          method="post"
          class="w-full p-18"
          use:enhance={({ formElement, formData, action, cancel }) => {
            isSubmitting = true;
            return async ({ result, update }) => {
              if (result.status === 200) {
                toast.success("Update bookmark successfully", {
                  class: "my-toast",
                });
                setBookContent(bookmark!.content);
              } else {
                toast.error("Error", {
                  class: "my-toast",
                });
              }
              isSubmitting = false;
            };
          }}
        >
          <input hidden name="id" autocomplete="off" value={bookmark.id} />
          <textarea
            class="p-9 w-full style-1 rounded-3 border-0 font-copernicus text-14 font-400 leading-24 bg-[#f5f5f5] outline-none ring-1 ring-white/30"
            name="content"
            autocomplete="off"
            onkeydown={(e) => e.stopPropagation()}
            rows="12"
            bind:value={bookmark.content}
          ></textarea>

          <div class="relative rounded-3 overflow-hidden">
            <div
              class="absolute flex items-center justify-center inset-y-0 start-3 {bookmark.like
                ? 'text-[#a90909]'
                : ''}"
            >
              <Icon icon="solar:heart-bold" width="15" height="15" />
            </div>
            <input
              class="block w-1/12 py-3 outline-none pl-24 font-copernicus text-14 leading-12 font-500"
              name="like"
              type="number"
              min="0"
              autocomplete="off"
              onkeydown={(e) => e.stopPropagation()}
              bind:value={bookmark.like}
            />
          </div>
          <div class="flex w-full items-center justify-center gap-24 mt-6">
            <button
              class="btn-form"
              type="button"
              onclick={() => (showEdit = !showEdit)}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-form disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Submit
            </button>
          </div>
        </form>
      {/if}
    </div>
  {/if}

  {#if showInsert}
    <div
      class="w-[calc(100%-240px)] flex flex-col h-full absolute left-[240px] top-0 z-40 p-18 backdrop-blur-xl bg-gradient-to-b from-black/80 via-black/60 via-70% to-black/15"
      transition:fly={{ y: "-100%", duration: 300 }}
    >
      <form
        name="insertbookmark"
        action="?/insertBookmark"
        method="post"
        class="w-full h-1/2"
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
          class="p-9 w-full style-1 rounded-3 border-0 font-copernicus text-14 font-400 leading-24 bg-[#f5f5f5] outline-none ring-1 ring-white/30"
          name="content"
          autocomplete="off"
          onkeydown={(e) => e.stopPropagation()}
          rows="12"
        ></textarea>
        <div class="flex w-full items-center justify-center gap-24 mt-6">
          <button
            class="btn-form"
            type="button"
            onclick={() => (showInsert = !showInsert)}
          >
            Cancel
          </button>
          <button type="submit" class="btn-form">Insert</button>
        </div>
      </form>

      {#if insertData}
        <div class="flex-1 w-full overflow-y-scroll style-1">
          <table class="w-full">
            <thead>
              <tr class="text-12 font-400 bg-gray-50">
                <th>id</th>
                <th>authors</th>
                <th>bookTile</th>
                <th>date</th>
                <th>content</th>
              </tr>
            </thead>
            <tbody>
              {#each insertData as item}
                <tr
                  class="text-12 font-400 h-30 overflow-hidden w-full border-b border-gray-50/30"
                >
                  <td
                    class="max-w-[40px] whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {item.id}
                  </td>
                  <td
                    class="max-w-[50px] whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {item.authors}
                  </td>
                  <td
                    class="max-w-[180px] whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {item.bookTile}
                  </td>
                  <td
                    class="max-w-[80px] whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {format(new Date(item.dateOfCreation), "P")}
                  </td>
                  <td
                    class="max-w-[350px] h-30 whitespace-nowrap text-ellipsis overflow-hidden"
                  >
                    {item.content}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}

  {#if showDelete}
    <div
      class="absolute top-0 left-[calc(50%+120px)] -translate-x-1/2 flex items-center p-6"
      transition:fly={{ y: "-100%", duration: 100 }}
    >
      <div
        class="layout-black flex flex-col items-center justify-center rounded-3 p-6"
      >
        <p class="mb-6 text-12 text-white">Delete this bookmark?</p>
        <div class="flex items-center justify-center">
          <button class="btn-delete" onclick={() => (showDelete = !showDelete)}>
            Cancel
          </button>
          <button
            class="btn-delete !text-red-600"
            onclick={() => (promise = handleDeleteBookmark())}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .book {
    display: flex;
    padding: 0 15px 0;
    box-shadow: 0 30px 21px rgba(0, 0, 0, 0.6);
    border-radius: 3px;
    position: relative;
    background-image: url("/images/paper.webp");
    background-size: cover;
  }

  .cover-front {
    width: 376px;
    height: 550px;
    position: relative;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 18%
      ),
      linear-gradient(0deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%);
    cursor: default;
    border-right: 1px solid rgba(204, 204, 204, 0.7);
  }

  .book::before {
    content: "";
    background-color: #bdbaad;
    position: absolute;
    top: 0;
    left: 8px;
    right: 8px;
    bottom: 0;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.9);
  }

  .cover-back {
    width: 375px;
    height: 550px;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        -90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 18%
      ),
      linear-gradient(0deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%);
    cursor: default;
  }

  .flip-book {
    width: 375px;
    height: 550px;
    position: relative;
    perspective: 2000px;
  }

  .flip {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: left;
    transform-style: preserve-3d;
    transform: rotateY(0deg);
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    color: #000;
    border: 1px solid rgba(204, 204, 204, 0.7);
    cursor: pointer;
    user-select: text;
  }

  .flipped {
    transform: rotateY(-180deg);
  }

  .front {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    box-sizing: border-box;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        -90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 18%
      ),
      linear-gradient(0deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%);
  }
  .back {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 99;
    transform: rotateY(180deg);
    backface-visibility: hidden;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 18%
      ),
      linear-gradient(0deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%);
  }

  .page-fold-right {
    position: absolute;
    width: 0;
    height: 0;
    top: 0;
    right: 0;
    z-index: 999;
    background-image: linear-gradient(
      45deg,
      #f7f7f7 0%,
      rgba(247, 247, 247, 0.3) 49%,
      transparent 50%,
      transparent 100%
    );
    border-left: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
    box-shadow: -3px 3px 9px rgba(0, 0, 0, 0.45);
    transition: all 0.15s ease-out;
  }

  .page-fold-left {
    position: absolute;
    width: 0;
    height: 0;
    top: 0;
    left: 0;
    background-image: linear-gradient(
      135deg,
      transparent 0%,
      transparent 49%,
      #e9e8e8 50%,
      #dadada 100%
    );
    z-index: 999;
    border-right: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
    box-shadow: 3px 3px 9px rgba(0, 0, 0, 0.45);
    transition: all 0.15s ease-out;
  }

  .front:hover .page-fold-right {
    width: 60px;
    height: 60px;
  }

  .back:hover .page-fold-left {
    width: 60px;
    height: 60px;
  }

  .btn-prev {
    position: absolute;
    width: 45px;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
    cursor: pointer;
  }

  .btn-next {
    position: absolute;
    width: 45px;
    height: 100%;
    top: 0;
    right: 0;
    z-index: 0;
    cursor: pointer;
  }

  .book-content {
    height: 450px;
    width: 285px;
    font-family: "Copernicus", sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    margin: 50px 45px;
    overflow: hidden;
    text-align: left;
  }

  .cover-front .book-content::first-letter {
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

  .ribbon-zero {
    width: 36px;
    height: 6px;
    position: absolute;
    padding-top: 6px;
    top: -6px;
    left: 352px;
    border-top-left-radius: 3px;
    user-select: none;
    background: #a90909;
  }

  .ribbon-zero:before {
    height: 0;
    width: 0;
    right: -4px;
    top: 0.1px;
    border-bottom: 6px solid #c02031;
    border-right: 5px solid transparent;
  }
  .ribbon-zero:before {
    content: "";
    position: absolute;
  }

  .ribbon {
    width: 36px;
    height: 300px;
    position: absolute;
    padding-top: 6px;
    top: -6px;
    left: 352px;
    text-align: center;
    border-top-left-radius: 3px;
    font-family: "Copernicus", sans-serif;
    font-size: 24px;
    line-height: 30px;
    user-select: none;
    background: linear-gradient(
      180deg,
      rgb(169, 9, 9) 0%,
      rgba(229, 33, 28, 1) 20%,
      rgba(164, 5, 2, 1) 40%,
      rgb(229, 10, 0) 100%
    );
    box-shadow: 0 3px 6px 1px rgba(0, 0, 0, 0.45);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    z-index: 12;
  }

  .ribbon:active {
    box-shadow: none;
  }

  .ribbon:before {
    height: 0;
    width: 0;
    right: -4px;
    top: 0.1px;
    border-bottom: 6px solid #c02031;
    border-right: 5px solid transparent;
  }

  .ribbon:before,
  .ribbon:after {
    content: "";
    position: absolute;
  }

  .ribbon:after {
    height: 0;
    width: 36px;
    top: 300px;
    left: 0;
    border-left: 18px solid #e50a00;
    border-right: 18px solid #e50a00;
    border-bottom: 18px solid transparent;
  }

  .btn-menu {
    @apply mx-3 size-27 flex items-center justify-center transition duration-300 text-white/60 hover:text-white;
  }
  .btn-menu:active :global svg {
    transform: scale(1.1);
  }
  .btn-form {
    @apply rounded-2 text-center text-12 shadow font-400 leading-18 text-white bg-white/15 transition hover:bg-white/10 py-3 px-6;
  }

  .btn-delete {
    @apply h-24 w-[60px] rounded-3 bg-black/15 text-center text-12 font-600 leading-18 text-black/75 transition duration-100 first-of-type:mr-6 hover:bg-black/10;
  }
</style>
