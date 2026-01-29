<script lang="ts">
  import { enhance } from "$app/forms";
  import type { DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { toast } from "svelte-sonner";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/state";
  import { Tween } from "svelte/motion";
  import { cubicIn, quadInOut, sineIn, sineOut } from "svelte/easing";
  import { onDestroy, onMount } from "svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import { bookmark, bookInfo } from "$lib/store/highlightstore";

  type PageContent = {
    zIndex: number;
    rotate: number;
    front: string;
    back: string;
  };

  const ratio = 1.61803398875;
  let isRandomed = $state<boolean>(false);
  let likeBookmark = $state<boolean>(false);
  let keyPressed = $state<boolean>(false);
  let visualProgress = new Tween(21, {
    duration: 300,
    easing: quadInOut,
  });
  let flipTimeoutId: string | number | NodeJS.Timeout | undefined;
  let flagTimeoutId: string | number | NodeJS.Timeout | undefined;
  let keyDownTimeoutId: string | number | NodeJS.Timeout | undefined;
  let windowHeight = $state<number>(0);
  let expandDesc = $state<boolean>(false);

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
      handleGetBookInfo(data[0]);
      bookmark.set(data[0]);
      setBookContent(data[0].content);
      resetRenderBookmark();
    }
  }

  onMount(() => {
    if (!$bookmark) {
      handleGetCurrentBookmark();
    } else {
      setBookContent($bookmark.content);
      resetRenderBookmark();
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

  function handleCloseBook(data: DBSelect["bookmark_table"]) {
    keyPressed = true;
    visualProgress.target = 21;

    if (currentPage === 0) {
      flipPages[0].rotate = 0;
      flipPages[0].zIndex = 1002;
      flipTimeoutId = setTimeout(() => {
        bookmark.set(data);
        setBookContent(data.content);
        resetRenderBookmark();
        currentPage = 0;
        keyPressed = false;
      }, 300);
    } else {
      for (let index = 0; index < flipPages.length; index++) {
        flipTimeoutId = setTimeout(
          () => {
            flipPages[index].rotate = 0;
            flipPages[index].zIndex = 4 + flipPages.length - index;
          },
          (flipPages.length - index - 1) * 150,
        );
      }
      flipTimeoutId = setTimeout(
        () => {
          bookmark.set(data);
          setBookContent(data.content);
          resetRenderBookmark();
          currentPage = 0;
          keyPressed = false;
        },
        (flipPages.length - 1) * 150 + 300,
      );
    }
  }

  async function handleSetBookmark(data: DBSelect["bookmark_table"]) {
    // Update id - Get book cover - Set state bookmark - Close book - Set page content and reset ribbon, translate,...
    handleCloseBook(data);
    handleGetBookInfo(data);
    const { error } = await page.data.supabase
      .from("bookmark_progress")
      .update({ currentId: data.id })
      .eq("id", 1);
  }

  async function handleGetBookInfo(data: DBSelect["bookmark_table"]) {
    let titleParam = data.bookTile;
    let authorParam = data.authors.split(";")[0];

    // titleParam = "Mastery";
    // authorParam = "Robert Greene";

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
      visualProgress.target = newLike === 0 ? 21 : 480;
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
      if (data.bookTile !== $bookmark?.bookTile) {
        handleGetBookInfo(data[0]);
      }
      handleCloseBook(data[0]);
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
    pWeight: number,
    pLine: number,
    pWidth: number,
  ) {
    let lDiv = document.createElement("div");
    document.body.appendChild(lDiv);

    lDiv.innerHTML = pText;
    lDiv.style.fontFamily = pFont;
    lDiv.style.fontSize = "" + pSize + "px";
    lDiv.style.lineHeight = "" + pLine;
    lDiv.style.fontWeight = String(pWeight);
    lDiv.style.width = String(pWidth) + "px";
    lDiv.style.padding = "0";
    lDiv.style.margin = "0";
    lDiv.style.boxSizing = "border-box";

    const pTag = lDiv.querySelectorAll("p");
    pTag.forEach((item) => {
      item.style.textIndent = "15px";
    });

    const citeTag = lDiv.querySelectorAll("cite");
    citeTag.forEach((item) => {
      item.style.display = "block";
      item.style.textAlign = "right";
    });

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
   * @param pWeight - font-weight
   * @param pLine - line height
   * @param pWidth - page width
   * @returns The height of the pText
   */
  function getHeightFirstPage(
    pText: string,
    pFont: string,
    pSize: number,
    pWeight: number,
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

    lDiv.style.fontFamily = pFont;
    lDiv.style.fontSize = "" + pSize + "px";
    lDiv.style.lineHeight = "" + pLine;
    lDiv.style.width = String(pWidth) + "px";
    lDiv.style.fontWeight = String(pWeight);
    lDiv.style.padding = "0";
    lDiv.style.margin = "0";
    lDiv.style.boxSizing = "border-box";

    const pTag = lDiv.querySelectorAll("p");
    pTag.forEach((item) => {
      item.style.textIndent = "15px";
    });

    const citeTag = lDiv.querySelectorAll("cite");
    citeTag.forEach((item) => {
      item.style.display = "block";
      item.style.textAlign = "right";
    });

    cText.style.fontFamily = "Baskervville";
    cText.style.fontSize = "125px";
    cText.style.lineHeight = "100px";
    cText.style.fontWeight = "600";
    cText.style.textTransform = "uppercase";
    cText.style.float = "left";
    cText.style.margin = "6px 5px 0 0";
    cText.style.padding = "3px 6px 3px 6px";
    cText.style.border = "1px solid";

    const height = lDiv.clientHeight;
    document.body.removeChild(lDiv);
    return height;
  }

  function splitIntoBlocks(text: string) {
    const words = text.trim().split(" ");
    let maxHeight = pageHeight(windowHeight) - 24 - 96;
    let maxWidth = pageWidth(windowHeight) / 2 - 12 - 112;

    const flattenedArray = words.reduce(
      (acc: string[], cur: string, index: number) => {
        if (acc.length === 0) {
          acc.push(cur);
        } else if (acc.length === 1) {
          let testString = acc[acc.length - 1] + " " + cur;
          if (
            getHeightFirstPage(
              testString,
              "Bookerly",
              15,
              400,
              1.55,
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
              "Bookerly",
              15,
              400,
              1.55,
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
    pages.unshift("", "");
    flipPages = pages.reduce(
      (acc: PageContent[], cur: string, index: number) => {
        if (index % 2 === 0) {
          acc.push({
            zIndex: 4 + pages.length / 2 - index / 2,
            front: cur,
            back: pages[index + 1],
            rotate: 0,
          });
        }
        return acc;
      },
      [],
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

    visualProgress.target = 21;

    flipPages[0].rotate = 0;
    flipPages[0].zIndex = 1002;
    flipTimeoutId = setTimeout(() => {
      if (showTranslated) {
        showTranslated = false;
        setBookContent($bookmark!.content);
      } else {
        showTranslated = true;
        setBookContent(translatedContent);
      }
      currentPage = 0;
      keyPressed = false;
    }, 300);
  }

  function resetRenderBookmark() {
    likeBookmark = false;
    showTranslated = false;
    translatedContent = "";
  }

  function handleFlipPage(index: number) {
    keyPressed = true;
    currentPage = index;
    visualProgress.target = 21;
    flipPages[index].zIndex = 999;

    if (flipPages[index].rotate) {
      flipPages[index].rotate = 0;
      flipTimeoutId = setTimeout(() => {
        flipPages[index].zIndex = 4 + flipPages.length - index;
        keyPressed = false;
      }, 600);
    } else {
      flipPages[index].rotate = 180;
      flipTimeoutId = setTimeout(() => {
        flipPages[index].zIndex = 4 + index;
        keyPressed = false;
      }, 600);
    }

    if (flipPages[0].rotate !== 0 && $bookmark!.like) {
      flagTimeoutId = setTimeout(() => {
        visualProgress.target = likeBookmark ? 580 : 480;
      }, 600);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (keyPressed) {
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowRight") {
      switch (currentPage) {
        case flipPages.length - 1:
          flipPages[currentPage].rotate === 0
            ? handleFlipPage(currentPage)
            : handleGetNextBookmark();
          break;
        default:
          flipPages[currentPage].rotate === 0
            ? handleFlipPage(currentPage)
            : handleFlipPage(currentPage + 1);
          break;
      }
    } else if (e.key === "ArrowLeft") {
      switch (currentPage) {
        case 0:
          if (flipPages[0].rotate === 180) handleGetPrevBookmark();
          break;
        case 1:
          flipPages[1].rotate === 0
            ? handleGetPrevBookmark()
            : handleFlipPage(1);
          break;
        default:
          flipPages[currentPage].rotate === 0
            ? handleFlipPage(currentPage - 1)
            : handleFlipPage(currentPage);
          break;
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      handleCheckBookmark();
    }
  }

  function shadowIn(node: HTMLElement) {
    return {
      delay: 300,
      duration: 150,
      easing: sineIn,
      css: (t: number) => `
        box-shadow: 1px ${9 * t}px ${18 * t}px rgba(0, 0, 0, ${0.8 * t});
      `,
    };
  }

  function shadowOut(node: HTMLElement) {
    return {
      duration: 150,
      easing: sineOut,
      css: (t: number) => `
        box-shadow: 1px ${9 * t}px ${18 * t}px rgba(0, 0, 0, ${0.8 * t});
      `,
    };
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
                handleCloseBook($bookmark!);
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
              <button
                type="button"
                onclick={() => navigator.clipboard.writeText("<cite>")}
              >
                <Icon icon="mingcute:quote-left-fill" width="16" height="16" />
              </button>
              <button
                type="button"
                onclick={() => navigator.clipboard.writeText("</cite>")}
              >
                <Icon icon="mingcute:quote-right-fill" width="16" height="16" />
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
    {#each flipPages as page, i}
      {#if i === 0}
        <div
          class="flip coverPage"
          style="z-index: {page.zIndex}; transform: rotateY(-{page.rotate}deg);"
        >
          <div class="w-full h-full pageFront cover">
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
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            ></button>
          </div>

          <div class="w-full h-full pageBack p-12 pr-0 bg-[#0a0905]">
            <div class="backCoverPaper w-full h-full flex flex-col">
              <div
                class="w-full flex-1 px-28 py-18 overflow-y-scroll no-scrollbar flex justify-start items-center flex-col"
              >
                {#if $bookInfo}
                  {#if $bookInfo.coverImage}
                    <img
                      src={$bookInfo.coverImage}
                      alt="book-cover"
                      class="h-2/5 object-contain"
                      style="filter: drop-shadow(0 2px 8px rgba(0,0,0,.2));"
                    />
                  {/if}

                  {#if $bookInfo.title}
                    <p
                      class="mt-12 mb-3 text-18 font-copernicus leading-28 text-[#1e1915] font-600 text-center"
                    >
                      {$bookInfo.title}
                    </p>
                  {/if}

                  {#if $bookInfo.authors}
                    <p
                      class="mb-3 text-14 font-copernicus leading-18 text-[#1e1915] font-400 text-center"
                    >
                      {$bookInfo.authors.join(", ")}
                    </p>
                  {/if}

                  {#if $bookInfo.numberOfRatings}
                    <div class="mb-3 flex items-center justify-center">
                      <StarRating
                        rating={Number($bookInfo.rating)}
                        size={20}
                        gap={6}
                      />
                      <span
                        class="ml-9 pt-9 text-18 font-copernicus leading-16 text-[#1e1915] font-600"
                      >
                        {$bookInfo.rating}
                      </span>
                    </div>
                  {/if}

                  <div class="mb-6 flex justify-center items-center gap-3">
                    {#if $bookInfo.numberOfRatings}
                      <span
                        class="text-13 font-proxima leading-16 text-[#707070] font-400"
                      >
                        {Number($bookInfo.numberOfRatings).toLocaleString()} ratings
                      </span>
                    {/if}
                    {#if $bookInfo.numberOfReviews}
                      <span
                        class="text-13 font-proxima leading-16 text-[#707070] font-400"
                      >
                        ·&#32; {Number(
                          $bookInfo.numberOfReviews,
                        ).toLocaleString()} reviews
                      </span>
                    {/if}
                  </div>

                  {#if $bookInfo.description}
                    <div class="my-3">
                      <p
                        class:clamped={!expandDesc}
                        class="text-13 font-proxima leading-16 text-[#1e1915] font-400"
                      >
                        {$bookInfo.description}
                      </p>

                      <button
                        onclick={() => (expandDesc = !expandDesc)}
                        class="text-11 font-proxima leading-12 text-[#1e1915] font-600 float-right"
                      >
                        {expandDesc ? "Show less" : "Show more"}
                      </button>
                    </div>
                  {/if}

                  {#if $bookInfo.numberOfPages}
                    <p
                      class="text-12 font-proxima leading-16 text-[#4f4f4d] font-400"
                    >
                      {$bookInfo.numberOfPages} pages, Paperback
                    </p>
                  {/if}

                  {#if $bookInfo.firstPublished}
                    <p
                      class="text-12 font-proxima leading-16 text-[#4f4f4d] font-400"
                    >
                      First published {$bookInfo.firstPublished}
                    </p>
                  {/if}

                  {#if $bookmark}
                    <p
                      class="text-12 font-proxima leading-16 text-[#4f4f4d] font-400"
                    >
                      Bookmarked at {format(
                        new Date($bookmark!.dateOfCreation),
                        "p cccc, yyyy-MM-dd",
                      )}
                    </p>
                  {/if}
                {:else if $bookmark}
                  <p
                    class="mt-12 mb-3 text-18 font-copernicus leading-28 text-[#1e1915] font-600 text-center"
                  >
                    {$bookmark.bookTile}
                  </p>
                  <p
                    class="mb-15 text-14 font-copernicus leading-18 text-[#1e1915] font-400 text-center"
                  >
                    {$bookmark.authors}
                  </p>
                  <p
                    class="text-13 font-proxima leading-20 text-[#4f4f4d] font-400"
                  >
                    Bookmarked at {format(
                      new Date($bookmark.dateOfCreation),
                      "p cccc, yyyy-MM-dd",
                    )}
                  </p>
                {/if}
              </div>
              <div class="w-full py-6 flex justify-center items-baseline">
                <button class="btn-menu" onclick={() => translateContent()}>
                  <Icon
                    icon="material-symbols:translate-rounded"
                    width="15"
                    height="15"
                  />
                </button>

                <button class="btn-menu" onclick={copyBookMarkToClipboard}>
                  <Icon
                    icon="material-symbols:content-copy-outline-rounded"
                    width="15"
                    height="15"
                  />
                </button>

                <button class="btn-menu" onclick={getRandomBookmark}>
                  <Icon
                    icon="material-symbols:shuffle-rounded"
                    width="15"
                    height="15"
                  />
                </button>

                <button
                  class="btn-menu"
                  onclick={() => {
                    showEdit = true;
                    isSubmitting = false;
                  }}
                >
                  <Icon
                    icon="material-symbols:edit-square-outline-rounded"
                    width="15"
                    height="15"
                  />
                </button>

                <button class="btn-menu" onclick={showInsertBookmark}>
                  <Icon
                    icon="material-symbols:database-upload-outline-rounded"
                    width="15"
                    height="15"
                  />
                </button>

                <button
                  class="btn-menu"
                  onclick={() => (showDelete = !showDelete)}
                >
                  <Icon
                    icon="material-symbols:delete-forever-outline-rounded"
                    width="15"
                    height="15"
                  />
                </button>
              </div>
            </div>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={handleGetPrevBookmark}
              disabled={keyPressed || isRandomed}
              class:disabled={keyPressed || isRandomed}
            ></button>
          </div>
        </div>
      {:else}
        <div
          class="flip normalPage"
          style="z-index: {page.zIndex}; transform: rotateY(-{page.rotate}deg); left: 50%; right: {page.rotate
            ? 12 + 2 * i
            : 12 + 2 * (flipPages.length - i)}px;"
        >
          <div class="pageFront frontPaper" class:firstPage={i === 1}>
            <div
              class="content"
              style="width: {pageWidth(windowHeight) / 2 -
                12 -
                112}px; height: {pageHeight(windowHeight) -
                24 -
                96}px; margin: 3rem 3rem 3rem calc(4rem - {page.rotate
                ? 2 * i
                : 2 * (flipPages.length - i)}px);"
            >
              {@html page.front}
            </div>

            <span class="pageNumber">{2 * i - 1}.</span>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            >
              {#if page.rotate === 0}
                <div class="pageFold"></div>
              {/if}
            </button>
          </div>
          <div class="pageBack backPaper">
            <div
              class="content"
              style="width: {pageWidth(windowHeight) / 2 -
                12 -
                112}px; height: {pageHeight(windowHeight) -
                24 -
                96}px; margin: 3rem calc(3rem - {page.rotate
                ? 2 * i
                : 2 * (flipPages.length - i)}px) 3rem 4rem;"
            >
              {@html page.back}
            </div>

            <span class="pageNumber">{2 * i}.</span>
            <button
              class="pageButton"
              aria-label="pageButton"
              onclick={() => handleFlipPage(i)}
            >
              {#if page.rotate === 180}
                <div class="pageFold"></div>
              {/if}
            </button>
          </div>
        </div>
      {/if}
    {/each}

    {#if flipPages.length && flipPages[0].rotate}
      <div
        class="frontShadow"
        style="z-index: 2;"
        in:shadowIn
        out:shadowOut
      ></div>
    {/if}

    <div class="backShadow" style="z-index: 1;"></div>

    <div class="backCover" style="z-index: 3;">
      <div class="w-full h-full frontCoverPaper">
        <button
          class="pageButton"
          aria-label="pageButton"
          onclick={handleGetNextBookmark}
          disabled={keyPressed || isRandomed}
          class:disabled={keyPressed || isRandomed}
        >
        </button>
      </div>
    </div>

    <button
      class="ribbon {visualProgress.current > 150
        ? 'ribbonLong'
        : 'ribbonShort'}"
      style="height: {visualProgress.current}px; z-index: {visualProgress.current >
      21
        ? 1001
        : 1};"
      onclick={handleCheckBookmark}
    >
      {#if visualProgress.current > 240}
        <span class="ribbonContent">
          {$bookmark!.like ? $bookmark!.like : ""}
        </span>
      {/if}
      {#if visualProgress.current > 21}
        <span
          class="ribbonTail {visualProgress.current > 150
            ? 'ribbonTailLong'
            : 'ribbonTailShort'}"
        ></span>
      {/if}
    </button>
  </div>
</section>

<svelte:window on:keydown={onKeyDown} bind:innerHeight={windowHeight} />

<style lang="postcss">
  .book {
    perspective: 4500px;
    position: relative;
  }

  .backCover {
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
    background: #0a0905;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    padding: 12px 12px 12px 0;
  }

  .backShadow {
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    box-shadow: -1px 9px 18px rgba(0, 0, 0, 0.8);
  }

  .frontShadow {
    position: absolute;
    height: 100%;
    width: 50%;
    left: 0;
    top: 0;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    box-shadow: 1px 9px 18px rgba(0, 0, 0, 0.8);
  }

  .frontPaper {
    background: linear-gradient(
      to right,
      #d9d9d9 0%,
      #f9f9f9 9%,
      #ffffff 12%,
      #ffffff 100%
    );
  }

  .frontCoverPaper {
    background: linear-gradient(
      to right,
      #d2cdc3 0%,
      #e9e4dc 3%,
      #efebe5 10%,
      #efebe5 100%
    );
  }

  .backPaper {
    background: linear-gradient(
      to right,
      #ffffff 0%,
      #ffffff 88%,
      #f9f9f9 91%,
      #d9d9d9 100%
    );
  }

  .backCoverPaper {
    background: linear-gradient(
      to right,
      #efebe5 0%,
      #efebe5 90%,
      #e9e4dc 97%,
      #d2cdc3 100%
    );
  }

  .cover {
    border-radius: 0 3px 3px 0;
    box-shadow: inset 4px 0 10px rgba(255, 255, 255, 0.1);
    background: #0a0905;
  }

  .cover::after {
    content: "";
    position: absolute;
    top: 0;
    left: 9px;
    bottom: 0;
    width: 2px;
    background: rgba(81, 81, 81, 0.3);
    box-shadow: 1px 0 3px rgba(255, 255, 255, 0.1);
  }

  .flip {
    transform-style: preserve-3d;
    transition: transform 450ms ease-in-out;
    transform-origin: left center;
  }

  .normalPage {
    position: absolute;
    bottom: 12px;
    top: 12px;
    box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.45);
  }

  .coverPage {
    position: absolute;
    height: 100%;
    width: 50%;
    right: 0;
    top: 0;
  }

  .pageFront {
    position: absolute;
    user-select: text;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .pageBack {
    position: absolute;
    user-select: text;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    z-index: 0;
    transform: rotateY(180deg);
  }

  .coverPage .pageBack {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  .coverPage .pageFront {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .content {
    font-family: "Bookerly", sans-serif;
    font-weight: 400;
    font-size: 15px;
    line-height: 1.55;
    letter-spacing: 0px;
    overflow: hidden;
    text-align: left;
    text-size-adjust: 100%;
    color: #1e1915;
  }

  .content :global {
    p {
      text-indent: 1.5em;
    }

    cite {
      display: block;
      text-align: right;
    }
  }

  .firstPage::first-letter {
    font-family: "Baskervville";
    font-size: 125px;
    font-weight: 600;
    color: #f0f0f0;
    font-style: normal;
    line-height: 100px;
    text-transform: uppercase;
    float: left;
    margin: 6px 5px 0 0;
    display: block;
    background: url("/images/TheEndoftheDay.webp") 0 0 no-repeat;
    background-size: cover;
    background-position: center;
    padding: 3px 6px 3px 6px;
    border: 1px solid #111111;
    text-shadow: 0 3px 4px rgba(0, 0, 0, 1);
    box-shadow: inset 0 1px 9px rgba(0, 0, 0, 1);
  }

  .pageNumber {
    position: absolute;
    bottom: 1.5rem;
    font-family: "Copernicus", sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #1e1915;
  }

  .pageFront .pageNumber {
    right: 2.5rem;
  }

  .pageBack .pageNumber {
    left: 2.5rem;
  }

  .pageButton {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
  }

  .pageButton.disabled {
    cursor: not-allowed;
  }

  .pageFront .pageButton,
  .backCover .pageButton {
    right: 0;
  }

  .pageBack .pageButton {
    left: 0;
  }

  .coverPage .pageBack .pageButton {
    top: 9px;
    bottom: 9px;
    left: 9px;
  }

  .backCover .pageButton {
    top: 9px;
    bottom: 9px;
    right: 9px;
  }

  .pageFold {
    position: absolute;
    width: 0px;
    height: 0px;
    transition: all 150ms;
  }

  .pageFront .pageFold {
    top: 0;
    right: 0;
    border-left-width: 1px;
    border-left-color: #dddddd;
    border-left-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: -4px 4px 10px #a4a4a4;
  }

  .pageBack .pageFold {
    top: 0;
    left: 0;
    border-right-width: 1px;
    border-right-color: #dddddd;
    border-right-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #dddddd;
    border-bottom-style: solid;
    box-shadow: 4px 4px 10px #a4a4a4;
  }

  .pageFront .pageButton:hover .pageFold {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      45deg,
      rgb(254, 254, 254) 0%,
      rgb(242, 242, 242) 49%,
      rgb(255, 255, 255) 50%,
      rgb(255, 255, 255) 100%
    );
  }

  .pageBack .pageButton:hover .pageFold {
    width: 60px;
    height: 60px;
    background-image: linear-gradient(
      135deg,
      rgb(255, 255, 255) 0%,
      rgb(255, 255, 255) 50%,
      rgb(242, 242, 242) 51%,
      rgb(254, 254, 254) 100%
    );
  }

  .ribbon {
    position: relative;
    top: -9px;
    left: calc(50% + 3px);
    user-select: none;
    border-top-left-radius: 3px;
    width: 36px;
    height: 18px;
    font-size: 1em;
    container-type: inline-size;
    z-index: 3;
  }

  .ribbonContent {
    font-family: "Copernicus", sans-serif;
    font-size: 60cqi;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    user-select: none;
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

  .ribbonShort {
    background: #a90909;
  }

  .ribbonLong {
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    background: linear-gradient(
      180deg,
      rgb(169, 9, 9) 0%,
      rgba(229, 33, 28, 1) 20%,
      rgba(164, 5, 2, 1) 40%,
      rgb(229, 10, 0) 100%
    );
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

  .clamped {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
