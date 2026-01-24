<script lang="ts">
  import { enhance } from "$app/forms";
  import type { DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { toast } from "svelte-sonner";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/state";
  import { Tween } from "svelte/motion";
  import { quadInOut } from "svelte/easing";
  import { onDestroy, onMount } from "svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import { bookmark, bookInfo } from "$lib/store/highlightstore";

  type PageContent = {
    id: number;
    isFlipped: boolean;
    front: string;
    back: string;
  };

  const ratio = 1.61803398875;
  let isRandomed = $state<boolean>(false);
  let likeBookmark = $state<boolean>(false);
  let keyPressed = $state<boolean>(false);
  let visualProgress = new Tween(18, {
    duration: 300,
    easing: quadInOut,
  });
  let flipTimeoutId: string | number | NodeJS.Timeout | undefined;
  let flagTimeoutId: string | number | NodeJS.Timeout | undefined;
  let keyDownTimeoutId: string | number | NodeJS.Timeout | undefined;
  let windowHeight = $state<number>(0);

  const pageWidth = (wHeight: number) => {
    const width = Math.round(ratio * (wHeight - 150));
    return width % 2 !== 0 ? width + 1 : width;
  };
  const pageHeight = (wHeight: number) => wHeight - 150;

  async function handleGetCurrentId() {
    const { data } = await page.data.supabase
      .from("bookmark_progress")
      .select("*")
      .eq("id", 1);
    if (data) return data[0] as DBSelect["bookmark_progress"];
  }

  async function handleGetCurrentBookmark() {
    const idData = await handleGetCurrentId();
    if (!idData) return;
    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select("*")
      .eq("id", idData.currentId)
      .limit(1);

    if (data.length) {
      //  Get book cover first.
      handleGetBookInfo(data[0]);
      //  Set bookmark data.
      bookmark.set(data[0]);
      // Set the pages.
      setBookContent(data[0].content);
    }
  }

  onMount(() => {
    if (!$bookmark) {
      handleGetCurrentBookmark();
    } else {
      setBookContent($bookmark.content);
    }
  });

  async function handleGetNextBookmark() {
    if (!bookmark || isRandomed) return;

    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select()
      .order("id", { ascending: true })
      .gt("id", $bookmark!.id)
      .limit(1);

    if (data.length) {
      handleSetBookmark(data[0]);
    } else {
      const { data } = await page.data.supabase
        .from("bookmark_table")
        .select()
        .order("id", { ascending: true })
        .limit(1);
      handleSetBookmark(data[0]);
    }
  }

  async function handleGetPrevBookmark() {
    if (!bookmark || isRandomed) return;

    const { data } = await page.data.supabase
      .from("bookmark_table")
      .select()
      .order("id", { ascending: false })
      .lt("id", $bookmark!.id)
      .limit(1);

    if (data.length) {
      handleSetBookmark(data[0]);
    } else {
      const { data } = await page.data.supabase
        .from("bookmark_table")
        .select()
        .order("id", { ascending: false })
        .limit(1);
      handleSetBookmark(data[0]);
    }
  }

  function handleCloseBook() {
    handleListenKeypress();
    for (let i = flipPages.length - 1; i >= 0; i--) {
      flipPages[i].isFlipped = false;
      if (i === 0) {
        flipTimeoutId = setTimeout(() => {
          currentPage = 0;
        }, 250);
      }
    }
  }

  async function handleSetBookmark(data: DBSelect["bookmark_table"]) {
    //  Update current bookmark id.
    const { error } = await page.data.supabase
      .from("bookmark_progress")
      .update({ currentId: data.id })
      .eq("id", 1);
    //  Get book cover first.
    handleGetBookInfo(data);
    //  Set bookmark data.
    bookmark.set(data);
    //  Reset liked and show translation.
    resetRenderBookmark();
    //  Close the book.
    handleCloseBook();
    // Set the pages.
    setTimeout(() => {
      setBookContent(data.content);
    }, 500);
  }

  async function handleGetBookInfo(data: DBSelect["bookmark_table"]) {
    if (data.bookTile === $bookmark?.bookTile) return;
    let titleParam = data.bookTile.split(":")[0];
    let authorParam = data.authors.split(";")[0];

    const response = await fetch(
      `/server/getbookinfo?query=${titleParam}&author=${authorParam}`,
    );
    if (response.status === 200) {
      let data = await response.json();
      bookInfo.set(data);
    }
  }

  async function handleCheckBookmark() {
    if (!bookmark) return;
    if (likeBookmark) {
      const newLike = $bookmark!.like - 1;
      visualProgress.target = newLike === 0 ? 18 : 480;
      bookmark.update((n) => ({ ...n!, like: newLike }));
      likeBookmark = false;
      const { error } = await page.data.supabase
        .from("bookmark_table")
        .update({ like: newLike })
        .eq("id", $bookmark!.id);
    } else {
      const newLike = $bookmark!.like + 1;
      visualProgress.target = 580;
      bookmark.update((n) => ({ ...n!, like: newLike }));
      likeBookmark = true;
      const { error } = await page.data.supabase
        .from("bookmark_table")
        .update({ like: newLike })
        .eq("id", $bookmark!.id);
    }
  }

  async function copyBookMarkToClipboard() {
    try {
      if (bookmark) await navigator.clipboard.writeText($bookmark!.content);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  async function getRandomBookmark() {
    isRandomed = true;
    const { data, error } = await page.data.supabase.rpc("get_random_bookmark");

    if (data.length) {
      //  Get book cover first..
      handleGetBookInfo(data[0]);
      //  Set bookmark data.
      bookmark.set(data[0]);
      //  Reset liked and show translation.
      resetRenderBookmark();
      //  Close the book.
      handleCloseBook();
      // Set the pages.
      setTimeout(() => {
        setBookContent(data[0].content);
      }, 500);
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
      .eq("id", $bookmark!.id);
    if (error) {
      toast.error("Error!", {
        description: error.message as string,
        class: "my-toast-error",
        classes: {
          title: "text-[#f70000] text-14",
          description: "text-black/80 text-12",
        },
      });
    } else {
      toast.success("Success!", {
        description: "Delete successfully.",
        class: "my-toast-success",
        classes: {
          title: "text-[#00c441] text-15 font-500",
          description: "text-black/70 text-12 font-400",
        },
      });
    }
    handleGetNextBookmark();
    showDelete = !showDelete;
  }

  function getHeightNormalPage(
    pText: string,
    pFont: string,
    pSize: number,
    pLine: number,
    pWidth: number,
  ) {
    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);

    lDiv.innerHTML = pText;
    lDiv.style.textIndent = "15px";
    lDiv.style.fontFamily = pFont;
    lDiv.style.fontSize = "" + pSize + "px";
    lDiv.style.lineHeight = "" + pLine;
    lDiv.style.fontWeight = "400";
    lDiv.style.width = String(pWidth) + "px";
    lDiv.style.padding = "0";
    lDiv.style.margin = "0";
    lDiv.style.boxSizing = "border-box";

    const height = lDiv.clientHeight;
    document.body.removeChild(lDiv);
    return height;
  }

  /**
   * Get height of the text.
   *
   * @param pText - string
   * @param pFont - font-family
   * @param pSize - font-size
   * @param pLine - line height
   * @param pWidth - page width
   * @returns The height of the pText
   */
  function getHeightFirstPage(
    pText: string,
    pFont: string,
    pSize: number,
    pLine: number,
    pWidth: number,
  ) {
    let matchSymbol = pText.match(/^(\W*)\w/);
    let matchLetter = pText.match(/^\w/);
    let result = matchSymbol ? matchSymbol : matchLetter;
    let firstLetter = result![0];
    let rest = pText.replace(firstLetter, "");

    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);
    let cText = document.createElement("span");
    lDiv.appendChild(cText);
    cText.textContent = firstLetter;
    let restText = document.createElement("span");
    lDiv.appendChild(restText);
    restText.innerHTML = rest;

    restText.style.textIndent = "15px";
    lDiv.style.fontFamily = pFont;
    lDiv.style.fontSize = "" + pSize + "px";
    lDiv.style.lineHeight = "" + pLine;
    lDiv.style.width = String(pWidth) + "px";
    lDiv.style.fontWeight = "400";
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

  function splitIntoBlocks(text: string) {
    const words = text.trim().split(" ");
    let maxHeight = pageHeight(windowHeight) - 18 - 110;
    let maxWidth = pageWidth(windowHeight) / 2 - 12 - 110 - 1;

    const flattenedArray = words.reduce(
      (acc: string[], cur: string, index: number) => {
        if (acc.length === 0) {
          acc.push(cur);
        } else if (acc.length === 1) {
          let testString = acc[acc.length - 1] + " " + cur;
          if (
            getHeightFirstPage(
              testString,
              "Proxima Nova",
              16,
              1.4375,
              maxWidth,
            ) < maxHeight
          ) {
            acc[acc.length - 1] = testString;
          } else acc.push(cur);
        } else {
          let testString = acc[acc.length - 1] + " " + cur;
          if (
            getHeightNormalPage(
              testString,
              "Proxima Nova",
              16,
              1.4375,
              maxWidth,
            ) < maxHeight
          ) {
            acc[acc.length - 1] = testString;
          } else acc.push(cur);
        }
        return acc;
      },
      [],
    );

    if (flattenedArray.length % 2 !== 0) flattenedArray.push("");
    return flattenedArray;
  }

  let currentPage = $state<number>(0);
  let flipPages = $state<PageContent[]>([]);

  function setBookContent(content: string) {
    let pages = splitIntoBlocks(content);
    const result = pages.reduce(
      (acc: PageContent[], cur: string, index: number) => {
        if (index % 2 === 0) {
          acc.push({
            id: acc.length + 1,
            front: cur,
            back: pages[index + 1],
            isFlipped: false,
          });
        }
        return acc;
      },
      [],
    );
    flipPages = [{ id: 0, front: "", back: "", isFlipped: false }].concat(
      result,
    );
  }

  let insertData = $state<DBSelect["bookmark_table"][] | undefined>(undefined);

  async function showInsertBookmark() {
    isSubmitting = false;
    showInsert = true;
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
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=vi&q=${$bookmark!.content}`;
      const response = await fetch(url);
      const data = await response.json();
      translatedContent = data[0][0];
    }

    handleCloseBook();

    if (showTranslated) {
      showTranslated = false;
      flagTimeoutId = setTimeout(() => {
        setBookContent($bookmark!.content);
      }, 500);
    } else {
      showTranslated = true;
      flagTimeoutId = setTimeout(() => {
        setBookContent(translatedContent);
      }, 500);
    }
  }

  function resetRenderBookmark() {
    likeBookmark = false;
    showTranslated = false;
    translatedContent = "";
  }

  function handleFlipPage(id: number) {
    handleListenKeypress();

    currentPage = id;
    visualProgress.target = 18;

    if (flipPages[id].isFlipped) {
      if (id === 0) {
        flipPages[currentPage].isFlipped = false;
        flipTimeoutId = setTimeout(() => {
          handleGetPrevBookmark();
        }, 500);
        return;
      }
      flipPages[currentPage].isFlipped = false;
    } else {
      flipPages[currentPage].isFlipped = true;
    }
    if ($bookmark!.like) {
      flagTimeoutId = setTimeout(() => {
        visualProgress.target = likeBookmark ? 580 : 480;
      }, 900);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (keyPressed) {
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowRight") {
      switch (currentPage) {
        case 0:
          flipPages[0].isFlipped ? handleFlipPage(1) : handleFlipPage(0);
          break;
        case flipPages.length - 1:
          if (flipPages[currentPage].isFlipped) handleGetNextBookmark();
          else handleFlipPage(currentPage);
          break;
        default:
          if (flipPages[currentPage].isFlipped) handleFlipPage(currentPage + 1);
          else handleFlipPage(currentPage);
          break;
      }
    } else if (e.key === "ArrowLeft") {
      switch (currentPage) {
        case 0:
          if (flipPages[0].isFlipped) handleFlipPage(0);
          else return;
          break;
        default:
          if (flipPages[currentPage].isFlipped) handleFlipPage(currentPage);
          else handleFlipPage(currentPage - 1);
          break;
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (flipPages[0].isFlipped) handleCheckBookmark();
    }
  }

  function handleListenKeypress() {
    keyPressed = true;
    keyDownTimeoutId = setTimeout(() => {
      keyPressed = false;
    }, 500);
  }

  onDestroy(() => {
    clearTimeout(flipTimeoutId);
    clearTimeout(flagTimeoutId);
    clearTimeout(keyDownTimeoutId);
    if (isRandomed) {
      $bookmark = $bookInfo = undefined;
    }
  });
</script>

<svelte:head>
  <title>
    {bookmark ? `${$bookmark?.bookTile}` : "Bookmark"}
  </title>
  <meta name="bookmark" content="Some bookmark" />
</svelte:head>

<section
  class="absolute top-0 left-0 w-screen h-screen flex items-center justify-center pt-60 px-60 pb-90 z-[5]"
>
  {#if showEdit}
    <div class="popup" transition:fade={{ duration: 100 }}>
      {#if bookmark}
        <form
          name="editbookmark"
          action="?/editBookmark"
          method="post"
          class="bg-[#f5f5f5] h-full golden rounded-2 overflow-hidden p-15"
          use:enhance={({ formElement, formData, action, cancel }) => {
            isSubmitting = true;
            return async ({ result, update }) => {
              if (result.type === "failure") {
                toast.error("Error!", {
                  description: result.data?.error as string,
                  class: "my-toast-error",
                  classes: {
                    title: "text-[#f70000] text-14",
                    description: "text-black/80 text-12",
                  },
                });
              } else {
                toast.success("Success!", {
                  description: "Edit successfully.",
                  class: "my-toast-success",
                  classes: {
                    title: "text-[#00c441] text-15 font-500",
                    description: "text-black/70 text-12 font-400",
                  },
                });
                setBookContent($bookmark!.content);
                handleCloseBook();
              }
              isSubmitting = false;
            };
          }}
        >
          <input hidden name="id" autocomplete="off" value={$bookmark!.id} />
          <div class="mb-6">
            <p class="form-title">Book title</p>
            <div class="mt-2">
              <input
                type="text"
                name="bookTile"
                autocomplete="off"
                class="form-input"
                bind:value={$bookmark!.bookTile}
                onkeydown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div class="mb-6">
            <p class="form-title">Authors</p>
            <div class="mt-2">
              <input
                type="text"
                name="authors"
                autocomplete="off"
                class="form-input"
                bind:value={$bookmark!.authors}
                onkeydown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div class="mb-6">
            <p class="form-title">Date of Creation</p>
            <div class="mt-2">
              <input
                type="text"
                name="dateOfCreation"
                autocomplete="off"
                class="form-input"
                bind:value={$bookmark!.dateOfCreation}
                onkeydown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-12">
              <p class="form-title">Content</p>
              <button
                type="button"
                onclick={() => navigator.clipboard.writeText("<p>")}
              >
                <Icon icon="ph:caret-left-fill" width="16" height="16" />
              </button>
              <button
                type="button"
                onclick={() => navigator.clipboard.writeText("</p>")}
              >
                <Icon icon="ph:caret-right-fill" width="16" height="16" />
              </button>
            </div>
            <div class="mt-2">
              <textarea
                name="content"
                autocomplete="off"
                rows="9"
                class="form-input"
                bind:value={$bookmark!.content}
                onkeydown={(e) => e.stopPropagation()}
              ></textarea>
            </div>
          </div>
          <div class="border-b border-gray-900/10 mb-15 pb-20">
            <p class="form-title">Like</p>
            <div class="mt-2">
              <input
                type="number"
                name="like"
                min={0}
                autocomplete="off"
                class="form-input"
                bind:value={$bookmark!.like}
                onkeydown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div class="flex items-center justify-start gap-6">
            <button
              type="submit"
              class="form-submit-button"
              disabled={isSubmitting}
            >
              Save
            </button>
            <button
              type="button"
              class="text-14 leading-18 py-4 px-12 font-500"
              onclick={() => (showEdit = false)}
            >
              Cancel
            </button>
          </div>
        </form>
      {/if}
    </div>
  {/if}

  {#if showInsert}
    <div class="popup" transition:fade={{ duration: 100 }}>
      <div class="bg-[#f5f5f5] h-full golden rounded-2 overflow-hidden p-15">
        <form
          class="w-full border-b border-gray-900/10 mb-9 pb-9"
          name="insertbookmark"
          action="?/insertBookmark"
          method="post"
          use:enhance={({ formElement, formData, action, cancel }) => {
            isSubmitting = true;
            return async ({ result }) => {
              if (result.type === "failure") {
                toast.error("Error!", {
                  description: result.data?.error as string,
                  class: "my-toast-error",
                  classes: {
                    title: "text-[#f70000] text-14",
                    description: "text-black/80 text-12",
                  },
                });
              } else {
                toast.success("Success!", {
                  description: "Insert successfully.",
                  class: "my-toast-success",
                  classes: {
                    title: "text-[#00c441] text-15 font-500",
                    description: "text-black/70 text-12 font-400",
                  },
                });
              }
              isSubmitting = false;
            };
          }}
        >
          <div>
            <p class="form-title">Highlights</p>
            <div class="mt-2">
              <textarea
                name="content"
                autocomplete="off"
                rows="9"
                class="form-input"
                onkeydown={(e) => e.stopPropagation()}
              ></textarea>
            </div>
          </div>
          <div class="flex items-center justify-start gap-6">
            <button
              type="submit"
              class="form-submit-button"
              disabled={isSubmitting}
            >
              Import
            </button>
            <button
              type="button"
              class="text-14 leading-18 py-4 px-12 font-500"
              onclick={() => (showInsert = false)}
            >
              Cancel
            </button>
          </div>
        </form>
        {#if insertData}
          <table
            class="w-full text-left table-auto min-w-max rounded-3 shadow-sm shadow-black/30"
          >
            <thead>
              <tr class="text-12 font-400 bg-gray-50 text-black">
                <th>Book title</th>
                <th>Authors</th>
                <th>Date of Creation</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {#each insertData as item}
                <tr>
                  <td
                    class="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {item.bookTile}
                  </td>
                  <td
                    class="max-w-[140px] overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {item.authors}
                  </td>
                  <td
                    class="max-w-[120px] overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {format(new Date(item.dateOfCreation), "P")}
                  </td>
                  <td
                    class="max-w-[28vw] overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {item.content}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  {/if}

  {#if showDelete}
    <div
      class="dark absolute top-0 left-1/2 -translate-x-[200%] z-[6] flex flex-col items-center justify-center rounded-3 p-6"
      transition:fly={{ y: "-100%", duration: 100 }}
    >
      <p class="mb-6 text-12 text-white">Delete this bookmark?</p>
      <div class="flex items-center justify-center">
        <button class="btn-delete" onclick={() => (showDelete = !showDelete)}>
          Cancel
        </button>
        <button
          class="btn-delete !text-red-600"
          onclick={() => handleDeleteBookmark()}
        >
          Delete
        </button>
      </div>
    </div>
  {/if}

  <div
    class="book"
    style="width: {pageWidth(windowHeight)}px; height:{pageHeight(
      windowHeight,
    )}px;"
  >
    <div class="back-book">
      {#if flipPages.length}
        <div class="cover bg-[#0a0905] p-9 pl-0">
          <div class="w-full h-full bg-front relative">
            <button
              class="absolute w-full h-full disabled:cursor-not-allowed"
              aria-label="back-book-button"
              onclick={handleGetNextBookmark}
              disabled={isRandomed}
            ></button>

            {#if flipPages[0].isFlipped}
              <button
                class="ribbon {visualProgress.current > 150
                  ? 'bg-long'
                  : 'bg-short'}"
                onclick={() => handleCheckBookmark()}
                style="height: {visualProgress.current}px;
                 z-index: {visualProgress.current > 18 ? 1001 : 1};"
                in:fly={{ y: 30, delay: 250, duration: 50 }}
                out:fly={{
                  y: 0,
                  delay: 210,
                  duration: 50,
                }}
              >
                {#if visualProgress.current > 90}
                  <span class="ribbonContent">
                    {$bookmark!.like ? $bookmark!.like : ""}
                  </span>
                  <span
                    class="ribbonTail {visualProgress.current > 150
                      ? 'ribbonTailLong'
                      : 'ribbonTailShort'}"
                  ></span>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    {#each flipPages as page, i}
      <div
        class="flip {i === 0 ? 'flip-cover' : 'flip-page'}"
        class:flipped={page.isFlipped}
        style="z-index: {currentPage === page.id
          ? 999
          : page.isFlipped
            ? 3 + flipPages.length + page.id
            : 1 + flipPages.length - page.id};"
      >
        <div class="page page-front">
          {#if i === 0}
            <div class="cover bg-[#0a0905]">
              {#if $bookInfo}
                <img
                  src={$bookInfo!.coverImage}
                  alt="book-cover"
                  class="w-full h-full object-contain"
                />
              {:else}
                <div class="w-full h-full flex items-center p-45">
                  <p
                    class="text-[#d0c9c5] text-500 text-[45px] leading-[50px] font-copernicus"
                  >
                    take a small step every day
                  </p>
                </div>
              {/if}
            </div>
          {:else}
            <div
              class="content bg-front"
              class:firstPage={i === 1}
              style="width: {pageWidth(windowHeight) / 2 -
                12}px; height: {pageHeight(windowHeight) - 19}px;"
            >
              {@html page.front}
            </div>
            <p class="page-number">{2 * i - 1}</p>
          {/if}

          <button
            class="page-button"
            aria-label="page-button"
            onclick={() => handleFlipPage(page.id)}
          >
            {#if i != 0}
              <div class="page-fold"></div>
            {/if}
          </button>
        </div>

        <div class="page page-back">
          {#if i === 0}
            <div class="cover bg-[#0a0905]">
              <div class="cover bg-back">
                {#if $bookInfo}
                  {#if $bookInfo!.coverImage}
                    <img
                      src={$bookInfo!.coverImage}
                      alt="book-cover"
                      class="mb-9 shadow-sm shadow-black/30 h-2/5 object-contain"
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
                        {$bookmark!.like}
                      </span>

                      {#if $bookInfo && $bookInfo!.numberOfRatings}
                        <Icon
                          icon="solar:eye-bold"
                          width="15"
                          height="15"
                          class="text-[#707070] ml-6"
                        />
                        <span
                          class="text-10 leading-15 font-500 mx-3 text-[#707070] select-none"
                        >
                          {Number($bookInfo!.numberOfRatings).toLocaleString()}
                        </span>
                      {/if}
                    </div>
                  {/if}

                  {#if $bookInfo!.title}
                    <p
                      class="mb-3 w-3/4 text-14 font-copernicus text-[#1e1915] font-600 leading-18 text-center"
                    >
                      {$bookInfo!.title}
                    </p>
                  {/if}

                  {#if $bookInfo!.authors}
                    <p
                      class="mb-3 text-12 font-copernicus leading-18 text-[#1e1915] text-center font-400"
                    >
                      {$bookInfo!.authors.join(", ")}
                    </p>
                  {/if}

                  {#if $bookmark}
                    <p
                      class="text-[#4f4f4d] text-12 font-proxima leading-18 font-400 text-left"
                    >
                      Bookmarked at {format(
                        new Date($bookmark!.dateOfCreation),
                        "p cccc, yyyy-MM-dd",
                      )}
                    </p>
                  {/if}

                  {#if $bookInfo!.publishedYear}
                    <p
                      class="mb-3 text-12 leading-18 font-proxima font-400 text-[#4f4f4d] text-center"
                    >
                      First published {$bookInfo!.publishedYear}
                    </p>
                  {/if}

                  {#if $bookInfo!.numberOfRatings}
                    <div class="mb-3 flex items-center justify-center pl-33">
                      <StarRating
                        rating={Number($bookInfo!.averageRating)}
                        size={15}
                        gap={3}
                      />
                      <span
                        class="ml-3 w-30 text-center text-12 pt-3 leading-15 font-proxima font-400 text-[#4f4f4d]"
                      >
                        ({$bookInfo!.averageRating})
                      </span>
                    </div>
                  {/if}
                {:else}
                  <p
                    class="mb-3 w-3/4 text-14 font-copernicus text-[#1e1915] font-600 leading-18 text-center"
                  >
                    {$bookmark!.bookTile}
                  </p>
                  <p
                    class="mb-3 text-12 font-copernicus leading-18 text-[#1e1915] text-center font-400"
                  >
                    {$bookmark!.authors}
                  </p>
                  {#if $bookmark}
                    <p
                      class="text-[#4f4f4d] text-12 font-proxima leading-18 font-400 text-left"
                    >
                      at {format(
                        $bookmark!.dateOfCreation,
                        "p cccc, do MMMM yyyy",
                      )}
                    </p>
                  {/if}
                {/if}

                <div class="flex justify-center items-baseline w-full pt-18">
                  <button class="btn-menu" onclick={() => translateContent()}>
                    <Icon
                      icon="ic:twotone-g-translate"
                      width="15"
                      height="15"
                    />
                  </button>

                  <button class="btn-menu" onclick={copyBookMarkToClipboard}>
                    <Icon icon="solar:copy-outline" width="15" height="15" />
                  </button>

                  <button class="btn-menu" onclick={() => getRandomBookmark()}>
                    <Icon icon="solar:refresh-outline" width="15" height="15" />
                  </button>

                  <button
                    class="btn-menu"
                    onclick={() => {
                      showEdit = true;
                      isSubmitting = false;
                    }}
                  >
                    <Icon
                      icon="fluent:slide-text-edit-28-regular"
                      width="15"
                      height="15"
                    />
                  </button>

                  <button class="btn-menu" onclick={showInsertBookmark}>
                    <Icon icon="solar:library-linear" width="15" height="15" />
                  </button>

                  <button
                    class="btn-menu"
                    onclick={() => (showDelete = !showDelete)}
                  >
                    <Icon
                      icon="solar:trash-bin-trash-outline"
                      width="15"
                      height="15"
                    />
                  </button>
                </div>
              </div>
            </div>
          {:else}
            <div
              class="content bg-back"
              style="width: {pageWidth(windowHeight) / 2 -
                12}px; height: {pageHeight(windowHeight) - 19}px;"
            >
              {@html page.back}
            </div>
            <p class="page-number">{2 * i}</p>
          {/if}

          <button
            class="page-button disabled:cursor-not-allowed"
            aria-label="page-button"
            onclick={() => handleFlipPage(page.id)}
            disabled={isRandomed && i === 0}
          >
            {#if i != 0}
              <div class="page-fold"></div>
            {/if}
          </button>
        </div>
      </div>
    {/each}
  </div>
</section>

<svelte:window on:keydown={onKeyDown} bind:innerHeight={windowHeight} />

<style>
  .book {
    perspective: 4500px;
    position: relative;
  }

  .back-book {
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
  }

  .flip {
    transform-style: preserve-3d;
    position: absolute;
    transition: transform 0.5s ease-in-out;
    transform-origin: left center;
  }

  .flip-cover {
    height: 100%;
    width: calc(50% + 1px);
    top: 0;
    right: -1px;
  }

  .flip-page {
    height: calc(100% - 18px);
    width: calc(50% - 11px);
    right: 11px;
    top: 9px;
    box-shadow: 2px 2px rgba(0, 0, 0, 0.3);
  }

  .page {
    position: absolute;
    height: 100%;
    width: 100%;
    user-select: text;
    backface-visibility: hidden;
  }

  .page-front {
    top: 0;
    left: 0;
    z-index: 1;
  }

  .page-back {
    top: 0;
    left: 0;
    z-index: 0;
    transform: rotateY(180deg);
  }

  .bg-front {
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

  .bg-back {
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

  .content {
    width: 100%;
    height: 100%;
    font-family: "Proxima Nova", sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.4375;
    letter-spacing: 0px;
    padding: 55px 50px 55px 60px;
    overflow: hidden;
    text-align: left;
    text-size-adjust: 100%;
    color: #1e1915;
  }

  .content :global {
    p {
      text-indent: 15px;
    }
  }

  .firstPage::first-letter {
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

  .cover {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .back-book > .cover,
  .flip-cover > .page-front > .cover {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .flip-cover > .page-back > .cover {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    box-shadow: -12px 4px 12px #0009;
  }

  .page-back .cover {
    padding: 9px 0 9px 9px;
  }

  .back-book > .cover {
    box-shadow: 8px 4px 12px #0009;
  }

  .flipped {
    transform: rotateY(-180deg);
  }

  .page-button {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 60px;
  }

  .page-front .page-button {
    right: 0;
  }

  .page-back .page-button {
    left: 0;
  }

  .page-fold {
    position: absolute;
    width: 0px;
    height: 0px;
    transition: all 0.3s ease-out;
  }

  .page-front .page-fold {
    top: 0;
    right: 0;
    border-left-width: 1px;
    border-left-color: #dddddd;
    border-left-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: -3px 3px 9px rgba(0, 0, 0, 0.45);
  }

  .page-front .page-button:hover .page-fold {
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

  .page-back .page-fold {
    top: 0;
    left: 0;
    border-right-width: 1px;
    border-right-color: #dddddd;
    border-right-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: 3px 3px 9px rgba(0, 0, 0, 0.45);
  }

  .page-back .page-button:hover .page-fold {
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

  .ribbon {
    position: relative;
    top: -18px;
    left: 6px;
    user-select: none;
    border-top-left-radius: 3px;
    width: 36px;
    height: 18px;
    font-size: 1em;
    container-type: inline-size;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.6);
  }

  .ribbon::before {
    content: "";
    position: absolute;
    height: 9px;
    width: 6px;
    right: -6px;
    top: 0px;
    z-index: 1;
    border-bottom: 9px solid #600909;
    border-right: 6px solid transparent;
  }

  .ribbonContent {
    font-family: "Copernicus", sans-serif;
    font-size: 60cqi;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    user-select: none;
  }

  .ribbonTail {
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 0;
    height: 0;
    z-index: inherit;

    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
  }

  .ribbonTailLong {
    border-top: 20px solid #e40900;
  }

  .ribbonTailShort {
    border-top: 20px solid #a90909;
  }

  .bg-short {
    background: #a90909;
  }

  .bg-long {
    background: linear-gradient(
      180deg,
      rgb(169, 9, 9) 0%,
      rgba(229, 33, 28, 1) 20%,
      rgba(164, 5, 2, 1) 40%,
      rgb(229, 10, 0) 100%
    );
  }

  .page-number {
    position: absolute;
    bottom: 21px;
    left: 0;
    width: 100%;
    text-align: center;
    font-family: "Copernicus", sans-serif;
    font-weight: 500;
    font-size: 14px;
  }

  .btn-menu {
    @apply mx-3 size-23 flex items-center justify-center transition duration-300 text-[#4f4f4d] hover:text-[#1e1915];
  }

  .btn-menu:active :global svg {
    transform: scale(1.1);
  }

  .btn-delete {
    @apply h-24 w-[60px] rounded-3 bg-black/15 text-center font-proxima text-12 font-600 leading-18 text-black/75 transition duration-100 first-of-type:mr-6 hover:bg-black/10;
  }

  .popup {
    @apply absolute top-0 left-0 z-20 w-screen h-screen py-60 px-90 flex justify-center bg-black/80;
  }

  .form-title {
    @apply text-14 font-600 text-gray-900;
  }

  .form-input {
    @apply w-full !text-14 font-400 rounded-3 px-6 py-2 text-base text-gray-900 border border-gray-300 focus:border-gray-400 outline-none;
  }

  .form-submit-button {
    @apply rounded-2 py-4 px-12 text-center text-14 shadow font-500 leading-18 bg-gray-300 transition hover:bg-green-200 disabled:cursor-not-allowed;
  }

  th {
    @apply py-4 px-8 text-14 font-500 leading-16 text-gray-600 border-b border-gray-400 bg-gray-300;
  }

  td {
    @apply py-4 px-8 text-13 font-400 leading-16 text-gray-900 border-b border-gray-100;
  }
</style>
