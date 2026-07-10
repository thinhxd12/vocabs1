<script lang="ts">
  import { marked } from "marked";
  import ArrowUpIcon from "~icons/lucide/arrow-up";
  import { tick } from "svelte";

  let userInput = $state<string>("");
  let loading = $state<boolean>(false);
  let chatHistory = $state<{ role: "user" | "ai"; text: string }[]>([]);
  let chatElement: HTMLDivElement;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!userInput.trim() || loading) return;

    const currentPrompt = userInput;
    chatHistory = [...chatHistory, { role: "user", text: currentPrompt }];
    userInput = "";
    loading = true;

    await tick();
    scrollToBottom(chatElement);

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

  async function scrollToBottom(node: HTMLDivElement) {
    node.scroll({ top: node.scrollHeight, behavior: "smooth" });
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.9.0/github-markdown-light.css"
  />
</svelte:head>

<div class="chat-content">
  <div
    class="w-full h-[calc(100%-60px)] mt-24 overflow-y-scroll my-scrollbar bg-white p-6"
    bind:this={chatElement}
  >
    {#each chatHistory as message}
      {#if message.role === "user"}
        <div class="flex justify-end">
          <p
            class="py-3 px-12 text-14 leading-18 bg-[#f0f2f5] rounded-12 max-w-240 clamped"
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
      <div class="my-12 text-13 leading-16">Gemini is thinking...</div>
    {/if}
  </div>

  <form
    onsubmit={handleSubmit}
    class="absolute bottom-0 w-full h-36 flex justify-between items-center bg-white border-t border-black/10"
  >
    <input
      type="text"
      bind:value={userInput}
      name="askinput"
      autocomplete="off"
      placeholder="Ask anything"
      disabled={loading}
      class="w-[calc(100%-30px)] h-full p-6 outline-none text-14 leading-16"
    />

    {#if userInput.trim()}
      <button
        type="submit"
        disabled={loading || !userInput.trim()}
        class="size-28 mr-4 bg-black/80 text-white rounded-3 transition flex justify-center items-center"
      >
        <ArrowUpIcon width={18} height={18} />
      </button>
    {/if}
  </form>
</div>

<style lang="postcss">
  .chat-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
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
