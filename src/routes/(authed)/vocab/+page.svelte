<script lang="ts">
  import Definition from "$lib/components/Definition.svelte";
  import Flipcard from "$lib/components/Flipcard.svelte";
  import Translate from "$lib/components/Translate.svelte";
  import Edit from "$lib/components/Edit.svelte";
  import {
    renderWord,
    searchTerm,
    searchResults,
    showEdit,
    showTranslate,
  } from "$lib/store/vocabstore";
  import { onDestroy, untrack } from "svelte";
  import { showTimer, vocabInput } from "$lib/store/navstore";
  import { toast } from "svelte-sonner";
  import { timerString } from "$lib/store/layoutstore";
  import { archiveVocab } from "$lib/utils/functions";
  import { page } from "$app/state";
  import Container from "$lib/components/Container.svelte";
  import MaterialSymbolsEditSquareOutlineRounded from "~icons/material-symbols/edit-square-outline-rounded";
  import MaterialSymbolsDeleteForeverOutlineRounded from "~icons/material-symbols/delete-forever-outline-rounded";

  let deleteSearchTimeout: ReturnType<typeof setTimeout>;
  let checkTimeout: ReturnType<typeof setTimeout>;
  const trigger = debounce(async (text: string) => {
    const { data } = await page.data.supabase
      .from("vocab_table")
      .select("id,word")
      .like("word", `${text}%`)
      .order("id", { ascending: true })
      .limit(9);

    if (!data) return;
    switch (data.length) {
      case 0:
        searchTermFounded = false;
        deleteSearchTimeout = setTimeout(() => {
          searchTermFounded = true;
          $searchTerm = "";
          $vocabInput = "";
          $searchResults = [];
          activeIndex = 0;
        }, 1500);
        src0 = "/sounds/mp3_Boing.mp3";
        paused0 = false;
        break;
      case 1:
        searchTermFounded = true;
        $searchResults = data;
        activeIndex = 0;
        if (text.length > 4) {
          checkTimeout = setTimeout(() => {
            handleSelectWordFromSearch(data[0].id);
          }, 1500);
        }
        break;
      default:
        searchTermFounded = true;
        $searchResults = data;
        activeIndex = 0;
        break;
    }
  }, 300);

  let debouncetimeout: ReturnType<typeof setTimeout>;
  export function debounce(callback: Function, wait = 300) {
    return (...args: any[]) => {
      clearTimeout(debouncetimeout);
      debouncetimeout = setTimeout(() => callback(...args), wait);
    };
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;

    clearTimeout(debouncetimeout);
    clearTimeout(checkTimeout);
    clearTimeout(deleteSearchTimeout);
    switch (true) {
      case e.key === "ArrowDown":
        activeIndex = (activeIndex + 1) % $searchResults.length;
        break;
      case e.key === "ArrowUp":
        activeIndex =
          (activeIndex - 1 + $searchResults.length) % $searchResults.length;
        break;
      case e.key === "Enter":
        handleSelectWordFromSearch($searchResults[activeIndex].id);
        break;
      case e.key === "Backspace":
        $searchTerm = $searchTerm.slice(0, -1);
        if ($searchTerm.length > 2) trigger($searchTerm.toLowerCase());
        break;
      case e.key === " ":
        searchTermFounded = true;
        $searchTerm = "";
        $searchResults = [];
        break;
      case /^[A-Za-z\-]$/.test(e.key):
        $searchTerm += e.key;
        if ($searchTerm.length > 2) {
          trigger($searchTerm.toLowerCase());
        }
        break;
      case /^[1-9]$/.test(e.key):
        if ($searchResults.length && Number(e.key) <= $searchResults.length) {
          handleSelectWordFromSearch($searchResults[Number(e.key) - 1].id);
        }
        break;
    }
  }

  // handlecheck
  async function handleSelectWordFromSearch(id: string) {
    $searchTerm = "";
    $searchResults = [];

    const { data } = await page.data.supabase
      .from("vocab_table")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (data) {
      $renderWord = data[0];
      $vocabInput = data[0].word;
      if (data[0].number > 1) {
        await page.data.supabase
          .from("vocab_table")
          .update({ number: data[0].number - 1 })
          .eq("id", id);
      } else {
        await archiveVocab(data[0].id, data[0].word, page.data.supabase);
      }
    }
  }

  let searchTermFounded = $state<boolean>(true);
  let src0 = $state<string>("");
  let paused0 = $state<boolean>(true);
  let src1 = $state<string>("");
  let paused1 = $state<boolean>(true);
  let flipNumber = $state<number>(0);
  let activeIndex = $state<number>(0);

  $effect(() => {
    const v = $renderWord;
    untrack(() => {
      if (v) {
        flipNumber = v.number;
        src1 = v.audio;
        paused1 = false;
      }
    });
  });

  function handlePlaySoundMeanings() {
    const translations = Array.isArray($renderWord?.meanings)
      ? $renderWord.meanings.flatMap((item: any) => item.translation).join(", ")
      : "";
    src0 = `https://vocabs3.vercel.app/speech?text=${translations}`;
    setTimeout(() => {
      paused0 = false;
      flipNumber = $renderWord!.number - 1;
    }, 1000);
  }

  async function confirmDelete(id: string) {
    const { error } = await page.data.supabase
      .from("vocab_table")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error!", {
        description: error.message as string,
        class: "my-toast-error",
        classes: {
          title: "text-[#f70000] text-14",
          description: "text-black/80 text-12",
        },
      });
    } else
      toast.success("Success!", {
        description: "Delete successfully.",
        class: "my-toast-success",
        classes: {
          title: "text-[#00c441] text-15 font-500",
          description: "text-black/70 text-12 font-400",
        },
      });
    searchTermFounded = true;
    $searchTerm = "";
    $searchResults = [];
  }

  let editId = $state<string>("");

  function handleEditFromSearch(id: string) {
    $searchTerm = "";
    $showEdit = true;
    editId = id;
    $searchResults = [];
  }

  function handleEditFromDefinition() {
    $showEdit = true;
    editId = $renderWord!.id;
    $searchResults = [];
  }

  function handleSearchInput() {
    clearTimeout(debouncetimeout);
    if ($vocabInput.length > 2) {
      trigger($vocabInput.toLowerCase());
    }
  }

  onDestroy(() => {
    renderWord.set(undefined);
  });
</script>

<svelte:head>
  {#if $showTimer && $timerString}
    <title>{$timerString}</title>
  {:else}
    <title>{$renderWord ? `${$renderWord.word}` : "vocab"}</title>
  {/if}

  <meta name="Vocab" content="Some Vocab" />
</svelte:head>

<audio src={src0} bind:paused={paused0} preload="auto"></audio>
<audio
  src={src1}
  bind:paused={paused1}
  onended={handlePlaySoundMeanings}
  preload="auto"
>
</audio>

{#if $showTranslate}
  <Container zIndex={6} scrollable>
    <Translate />
  </Container>
{:else if $searchTerm}
  <Container zIndex={6}>
    <p
      style="color: {searchTermFounded ? 'black' : 'white'}"
      class="light h-36 w-full truncate text-center font-constantine text-21 font-700 uppercase leading-36"
    >
      {$searchTerm}
    </p>
    {#if $searchResults.length}
      <div class="h-[calc(100vh-80px)] w-full no-scrollbar overflow-y-scroll">
        <ol>
          {#each $searchResults as item, i}
            <li class="{i === activeIndex ? 'light' : 'dark'} flex mb-2">
              <button
                class="size-36 opacity-0 hover:opacity-100 flex items-center justify-center transition"
                onclick={() => handleEditFromSearch(item.id)}
              >
                <MaterialSymbolsEditSquareOutlineRounded
                  width="18"
                  height="18"
                />
              </button>
              <button
                class="text-center flex-1 text-20 leading-30"
                onclick={() => {
                  handleSelectWordFromSearch(item.id);
                }}
              >
                <span>
                  <strong>{$searchTerm.toLowerCase()}</strong>
                  {item.word.replace($searchTerm.toLowerCase(), "")}
                </span>
              </button>
              <button
                class="size-36 opacity-0 hover:opacity-100 flex items-center justify-center transition"
                onclick={() => confirmDelete(item.id)}
              >
                <MaterialSymbolsDeleteForeverOutlineRounded
                  width="18"
                  height="18"
                />
              </button>
            </li>
          {/each}
        </ol>
      </div>
    {/if}
  </Container>
{:else if $showEdit}
  <Container zIndex={6} scrollable>
    <Edit id={editId} />
  </Container>
{:else if $renderWord}
  <Container zIndex={6} scrollable>
    <div class="h-36 w-full flex gap-3">
      <Flipcard number={flipNumber} />
      <div class="light flex-1 flex flex-col h-full">
        <p
          class="truncate text-center font-constantine text-21 font-700 uppercase leading-24"
        >
          {$renderWord.word}
        </p>
        <p
          class="truncate text-center text-9 opacity-50 leading-9 font-400 lowercase"
        >
          {$renderWord.phonetics}
        </p>
      </div>
    </div>
    <Definition item={$renderWord} onEdit={handleEditFromDefinition} />
  </Container>
{/if}

<svelte:window on:keydown={onKeyDown} />
