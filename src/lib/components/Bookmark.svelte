<script lang="ts">
  import { enhance } from "$app/forms";
  import type { BookSearchType, DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
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
  let isOpen = $state<boolean>(false);

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
      resetRenderBookmark();
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

    resetRenderBookmark();
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
    resetRenderBookmark();
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
            getHeight(last + " " + curr, "Proxima Nova", 16, 23, 345) <
            maxHeight
          ) {
            acc[acc.length - 1] = (last + " " + curr).trim();
          } else {
            acc.push(curr);
          }
          return acc;
        } else {
          if (
            getHeightFirstPage(last + " " + curr, "Proxima Nova", 16, 23, 345) <
            maxHeight
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
    pages = splitIntoBlocks(content, 435);
    let result: PageContent[] = [];
    for (let i = 0; i < pages.length; i += 2) {
      result.push({
        flipped: false,
        front: pages[i],
        back: pages[i + 1] || "",
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
      .limit(9);
    if (data) insertData = data;
  }

  let isSubmitting = $state<boolean>(false);
  let showTranslated = $state<boolean>(false);
  let translatedContent = $state<string>("");

  async function translateContent() {
    if (!translatedContent.length) {
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=vi&q=${bookmark?.content}`;
      const response = await fetch(url);
      const data = await response.json();
      translatedContent = data[0][0];
    }

    if (showTranslated) {
      setBookContent(bookmark!.content);
      showTranslated = false;
    } else {
      setBookContent(translatedContent);
      showTranslated = true;
    }
  }

  function resetRenderBookmark() {
    setTimeout(() => {
      isReset = true;
      translatedContent = "";
      showTranslated = false;
    }, 300);
  }
</script>

<svelte:head>
  <title>
    {bookmark ? `${bookmark.bookTile}` : "Bookmark"}
  </title>
  <meta name="bookmark" content="Some bookmark" />
</svelte:head>

<div class="flex items-center justify-center flex-1 h-full relative">
  {#if showEdit}
    <div
      class="w-full h-full absolute top-0 left-0 z-40 flex items-center justify-center"
    >
      <div
        class="w-4/5 aspect-[1.61803398875] layout-black !bg-black/60"
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
              class="p-9 w-full style-1 rounded-3 border-0 font-proxima text-14 font-400 leading-24 bg-[#f5f5f5] outline-none ring-1 ring-white/30"
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
                class="block w-1/12 py-3 outline-none pl-24 font-proxima text-14 leading-12 font-500"
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
    </div>
  {/if}

  {#if showInsert}
    <div
      class="w-full h-full absolute top-0 left-0 z-40 flex items-center justify-center"
    >
      <div
        class="w-4/5 aspect-[1.61803398875] layout-black !bg-black/60"
        transition:fly={{ y: "-100%", duration: 300 }}
      >
        <form
          name="insertbookmark"
          action="?/insertBookmark"
          method="post"
          class="w-full h-1/2 flex flex-col"
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
            class="p-9 w-full style-1 rounded-3 border-0 font-proxima text-14 font-400 leading-24 bg-[#f5f5f5] outline-none ring-1 ring-white/30"
            name="content"
            autocomplete="off"
            onkeydown={(e) => e.stopPropagation()}
            rows="11"
          ></textarea>

          <div class="flex w-full items-center justify-center gap-24 my-6">
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
          <div class="flex-1 w-full overflow-y-scroll style-1 font-proxima">
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
                    class="text-12 font-400 h-30 overflow-hidden w-full border-b border-gray-50/30 text-white"
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
    </div>
  {/if}

  {#if showDelete}
    <div
      class="flex items-center p-6 absolute left-[30%] top-[80px] -translate-x-1/2 z-40"
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

  <div class="book" class:openned={isOpen} class:closed={!isOpen}>
    <div
      class="front-cover bg-black"
      style="z-index: {isOpen ? flipPages.length + 2 : 99}"
    >
      <button
        class="front flex justify-center"
        style="background-color: black; background-image: none;"
        onclick={() => {
          isOpen = true;
        }}
      >
        {#if bookInfo}
          <img
            src={bookInfo.coverImage}
            alt="book-cover"
            class="w-full h-full object-contain"
          />
        {:else}
          <img src="/images/paper.webp" alt="" class="w-3/5 h-full" />
        {/if}
        <div class="ribbonFrontCover"></div>
      </button>

      <div class="back flex justify-center items-center">
        <button
          class="w-full h-full absolute top-0 left-0"
          onclick={() => {
            isOpen = false;
            handleGetNextBookmark();
          }}
          aria-label="prev-bookmark"
        ></button>

        <div class="flex flex-col justify-center items-center h-full relative">
          {#if bookInfo}
            {#if bookInfo.coverImage}
              <img
                src={bookInfo.coverImage}
                alt="book-cover"
                class="mb-9 shadow-sm shadow-black/30"
                width="120"
              />

              <div class="flex justify-end items-center mb-6">
                <Icon
                  icon="solar:heart-bold"
                  width="15"
                  height="15"
                  class="text-[#707070] ml-6"
                />
                <span
                  class="text-10 leading-15 font-500 mx-3 text-[#707070] select-none"
                >
                  {bookmark?.like}
                </span>

                {#if bookInfo && bookInfo.numberOfRatings}
                  <Icon
                    icon="solar:eye-bold"
                    width="15"
                    height="15"
                    class="text-[#707070] ml-6"
                  />
                  <span
                    class="text-10 leading-15 font-500 mx-3 text-[#707070] select-none"
                  >
                    {Number(bookInfo.numberOfRatings).toLocaleString()}
                  </span>
                {/if}
              </div>
            {/if}

            {#if bookInfo.title}
              <p
                class="mb-3 w-3/4 text-14 font-copernicus text-[#1e1915] font-600 leading-18 text-center"
              >
                {bookInfo.title}
              </p>
            {/if}

            {#if bookInfo.authors}
              <p
                class="mb-3 text-12 font-copernicus leading-18 text-[#1e1915] text-center font-400"
              >
                {bookInfo.authors.join(", ")}
              </p>
            {/if}

            {#if bookmark}
              <p
                class="text-[#4f4f4d] text-12 font-proxima leading-18 font-400 text-left"
              >
                at {format(
                  new Date(bookmark.dateOfCreation),
                  "p cccc, do MMMM yyyy"
                )}
              </p>
            {/if}

            {#if bookInfo.publishedYear}
              <p
                class="mb-3 text-12 leading-18 font-proxima font-400 text-[#4f4f4d] text-center"
              >
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
                  class="ml-3 w-30 text-center text-12 pt-3 leading-15 font-proxima font-400 text-[#4f4f4d]"
                >
                  ({bookInfo.averageRating})
                </span>
              </div>
            {/if}
          {/if}

          <div class="flex justify-center items-baseline w-full pt-18">
            <button class="btn-menu" onclick={() => translateContent()}>
              <Icon icon="ic:twotone-g-translate" width="15" height="15" />
            </button>

            <button class="btn-menu" onclick={copyBookMarkToClipboard}>
              <Icon icon="solar:copy-outline" width="15" height="15" />
            </button>

            <button
              class="btn-menu"
              onclick={() => (promise = getRandomBookmark())}
            >
              <Icon icon="solar:refresh-outline" width="15" height="15" />
            </button>

            <button class="btn-menu" onclick={() => (showEdit = !showEdit)}>
              <Icon icon="solar:document-add-linear" width="15" height="15" />
            </button>

            <button class="btn-menu" onclick={showInsertBookmark}>
              <Icon icon="solar:library-linear" width="15" height="15" />
            </button>

            <button class="btn-menu" onclick={() => (showDelete = !showDelete)}>
              <Icon
                icon="solar:trash-bin-trash-outline"
                width="15"
                height="15"
              />
            </button>

            <button
              class="btn-menu"
              onclick={() => ($showBookmark = !$showBookmark)}
            >
              <Icon icon="solar:pallete-2-linear" width="15" height="15" />
            </button>
          </div>
        </div>

        <button
          class="ribbonZero"
          onclick={() => handleCheckBookmark()}
          aria-label="ribbonZero"
        ></button>
        <button
          class="flip-page-ribbon"
          class:ribbon={bookmark?.like}
          class:ribbonChecked={!isReset && bookmark?.like}
          onclick={() => handleCheckBookmark()}
        >
          {#if bookmark && bookmark.like}
            <span>{bookmark.like}</span>
          {/if}
        </button>
      </div>
    </div>

    <button
      class="back-cover bg-black"
      aria-label="back-cover"
      onclick={() => {
        isOpen = false;
        handleGetPrevBookmark();
      }}
    >
      <div class="front bg-[#999]"></div>
    </button>

    {#if flipPages.length}
      {#each flipPages as page, i}
        <div
          class="flip-page"
          class:flipped={page.flipped}
          style="z-index: {i == currentPage
            ? 999
            : page.flipped
              ? 2 + flipPages.length + i
              : 1 + flipPages.length - i};"
        >
          <div class="front" class:flipFirstPage={i == 0}>
            <p class="page-content">{page.front}</p>
            <button
              class="buttonFoldRight absolute w-[60px] h-full top-0 right-0"
              aria-label="front-button"
              onclick={() => {
                currentPage = i;
                flipPages[i].flipped = true;
                setTimeout(() => {
                  currentPage = 999;
                }, 300);
              }}
            >
              <div class="pageFoldRight"></div>
            </button>
          </div>
          <div class="back">
            <p class="page-content">{page.back}</p>
            <button
              class="flip-page-ribbon"
              class:ribbon={bookmark?.like}
              class:ribbonChecked={!isReset && bookmark?.like}
              onclick={() => handleCheckBookmark()}
            >
              {#if bookmark && bookmark.like}
                <span>{bookmark.like}</span>
              {/if}
            </button>
            <button
              class="buttonFoldLeft absolute w-[60px] h-full top-0 left-0"
              aria-label="back-button"
              onclick={() => {
                currentPage = i;
                flipPages[i].flipped = false;
                setTimeout(() => {
                  currentPage = 999;
                }, 300);
              }}
            >
              <div class="pageFoldLeft"></div>
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .book {
    perspective: 1500px;
    width: 80%;
    aspect-ratio: 1.61803398875;
  }

  .front-cover,
  .back-cover,
  .flip-page {
    transform-style: preserve-3d;
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
    transform-origin: left;
    transition: transform 0.5s ease-in-out;
    transform: rotateY(0deg);
  }

  .front-cover,
  .back-cover {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .back-cover {
    box-shadow:
      4px 4px 12px rgba(0, 0, 0, 0.9),
      -2px -2px 6px rgba(0, 0, 0, 0.3);
  }

  .front {
    position: absolute;
    width: calc(100% - 9px);
    height: calc(100% - 18px);
    top: 9px;
    left: 0;
    z-index: 1;
    user-select: text;
    backface-visibility: hidden;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        -90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 12%
      ),
      linear-gradient(0deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 12%),
      linear-gradient(
        90deg,
        rgba(212, 212, 212, 0.8) 0%,
        rgba(247, 247, 247, 0.3) 12%
      ),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 12%);
  }

  .front-cover .front {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .back {
    position: absolute;
    width: calc(100% - 9px);
    height: calc(100% - 18px);
    top: 9px;
    left: 0;
    user-select: text;
    transform: rotateY(180deg);
    backface-visibility: hidden;
    background-color: #f5f5f5;
    background-image: linear-gradient(
        90deg,
        #d4d4d4 0%,
        rgba(247, 247, 247, 0) 12%
      ),
      linear-gradient(0deg, rgb(212, 212, 212) 0%, rgba(247, 247, 247, 0) 12%),
      linear-gradient(
        -90deg,
        rgba(212, 212, 212, 0.6) 0%,
        rgba(247, 247, 247, 0.3) 18%
      ),
      linear-gradient(180deg, #d4d4d4 0%, rgba(247, 247, 247, 0) 12%);
  }

  .pageFoldRight {
    position: absolute;
    width: 0px;
    height: 0px;
    top: 0;
    right: 0;
    border-left-width: 1px;
    border-left-color: #dddddd;
    border-left-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    transition: all 0.3s ease-out;
    box-shadow: -3px 3px 9px rgba(0, 0, 0, 0.45);
  }

  .pageFoldLeft {
    position: absolute;
    width: 0px;
    height: 0px;
    top: 0;
    left: 0;
    border-right-width: 1px;
    border-right-color: #dddddd;
    border-right-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    transition: all 0.3s ease-out;
    box-shadow: 3px 3px 9px rgba(0, 0, 0, 0.45);
  }

  .buttonFoldRight:hover .pageFoldRight {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      45deg,
      #f7f7f7 0%,
      rgba(247, 247, 247, 0.3) 49%,
      transparent 50%,
      transparent 100%
    );
  }

  .buttonFoldLeft:hover .pageFoldLeft {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      135deg,
      transparent 0%,
      transparent 49%,
      #e9e8e8 50%,
      #dadada 100%
    );
  }

  .openned .front-cover {
    transform: rotateY(-180deg);
  }

  .flipped {
    transform: rotateY(-180deg);
  }

  .closed .front-cover,
  .closed .flip-page {
    transform: rotateY(0deg);
  }

  .page-content {
    width: 100%;
    height: 100%;
    font-family: "Proxima Nova", sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.4375;
    padding: 55px 50px;
    overflow: hidden;
    text-align: left;
    text-size-adjust: 100%;
    color: #1e1915;
  }

  .flipFirstPage .page-content::first-letter {
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

  .ribbonFrontCover {
    position: absolute;
    top: -9px;
    left: 12px;
    width: 36px;
    height: 9px;
    border-top-right-radius: 3px;
    user-select: none;
    background: #a90909;
  }

  .ribbonFrontCover::before {
    content: "";
    position: absolute;
    height: 0;
    width: 0;
    left: -5px;
    top: 0px;
    border-bottom: 9px solid #600909;
    border-left: 5px solid transparent;
  }

  .ribbonZero {
    width: 36px;
    height: 18px;
    position: absolute;
    top: -18px;
    right: 9px;
    border-top-left-radius: 3px;
    user-select: none;
    background: #a90909;
  }

  .ribbonZero::before {
    content: "";
    position: absolute;
    height: 0;
    width: 0;
    right: -5px;
    top: 0px;
    border-bottom: 9px solid #600909;
    border-right: 5px solid transparent;
  }

  .flip-page-ribbon {
    position: absolute;
    width: 36px;
    top: 0px;
    right: 9px;
    user-select: none;
    z-index: inherit;
  }

  .ribbon {
    top: 0;
    height: 90%;
    font-family: "Copernicus", sans-serif;
    font-size: 24px;
    line-height: 30px;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    user-select: none;
    background: linear-gradient(
      180deg,
      rgb(169, 9, 9) 0%,
      rgba(229, 33, 28, 1) 20%,
      rgba(164, 5, 2, 1) 40%,
      rgb(229, 10, 0) 100%
    );
    transition: height 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    box-shadow: 0 6px 6px rgba(0, 0, 0, 0.6);
  }

  .ribbon:after {
    content: "";
    position: absolute;
    height: 0;
    width: 36px;
    top: 100%;
    left: 0;
    border-left: 18px solid #e50a00;
    border-right: 18px solid #e50a00;
    border-bottom: 18px solid transparent;
  }

  .ribbonChecked {
    height: 110%;
  }

  .closed .flip-page-ribbon {
    height: 90%;
  }

  .btn-menu {
    @apply mx-3 size-23 flex items-center justify-center transition duration-300 text-[#4f4f4d] hover:text-[#1e1915];
  }
  .btn-menu:active :global svg {
    transform: scale(1.1);
  }
  .btn-form {
    @apply rounded-2 text-center text-12 shadow font-proxima font-400 leading-18 text-white bg-white/15 transition hover:bg-white/10 py-3 px-6;
  }

  .btn-delete {
    @apply h-24 w-[60px] rounded-3 bg-black/15 text-center font-proxima text-12 font-600 leading-18 text-black/75 transition duration-100 first-of-type:mr-6 hover:bg-black/10;
  }
</style>
