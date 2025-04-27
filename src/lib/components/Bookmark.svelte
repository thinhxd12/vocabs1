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

  type PageContent = {
    flipped: boolean;
    front: string;
    back: string;
  };

  let bookmark = $state<DBSelect["bookmark_table"] | undefined>(undefined);
  let bookInfo = $state<BookSearchType | undefined>(undefined);
  let isReset = $state<boolean>(false);
  let isLoading = $state<boolean>(false);

  onMount(() => {
    handleGetCurrentBookmark();
  });

  async function handleGetCurrentId() {
    const { data } = await page.data.supabase
      .from("bookmark_progress")
      .select("*")
      .eq("id", 1);
    if (data) return data[0] as DBSelect["bookmark_progress"];
  }

  async function handleGetCurrentBookmark() {
    isReset = false;
    isLoading = true;
    const idData = await handleGetCurrentId();
    if (!idData) return;
    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select("*")
      .eq("id", idData.currentId)
      .limit(1);
    if (data && data.length) {
      isReset = true;
      isLoading = false;
      bookmark = data[0];
      handleGetBookInfo(data[0]);
      setBookContent(data[0].content);
    }
  }

  async function handleGetNextBookmark() {
    isReset = false;
    isLoading = true;
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
    isLoading = true;
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
    isLoading = false;
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

  function getWidth(
    pText: string,
    pFontFam: string,
    pFontSize: number,
    pFontHeight: number
  ) {
    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);

    lDiv.style.fontSize = "" + pFontSize + "px";
    lDiv.style.lineHeight = "" + pFontHeight + "px";
    lDiv.style.fontFamily = pFontFam;
    lDiv.style.position = "absolute";
    lDiv.style.left = "-1000";
    lDiv.style.top = "-1000";
    lDiv.style.textWrap = "nowrap";

    lDiv.innerHTML = pText;
    const width = lDiv.clientWidth;
    document.body.removeChild(lDiv);

    return width;
  }

  function splitIntoBlocks(
    text: string,
    firstHeight: number,
    otherHeight: number
  ) {
    const words = text.split(" ");
    let currentLen = firstHeight;

    const result = words.reduce(
      (blocks, word) => {
        const last = blocks[blocks.length - 1];

        if (
          getWidth(last + " " + word, "GaramondPro, sans-serif", 18, 28) <
          currentLen
        ) {
          blocks[blocks.length - 1] = (last + " " + word).trim();
        } else {
          blocks.push(word);
          currentLen = otherHeight;
        }

        return blocks;
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
    pages = splitIntoBlocks(content, 3800, 4250);
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
</script>

<div class="flex items-center justify-between flex-1 h-full relative">
  <div
    class="w-[240px] h-full relative z-50 flex flex-col items-center justify-between overflow-hidden backdrop-blur-xl bg-gradient-to-b from-black/80 via-black/70 via-70% to-black/15 border-r border-black/10 shadow-lg shadow-black/30"
  >
    <div class="flex flex-col items-center">
      {#if bookmark}
        <p
          class="text-white text-14 leading-18 font-500 text-left w-[240px] pl-6 mt-3"
        >
          {format(new Date(bookmark.dateOfCreation), "cccc p")}
        </p>
        <p
          class="text-white text-12 leading-18 font-500 text-left w-[240px] pl-6"
        >
          {format(new Date(bookmark.dateOfCreation), "do MMMM yyyy")}
        </p>
      {/if}
      {#if bookInfo && bookInfo.coverImage}
        <img
          src={bookInfo.coverImage}
          alt="book-cover"
          class="mb-9 mt-[40px] shadow-lg shadow-black/60"
          width="120"
        />
      {/if}

      {#if bookmark}
        <div class="w-[120px] flex justify-end items-center mb-9">
          <button
            class="size-15 flex items-center justify-center {isReset
              ? 'text-white/40'
              : 'text-[#f8463f]'} hover:text-[#f8463f] transition-all"
            onclick={handleCheckBookmark}
          >
            <Icon icon="solar:heart-bold" width="15" height="15" />
          </button>
          <span
            class="text-10 leading-15 font-500 mx-3 text-white/40 select-none"
          >
            {bookmark.like}
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

      {#if bookInfo && bookInfo.title}
        <p class="mb-3 text-14 text-white font-500 leading-18 text-center">
          {bookInfo.title}
        </p>
      {/if}

      {#if bookInfo && bookInfo.authors}
        <p class="mb-3 text-12 leading-18 text-white/70 text-center font-500">
          {bookInfo.authors.join(", ")}
        </p>
      {/if}

      {#if bookInfo && bookInfo.publishedYear}
        <p class="mb-3 text-11 leading-18 text-white/60 text-center">
          First published {bookInfo.publishedYear}
        </p>
      {/if}
      {#if bookInfo && bookInfo.numberOfRatings}
        <div class="mb-3 flex items-center justify-center pl-33">
          <StarRating
            rating={Number(bookInfo.averageRating)}
            size={15}
            gap={3}
          />
          <span
            class="ml-3 w-30 text-center text-12 pt-3 leading-15 text-white/70"
          >
            {bookInfo.averageRating}
          </span>
        </div>
      {/if}
    </div>

    <div class="flex justify-center items-baseline w-full py-9">
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
    </div>
  </div>

  {#if bookmark}
    <div class="flex-1 h-full flex justify-center items-center">
      <div class="book">
        <div class="cover-front">
          {#if isLoading}
            <img
              src="/gif/whisperoftheheart.gif"
              alt="loading"
              width={300}
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          {:else}
            <p class="book-content">{pages[0]}</p>
            <button
              onclick={handleGetPrevBookmark}
              class="btn-prev"
              aria-label="left"
            >
            </button>
          {/if}
        </div>
        {#if bookmark.like}
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

        {#if isLoading}
          <div class="flip-book"><div class="cover-back"></div></div>
        {:else}
          <div class="flip-book">
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
                onclick={handleGetNextBookmark}
                class="btn-next"
                aria-label="right"
              >
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if showEdit}
    <div
      class="w-[calc(100%-240px)] h-full absolute left-[240px] top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-black/80 via-black/60 via-70% to-black/15"
      transition:fly={{ x: "-100%", duration: 100 }}
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
                setBookContent(bookmark!.content);
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
            class="p-9 w-full style-1 rounded-3 border-0 font-garamond text-18 font-400 leading-21 bg-[#f5f5f5] outline-none ring-1 ring-white/30"
            name="content"
            autocomplete="off"
            onkeydown={(e) => e.stopPropagation()}
            rows="12"
            bind:value={bookmark.content}
          ></textarea>
          <div class="flex w-full items-center justify-center gap-24 mt-6">
            <button
              class="btn-form"
              type="button"
              onclick={() => (showEdit = !showEdit)}
            >
              Cancel
            </button>
            <button type="submit" class="btn-form"> Submit </button>
          </div>
        </form>
      {/if}
    </div>
  {/if}

  {#if showInsert}
    <div
      class="w-[calc(100%-240px)] h-full absolute left-[240px] top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-black/80 via-black/60 via-70% to-black/15"
      transition:fly={{ x: "-100%", duration: 100 }}
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
          class="p-9 w-full style-1 rounded-3 border-0 font-garamond text-18 font-400 leading-21 bg-[#f5f5f5] outline-none ring-1 ring-white/30"
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
            onclick={handleDeleteBookmark}
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
    padding: 1px 6px 0;
    box-shadow: 0 30px 21px rgba(0, 0, 0, 0.6);
    border-radius: 2px;
    position: relative;
    background-image: url("/images/paper.webp");
    background-size: cover;
  }

  .cover-front {
    position: relative;
    width: 375px;
    height: 550px;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 18%
      ),
      linear-gradient(0deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 9%);
    cursor: pointer;
    border-right: 1px solid rgba(204, 204, 204, 0.7);
  }

  .cover-back {
    width: 100%;
    height: 100%;
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
    cursor: pointer;
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
    border-left-width: 1px;
    border-left-color: #dddddd;
    border-left-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: -5px 5px 10px #dddddd;
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
      #f7f7f7 50%,
      rgba(222, 222, 222, 0.7) 100%
    );
    z-index: 999;
    border-right-width: 1px;
    border-right-color: #dddddd;
    border-right-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: 5px 5px 10px #dddddd;
    transition: all 0.15s ease-out;
  }

  .front:hover .page-fold-right {
    width: 50px;
    height: 50px;
  }

  .back:hover .page-fold-left {
    width: 50px;
    height: 50px;
  }

  .btn-prev {
    position: absolute;
    width: 45px;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
  }

  .btn-next {
    position: absolute;
    width: 45px;
    height: 100%;
    top: 0;
    right: 0;
    z-index: 0;
  }

  .book-content {
    height: 100%;
    width: 100%;
    font-family: GaramondPro, sans-serif;
    font-weight: 400;
    font-size: 18px;
    line-height: 28px;
    padding: 50px 45px;
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
    width: 40px;
    height: 6px;
    position: absolute;
    top: -6px;
    left: 336px;
    border-top-left-radius: 3px;
    user-select: none;
    background: rgb(169, 9, 9);
  }

  .ribbon-zero:before {
    height: 0;
    width: 0;
    right: -4px;
    top: 0.1px;
    border-bottom: 6px solid #c02031;
    border-right: 4px solid transparent;
  }
  .ribbon-zero:before {
    content: "";
    position: absolute;
  }

  .ribbon {
    width: 40px;
    height: 90px;
    position: absolute;
    padding-top: 6px;
    top: -6px;
    left: 336px;
    text-align: center;
    border-top-left-radius: 3px;
    font-family: "GaramondPro", sans-serif;
    font-size: 25px;
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
    border-right: 4px solid transparent;
  }
  .ribbon:before,
  .ribbon:after {
    content: "";
    position: absolute;
  }

  .ribbon:after {
    height: 0;
    width: 0;
    top: 90px;
    left: 0;
    border-left: 20px solid #e50a00;
    border-right: 20px solid #e50a00;
    border-bottom: 12px solid transparent;
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
