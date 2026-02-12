<script lang="ts">
  import { enhance } from "$app/forms";
  import type { BookPageContentType, DBSelect } from "$lib/types";
  import Icon from "@iconify/svelte";
  import { format } from "date-fns";
  import { toast } from "svelte-sonner";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/state";
  import { Spring, Tween } from "svelte/motion";
  import { quadInOut } from "svelte/easing";
  import { onDestroy, onMount } from "svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import { bookmark, bookInfo } from "$lib/store/highlightstore";
  import { innerHeight } from "svelte/reactivity/window";
  import HighlightPage from "$lib/components/HighlightPage.svelte";

  const ratio = 1.61803398875;
  let isRandomed = $state<boolean>(false);
  let likeBookmark = $state<boolean>(false);
  let keyPressed = $state<boolean>(false);

  const tweenCover = new Spring(0, {
    stiffness: 0.06,
    damping: 0.4,
  });

  const tweenRibbon = new Tween(21, {
    duration: 150,
    easing: quadInOut,
  });

  let flipCover = $state<boolean>(false);

  let flipTimeoutId: string | number | NodeJS.Timeout | undefined;
  let flagTimeoutId: string | number | NodeJS.Timeout | undefined;
  let keyDownTimeoutId: string | number | NodeJS.Timeout | undefined;
  let currentPage = $state<number>(0);
  let flipPages = $state<BookPageContentType[]>([
    {
      id: 1,
      flip: false,
      front: "abc",
      back: "cde",
    },
  ]);
  let showEdit = $state<boolean>(false);
  let showInsert = $state<boolean>(false);
  let showDelete = $state<boolean>(false);
  let insertData = $state<DBSelect["bookmark_table"][] | undefined>(undefined);
  let isSubmitting = $state<boolean>(false);
  let showTranslated = $state<boolean>(false);
  let translatedContent = $state<string>("");
  let expandDesc = $state<boolean>(false);
  let showNote = $state<boolean>(false);
  let noteContent = $state<string>("");

  const pageWidth = () => {
    const width = Math.round(ratio * (innerHeight.current! - 150));
    return width % 2 !== 0 ? width + 1 : width;
  };
  const pageHeight = () => innerHeight.current! - 150;

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
      noteContent = data[0].note;
      resetRenderBookmark();
    }
  }

  onMount(() => {
    if (!$bookmark) {
      handleGetCurrentBookmark();
    } else {
      setBookContent($bookmark.content);
      noteContent = $bookmark.note;
      resetRenderBookmark();
    }
  });

  async function handleGetNextBookmark() {
    if (!bookmark || isRandomed) return;
    showNote = false;
    handleUpdateNote();

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
    showNote = false;
    handleUpdateNote();

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
    tweenRibbon.target = 21;

    if (flipPages[0].flip) {
      flipPages.forEach((item, i) => {
        setTimeout(
          () => {
            item.flip = false;
          },
          (flipPages.length - i - 1) * 150,
        );
      });
      flipTimeoutId = setTimeout(() => {
        tweenCover.target = 0;
        flipCover = false;
      }, flipPages.length * 150);

      setTimeout(
        () => {
          currentPage = 0;
          bookmark.set(data);
          setBookContent(data.content);
          noteContent = data.note;
          resetRenderBookmark();
          keyPressed = false;
        },
        flipPages.length * 150 + 300,
      );
    } else {
      tweenCover.target = 0;
      flipCover = false;
      flipTimeoutId = setTimeout(() => {
        currentPage = 0;
        bookmark.set(data);
        setBookContent(data.content);
        noteContent = data.note;
        resetRenderBookmark();
        keyPressed = false;
      }, 300);
    }
  }

  function handleOpenBook() {
    flipCover = true;
    tweenCover.target = -180;
    if ($bookmark!.like) {
      setTimeout(() => {
        tweenRibbon.target = likeBookmark ? 580 : 480;
      }, 250);
    }
  }

  async function handleSetBookmark(data: DBSelect["bookmark_table"]) {
    handleCloseBook(data);
    if (data.bookTile !== $bookmark?.bookTile) {
      handleGetBookInfo(data);
    }
    const { error } = await page.data.supabase
      .from("bookmark_progress")
      .update({ currentId: data.id })
      .eq("id", 1);
  }

  async function handleGetBookInfo(data: DBSelect["bookmark_table"]) {
    let titleParam = data.bookTile;
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
      tweenRibbon.target = newLike === 0 ? 21 : 480;
      bookmark.update((n) => ({ ...n!, like: newLike }));
      likeBookmark = false;
      const { error } = await page.data.supabase
        .from("bookmark_table")
        .update({ like: newLike })
        .eq("id", $bookmark!.id);
    } else {
      const newLike = $bookmark!.like + 1;
      tweenRibbon.target = 580;
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
    showNote = false;
    handleUpdateNote();

    isRandomed = true;
    const { data, error } = await page.data.supabase.rpc("get_random_bookmark");

    if (data.length) {
      if (data.bookTile !== $bookmark?.bookTile) {
        handleGetBookInfo(data[0]);
      }
      handleCloseBook(data[0]);
    }
  }

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

  /**
   * Get height of the text.
   * @param pText - string
   * @param pWidth - page width
   * @param fistPage - fistPage
   * @returns The height of the pText
   */
  function getHeightTextPage(
    pText: string,
    pWidth: number,
    fistPage: boolean = false,
  ) {
    let lDiv = document.createElement("div");

    document.body.appendChild(lDiv);
    if (fistPage) {
      lDiv.className = "highlightContent highlightContentFirstPage";
    } else {
      lDiv.className = "highlightContent";
    }
    lDiv.innerHTML = pText;
    lDiv.style.width = String(pWidth) + "px";

    const height = lDiv.clientHeight;
    document.body.removeChild(lDiv);
    return height;
  }

  function splitIntoBlocks(text: string) {
    const words = text.trim().split(" ");
    let maxHeight = pageHeight() - 24 - 96;
    let maxWidth = pageWidth() / 2 - 12 - 112;

    const flattenedArray = words.reduce(
      (acc: string[], cur: string, index: number) => {
        if (acc.length === 0) {
          acc.push(cur);
        } else if (acc.length === 1) {
          let testString = acc[acc.length - 1] + " " + cur;
          if (getHeightTextPage(testString, maxWidth, true) < maxHeight) {
            acc[acc.length - 1] = testString;
          } else acc.push(cur);
        } else {
          let testString = acc[acc.length - 1] + " " + cur;
          if (getHeightTextPage(testString, maxWidth) < maxHeight) {
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

  function setBookContent(content: string) {
    let pages = splitIntoBlocks(content);
    flipPages = pages.reduce(
      (acc: BookPageContentType[], cur: string, index: number) => {
        if (index % 2 === 0) {
          acc.push({
            id: 1 + index / 2,
            front: cur,
            back: pages[index + 1],
            flip: false,
          });
        }
        return acc;
      },
      [],
    );
  }

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

  async function translateContent() {
    if (!translatedContent.length) {
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=vi&q=${$bookmark!.content}`;
      const response = await fetch(url);
      const data = await response.json();
      translatedContent = data[0][0];
    }

    tweenRibbon.target = 21;
    tweenCover.target = 0;
    flipCover = false;
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

  function handleFlipPage(id: number) {
    keyPressed = true;
    tweenRibbon.target = 21;
    currentPage = id;

    if (flipPages[id - 1].flip) {
      flipPages[id - 1].flip = false;
    } else {
      flipPages[id - 1].flip = true;
    }

    flipTimeoutId = setTimeout(() => {
      keyPressed = false;
    }, 400);

    if (flipCover && $bookmark!.like) {
      flagTimeoutId = setTimeout(() => {
        tweenRibbon.target = likeBookmark ? 580 : 480;
      }, 400);
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
          if (flipCover) {
            handleFlipPage(1);
          } else {
            handleOpenBook();
          }
          break;
        case flipPages.length:
          flipPages[currentPage - 1].flip
            ? handleGetNextBookmark()
            : handleFlipPage(currentPage);
          break;
        default:
          flipPages[currentPage - 1].flip
            ? handleFlipPage(currentPage + 1)
            : handleFlipPage(currentPage);
          break;
      }
    } else if (e.key === "ArrowLeft") {
      switch (currentPage) {
        case 0:
          if (flipCover) {
            handleGetPrevBookmark();
          }
          break;
        case 1:
          flipPages[0].flip ? handleFlipPage(1) : handleGetPrevBookmark();
          break;
        default:
          flipPages[currentPage - 1].flip
            ? handleFlipPage(currentPage)
            : handleFlipPage(currentPage - 1);
          break;
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      handleCheckBookmark();
    }
  }

  function shadowIn(node: HTMLElement) {
    return {
      duration: 10,
      css: (t: number) => `
        box-shadow: ${1 * t}px ${6 * t}px ${18 * t}px rgba(0, 0, 0, ${0.8 * t});
      `,
    };
  }

  async function handleUpdateNote() {
    if (noteContent !== $bookmark!.note) {
      $bookmark!.note = noteContent;
      const { error } = await page.data.supabase
        .from("bookmark_table")
        .update({ note: noteContent })
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
      }
    }
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

  <div class="book" style="width: {pageWidth()}px; height: {pageHeight()}px;">
    <div
      class="flip flipCover"
      style="z-index: {tweenCover.current <= -90
        ? 4
        : 4 + flipPages.length}; transform: rotateY({tweenCover.current}deg);"
    >
      <div class="frontPage">
        <div
          class="frontCover"
          style="width: {pageWidth() / 2}px; height: {pageHeight()}px;"
        >
          {#if $bookInfo}
            <img
              src={$bookInfo!.coverImage}
              alt="book-cover"
              class="w-full h-full object-contain"
            />
          {:else}
            <div class="w-full h-full flex items-center p-60">
              <p
                class="text-[#d0c9c5] text-500 text-[45px] leading-[50px] font-copernicus"
              >
                take a small step every day
              </p>
            </div>
          {/if}
        </div>
        <button
          class="pageButton"
          aria-label="pageButton"
          onclick={() => handleOpenBook()}
        ></button>
      </div>
      <div class="backPage">
        <div
          class="infoPage"
          style="width: {pageWidth() / 2}px; height: {pageHeight()}px;"
        >
          <div class="infoPageContent frontCoverPaper">
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
                      class="mt-3 text-11 font-proxima leading-12 text-[#1e1915] font-600 float-right"
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

    {#each flipPages as item}
      <HighlightPage
        data={item}
        innerWidth={pageWidth() / 2 - 12 - 112}
        innerHeight={pageHeight() - 24 - 96}
        length={flipPages.length}
        handleFlip={handleFlipPage}
      />
    {/each}

    {#if tweenCover.current < -170}
      <div class="frontShadow" style="z-index: 2;" in:shadowIn></div>
    {/if}
    <div class="backShadow" style="z-index: 1;"></div>

    <div class="backCover" style="z-index: 3;">
      <div class="w-full h-full backCoverPaper"></div>
      <button
        class="pageButton"
        aria-label="pageButton"
        onclick={handleGetNextBookmark}
        disabled={keyPressed || isRandomed}
        class:disabled={keyPressed || isRandomed}
      >
      </button>
    </div>

    <button
      class="ribbon {tweenRibbon.current > 150 ? 'ribbonLong' : 'ribbonShort'}"
      style="height: {tweenRibbon.current}px; {tweenRibbon.current > 21
        ? 'box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); z-index: 999;'
        : 'z-index: 3;'}"
      onclick={handleCheckBookmark}
    >
      {#if tweenRibbon.current > 240}
        <span
          class="ribbonContent"
          style="font-size: {27 -
            3 **
              ($bookmark!.like &&
                $bookmark!.like.toLocaleString().length - 1)}px;"
        >
          {$bookmark!.like ? $bookmark!.like : ""}
        </span>
      {/if}
      {#if tweenRibbon.current > 21}
        <span
          class="ribbonTail {tweenRibbon.current > 150
            ? 'ribbonTailLong'
            : 'ribbonTailShort'}"
        ></span>
      {/if}
    </button>
  </div>

  {#if $bookmark}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="note-page absolute top-60 {showNote
        ? 'right-0'
        : 'right-[-270px]'}  bottom-[300px] w-[300px] transition-all duration-150 ease-in-out"
      onmouseenter={() => {
        showNote = true;
      }}
    >
      <textarea
        class="style-scrollbar"
        name="note"
        bind:value={noteContent}
        onkeydown={(e) => e.stopPropagation()}
      ></textarea>

      <button
        class="note-button"
        aria-label="note-button"
        onclick={(e) => {
          e.currentTarget.blur();
          showNote = false;
          handleUpdateNote();
        }}
      ></button>
    </div>
  {/if}
</section>

<svelte:window on:keydown={onKeyDown} />

<style lang="postcss">
  .book {
    perspective: 6000px;
    position: relative;
    display: flex;
    justify-content: center;
  }

  .flip {
    transform-style: preserve-3d;
    position: absolute;
    bottom: 12px;
    top: 12px;
  }

  .flipCover {
    bottom: 0;
    top: 0;
  }

  .frontPage {
    position: absolute;
    user-select: text;
    top: 0;
    left: 0;
    z-index: 0;
    backface-visibility: hidden;
    box-shadow: 2px 0px 2px rgba(0, 0, 0, 0.45);
  }

  .backPage {
    position: absolute;
    user-select: text;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    z-index: 1;
    transform: rotateY(180deg);
    box-shadow: -2px 0px 2px rgba(0, 0, 0, 0.45);
  }

  .flipCover .frontPage {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    overflow: hidden;
  }

  .flipCover .backPage {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    overflow: hidden;
  }

  .frontCoverPaper {
    background: linear-gradient(
      to right,
      #efebe5 0%,
      #efebe5 90%,
      #e9e4dc 97%,
      #d2cdc3 100%
    );
  }

  .backCoverPaper {
    background: linear-gradient(
      to right,
      #d2cdc3 0%,
      #e9e4dc 3%,
      #efebe5 10%,
      #efebe5 100%
    );
  }

  .backShadow {
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
    box-shadow: -1px 9px 18px rgba(0, 0, 0, 0.8);
  }

  .frontShadow {
    position: absolute;
    height: 100%;
    width: 50%;
    left: 0;
    top: 0;
    box-shadow: 1px 9px 18px rgba(0, 0, 0, 0.8);
  }

  .frontCover {
    background: #0a0905;
  }

  .infoPage {
    background: #0a0905;
    padding: 12px 0 12px 12px;
  }

  .infoPageContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .frontCover::after {
    content: "";
    position: absolute;
    top: 0;
    left: 9px;
    bottom: 0;
    width: 2px;
    background: rgba(81, 81, 81, 0.3);
    box-shadow: 1px 0 3px rgba(255, 255, 255, 0.1);
  }

  .backCover {
    position: absolute;
    height: 100%;
    width: 50%;
    top: 0;
    right: 0;
    background: #0a0905;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    padding: 12px 12px 12px 0;
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

  .frontPage .pageButton {
    right: 0;
  }

  .backPage .pageButton {
    left: 0;
  }

  .flipCover .backPage .pageButton {
    top: 12px;
    bottom: 12px;
    left: 12px;
  }

  .backCover .pageButton {
    top: 12px;
    bottom: 12px;
    right: 12px;
  }

  .ribbon {
    position: relative;
    top: -9px;
    left: 21px;
    user-select: none;
    border-top-left-radius: 3px;
    width: 36px;
  }

  .ribbonContent {
    font-family: "Copernicus", sans-serif;
    font-size: 27px;
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
    bottom: -21px;
    left: 0;
    width: 0;
    height: 0;
    z-index: inherit;

    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
  }

  .ribbonTailLong {
    border-top: 21px solid #e40900;
  }

  .ribbonTailShort {
    border-top: 21px solid #a90909;
  }

  .clamped {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .note-page {
    background-color: #fff;
    border: 2px solid #e0e0e0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .note-page::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(#d3d3d3 0.5px, transparent 1px);
    opacity: 0.2;
    pointer-events: none;
  }

  .note-button {
    position: absolute;
    display: block;
    background-color: rgba(108, 212, 255, 0.6);
    width: 120px;
    height: 35px;
    left: 50%;
    top: -18px;
    transform: translateX(-50%) rotate(3deg);
  }

  .note-page textarea {
    width: 100%;
    min-height: 100%;
    padding: 30px 18px 15px;
    font-family: "Comic Sans MS", cursive, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    outline: none;
    resize: vertical;
    overflow-y: auto;
    resize: none;
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
