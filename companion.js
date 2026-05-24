(function () {
  const form = document.querySelector("[data-companion-form]");
  if (!form) return;

  const input = form.querySelector("[data-companion-input]");
  const messagesEl = document.querySelector("[data-companion-messages]");
  const statusEl = document.querySelector("[data-companion-status]");
  const counterEl = document.querySelector("[data-companion-counter]");
  const promptButtons = document.querySelectorAll("[data-companion-prompt]");
  const submitButton = form.querySelector("button[type='submit']");

  const MAX_MESSAGE_CHARS = 900;
  const MAX_MESSAGES = 8;
  const MAX_TOTAL_CHARS = 5000;
  const conversation = [
    {
      role: "assistant",
      content:
        "Hi, I'm the Reflection & Grounding Companion. We can do this slowly. You can pause or stop at any time. What would feel useful right now?",
    },
  ];

  const crisisPattern =
    /\b(suicide|suicidal|kill myself|end my life|take my life|want to die|don't want to live|dont want to live|self[-\s]?harm|hurt myself|overdose|not safe|immediate danger|abuse|assault|rape|domestic violence)\b/i;

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || "";
  }

  function trimConversation() {
    const greeting = conversation[0];
    const recent = conversation.slice(1).slice(-MAX_MESSAGES);
    conversation.length = 0;
    conversation.push(greeting, ...recent);
  }

  function renderMessage(role, content, options = {}) {
    const item = document.createElement("div");
    item.className = `companion-message ${role === "user" ? "is-user" : "is-guide"}`;
    if (options.crisis) item.classList.add("is-crisis");

    const label = document.createElement("span");
    label.className = "companion-message-label";
    label.textContent = role === "user" ? "You" : "Companion";

    const body = document.createElement("p");
    body.textContent = content;

    item.append(label, body);
    messagesEl.append(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderInitialMessages() {
    messagesEl.innerHTML = "";
    renderMessage("assistant", conversation[0].content);
  }

  function updateCounter() {
    const count = input.value.length;
    counterEl.textContent = `${count}/${MAX_MESSAGE_CHARS}`;
    counterEl.classList.toggle("is-near-limit", count > MAX_MESSAGE_CHARS * 0.85);
  }

  function crisisReply() {
    return "I'm going to pause the reflection exercise here because this tool is not for crisis support or immediate danger. If you may hurt yourself or someone else, or you are in danger right now, please contact emergency services now. In the United States, you can call or text 988 for the Suicide & Crisis Lifeline. If you can, reach out to a trusted person nearby and contact Dr. Fab or another clinician for follow-up support when it is safe to do so.";
  }

  function payloadMessages() {
    return conversation
      .slice(1)
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-MAX_MESSAGES);
  }

  function payloadLength(messages) {
    return messages.reduce((total, message) => total + message.content.length, 0);
  }

  function friendlyError(message) {
    if (/not configured/i.test(message)) {
      return "The companion is being connected right now. Please try again later, or use the contact links below for direct support.";
    }

    return message || "The companion could not respond right now.";
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    input.disabled = isLoading;
    submitButton.textContent = isLoading ? "Reflecting..." : "Send";
  }

  async function sendMessage(message) {
    conversation.push({ role: "user", content: message });
    renderMessage("user", message);
    input.value = "";
    updateCounter();

    if (crisisPattern.test(message)) {
      const reply = crisisReply();
      conversation.push({ role: "assistant", content: reply });
      trimConversation();
      renderMessage("assistant", reply, { crisis: true });
      setStatus("Crisis resources shown. No AI request was sent.");
      return;
    }

    setLoading(true);
    setStatus("The companion is taking a slow breath with you...");

    try {
      const messages = payloadMessages();
      if (payloadLength(messages) > MAX_TOTAL_CHARS) {
        throw new Error("Please shorten the conversation and try again.");
      }

      const payload = {
        messages,
      };
      const response = await fetch("api/companion.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "The companion could not respond right now.");
      }

      conversation.push({ role: "assistant", content: data.reply });
      trimConversation();
      renderMessage("assistant", data.reply, { crisis: Boolean(data.crisis) });
      setStatus(data.crisis ? "Crisis resources shown." : "");
    } catch (error) {
      const message =
        error && error.message
          ? error.message
          : "The companion could not respond right now.";
      setStatus(friendlyError(message));
    } finally {
      setLoading(false);
      input.focus();
    }
  }

  promptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.companionPrompt || "";
      updateCounter();
      setStatus("");
      input.focus();
    });
  });

  input.addEventListener("input", updateCounter);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    if (message.length > MAX_MESSAGE_CHARS) {
      setStatus(`Please keep your message under ${MAX_MESSAGE_CHARS} characters.`);
      return;
    }
    sendMessage(message);
  });

  renderInitialMessages();
  updateCounter();
})();
