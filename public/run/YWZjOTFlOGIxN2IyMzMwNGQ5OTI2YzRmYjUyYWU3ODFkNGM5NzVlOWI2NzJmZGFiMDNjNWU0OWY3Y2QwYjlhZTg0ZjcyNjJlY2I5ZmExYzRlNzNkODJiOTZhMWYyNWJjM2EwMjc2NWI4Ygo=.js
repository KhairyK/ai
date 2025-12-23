(() => {
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const typingIndicator = document.getElementById("typing-indicator");

  const messages = [];

  function createMessageBubble(text, role) {
    const wrapper = document.createElement("div");
    wrapper.className =
      "message p-3 rounded " +
      (role === "user"
        ? "user-message bg-primary text-white align-self-end"
        : "assistant-message bg-secondary-subtle align-self-start");

    const content = document.createElement("div");
    content.className = "markdown-body";
    content.innerHTML = marked.parse(text);

    wrapper.appendChild(content);

    wrapper.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });

    return wrapper;
  }

  function appendMessage(text, role) {
    const bubble = createMessageBubble(text, role);
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const content = userInput.value.trim();
    if (!content) return;

    userInput.value = "";
    appendMessage(content, "user");
    messages.push({ role: "user", content });

    typingIndicator.classList.add("visible");
    sendButton.disabled = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply =
        data.response ||
        data.output_text ||
        "⚠️ No response from AI.";

      appendMessage(reply, "assistant");
      messages.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error(err);
      appendMessage("❌ Failed to talk to AI.", "assistant");
    } finally {
      typingIndicator.classList.remove("visible");
      sendButton.disabled = false;
    }
  }

  sendButton.addEventListener("click", sendMessage);

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
