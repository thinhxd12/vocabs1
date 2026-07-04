<script lang="ts">
  import { marked } from "marked";
  import ArrowUpIcon from "~icons/lucide/arrow-up";

  let userInput = $state("");
  let loading = $state(false);
  let chatHistory = $state<{ role: "user" | "ai"; text: string }[]>([]);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!userInput.trim() || loading) return;

    const currentPrompt = userInput;
    chatHistory = [...chatHistory, { role: "user", text: currentPrompt }];
    userInput = "";
    loading = true;

    try {
      const response = await fetch("/server/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      chatHistory = [...chatHistory, { role: "ai", text: data.text }];
    } catch (error) {
      chatHistory = [
        ...chatHistory,
        { role: "ai", text: "Error connecting to Gemini API." },
      ];
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.9.0/github-markdown-light.css"
    integrity="sha512-fC9GEHUvmfnPM95rXpp+RrxHTBp49uLMO+K55poJ+E+sSry9Db2sBD6HqUJzoNr+4II3ueeRKzY4B0uE9PvL2A=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
</svelte:head>

<div class="chat-content">
  <div
    class="w-full h-[calc(100%-30px)] overflow-y-scroll my-scrollbar bg-white p-6"
  >
    {#if chatHistory.length === 0}
      <p class="my-6 text-13 leading-16 text-center">Ask Gemini anything...</p>
    {/if}

    {#each chatHistory as message}
      {#if message.role === "user"}
        <div class="flex justify-end">
          <p
            class="p-3 text-14 leading-16 bg-[#f0f2f5] rounded-3 max-w-240 clamped"
          >
            {message.text}
          </p>
        </div>
      {:else}
        <div class="flex flex-col items-start markdown-body">
          {@html marked(message.text)}
        </div>
      {/if}
    {/each}

    {#if loading}
      <div class="my-6 text-13 leading-16">Gemini is thinking...</div>
    {/if}
  </div>

  <form
    onsubmit={handleSubmit}
    class="absolute bottom-0 w-full h-30 bg-white border-t border-black/10"
  >
    <input
      type="text"
      bind:value={userInput}
      placeholder="Ask anything"
      disabled={loading}
      class="w-[calc(100%-30px)] p-6 outline-none text-13 leading-16"
    />

    {#if userInput.trim()}
      <button
        type="submit"
        disabled={loading || !userInput.trim()}
        class="absolute size-24 bg-green-400/80 text-white rounded-3 right-3 top-3 transition flex justify-center items-center"
      >
        <ArrowUpIcon width={16} height={16} />
      </button>
    {/if}
  </form>
</div>

<style lang="postcss">
  .chat-content {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .markdown-body {
    font-size: 14px;
    padding: 6px;
    margin: 6px 0;
    font-family: "SF Pro Display";
  }

  .clamped {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
