(function () {
  const form = document.querySelector("[data-companion-form]");
  if (!form) return;

  const input = form.querySelector("[data-companion-input]");
  const messagesEl = document.querySelector("[data-companion-messages]");
  const statusEl = document.querySelector("[data-companion-status]");
  const counterEl = document.querySelector("[data-companion-counter]");
  const promptButtons = document.querySelectorAll("[data-companion-prompt]");
  const submitButton = form.querySelector("button[type='submit']");
  const companionLinks = document.querySelectorAll("[data-focus-companion]");
  const contactLinks = document.querySelectorAll("a[href^='mailto:']");
  const careButtons = document.querySelectorAll("[data-care-path]");
  const careResult = document.querySelector("[data-care-result]");
  const sanctuaryButtons = document.querySelectorAll("[data-sanctuary-tool]");
  const sanctuaryOutput = document.querySelector("[data-sanctuary-output]");
  const lexiconSearch = document.querySelector("[data-lexicon-search]");
  const lexiconFilters = document.querySelectorAll("[data-lexicon-filter]");
  const lexiconCards = document.querySelectorAll("[data-lexicon-card]");
  const lexiconDetail = document.querySelector("[data-lexicon-detail]");
  const pathwaySection = document.querySelector("#pathway");
  const pathwayForm = document.querySelector("[data-pathway-form]");
  const pathwayButtons = document.querySelectorAll("[data-pathway-option]");
  const pathwayStarters = document.querySelectorAll("[data-pathway-start]");
  const pathwayKicker = document.querySelector("[data-pathway-kicker]");
  const pathwayTitle = document.querySelector("[data-pathway-title]");
  const pathwayHelper = document.querySelector("[data-pathway-helper]");
  const pathwayName = document.querySelector("[data-pathway-name]");
  const pathwayReply = document.querySelector("[data-pathway-reply]");
  const pathwayNotes = document.querySelector("[data-pathway-notes]");
  const pathwayNoteLabel = document.querySelector("[data-pathway-note-label]");
  const pathwayStatus = document.querySelector("[data-pathway-status]");
  const pathwayReset = document.querySelector("[data-pathway-reset]");

  const CONTACT_EMAIL = "doctorfabj@gmail.com";
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

  const carePaths = {
    trauma: {
      label: "Trauma & Stress",
      title: "Begin with what your body keeps repeating.",
      text:
        "Name the pattern, choose one stabilizing practice, then decide whether private support or the companion is the next right door.",
    },
    "nervous-system": {
      label: "Nervous System Tools",
      title: "Track the state before changing the story.",
      text:
        "Notice activation, shutdown, or steadiness. Start with one body cue and one small regulation tool.",
    },
    families: {
      label: "Children & Families",
      title: "Support the system, not only the symptom.",
      text:
        "Start with co-regulation language, caregiver steadiness, and one repeatable repair practice at home.",
    },
    community: {
      label: "Community Wellness",
      title: "Make care part of the room.",
      text:
        "Choose one shared language set, one grounding ritual, and one workshop topic that fits the group.",
    },
  };

  const sanctuaryTools = {
    reset: {
      label: "90-second reset",
      title: "Come back to the room first.",
      steps: [
        "Look for three steady shapes.",
        "Feel both feet or one hand supported.",
        "Lengthen one exhale and let the next step be small.",
      ],
    },
    conversation: {
      label: "Before a hard conversation",
      title: "Enter with a steadier sentence.",
      steps: [
        "Name the outcome you want before you speak.",
        "Choose one feeling word and one clear request.",
        "Pause if your body starts arguing faster than your values.",
      ],
    },
    caregiver: {
      label: "Caregiver co-regulation",
      title: "Be the rhythm before the lesson.",
      steps: [
        "Lower your voice and slow your movements.",
        "Name what you see without blame.",
        "Offer one simple choice the child can actually make.",
      ],
    },
  };

  const lexiconPhrases = {
    Activation: 'Try saying: "My body is on alert, so I need steadiness before strategy."',
    Boundaries: 'Try saying: "This is what I can offer, and this is what I cannot carry."',
    "Co-Regulation": 'Try saying: "I can be steady with you while this feeling moves through."',
    Grounding: 'Try saying: "I am here, in this room, and I can take one breath at a time."',
    Regulation: 'Try saying: "My body is asking for steadiness before I solve this."',
    Repair: 'Try saying: "I want to return to this with honesty and care."',
    "Trauma-Informed": 'Try saying: "Safety, choice, and context matter here."',
    "Window of Tolerance": 'Try saying: "I may need more capacity before I continue."',
  };

  const pathwayConfig = {
    private: {
      helper:
        "A good first note names the concern, how to reach you, and the kind of support you are hoping for.",
      label: "Private Support",
      noteLabel: "What should Dr. Fab know first?",
      opening: "I'd like to request a consultation for private support.",
      subject: "Doctor Fab consultation inquiry",
      title: "Request a consultation.",
    },
    sanctuary: {
      helper:
        "A useful Sanctuary note names the tools you want most: grounding, language, caregiver support, or gentle updates.",
      label: "Sanctuary Updates",
      noteLabel: "What Sanctuary support interests you?",
      opening: "Please add me to the Healing Sanctuary updates list.",
      subject: "Doctor Fab Healing Sanctuary updates",
      title: "Join the Sanctuary list.",
    },
    workshop: {
      helper:
        "A strong workshop inquiry names the audience, the setting, and what people should leave understanding or practicing.",
      label: "Workshop Inquiry",
      noteLabel: "Audience, timeframe, and topic",
      opening: "I'd like to talk about a Doctor Fab workshop or speaking event.",
      subject: "Doctor Fab workshop or speaking inquiry",
      title: "Plan a workshop.",
    },
  };

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
      return "The live companion is being connected right now. This guided check-in can still help you take one steady next step.";
    }

    return message || "The companion could not respond right now.";
  }

  function canUseLocalFallback(message) {
    return !/shorten|under 900|rate limit|short pause/i.test(message);
  }

  function localReflectionReply(message) {
    const normalized = message.toLowerCase();
    const supportLine = `For direct clinical support or follow-up, email Dr. Fab at ${CONTACT_EMAIL}.`;

    if (/ground|breath|breathe|body|present/.test(normalized)) {
      return `Let's keep this very simple and present.

1. Let your eyes land on one steady object in the room.
2. Feel one point of contact: feet, chair, hands, or back.
3. Take three slower exhales than inhales, without forcing anything.

When you are ready, name one thing that feels even 1 percent more steady. ${supportLine}`;
    }

    if (/activated|overwhelm|anxious|panic|stress|slow/.test(normalized)) {
      return `It makes sense to slow the pace first.

1. Unclench your jaw, lower your shoulders, and look around the room.
2. Say quietly: "This is a moment of activation. I do not have to solve everything at once."
3. Choose one small stabilizing action: sip water, step outside, text a safe person, or pause for five minutes.

If this keeps feeling intense or unsafe, step away from this tool and contact a trusted person or professional support. ${supportLine}`;
    }

    if (/next step|choice|decide|stuck|small/.test(normalized)) {
      return `Let's make the next step smaller.

1. Name the need underneath this moment: rest, clarity, support, repair, space, or information.
2. Pick one action that takes less than ten minutes.
3. Let that be enough for now. You can reassess after your body has had a little time to settle.

One gentle next step could be sending Dr. Fab a short note at ${CONTACT_EMAIL}.`;
    }

    return `Thank you for naming what is present. We can meet it without rushing.

1. Notice what your body is doing right now.
2. Put one plain sentence around the feeling: "Something in me feels..."
3. Ask what would help for the next few minutes, not the whole future.

You do not need perfect words to ask for more support. ${supportLine}`;
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    input.disabled = isLoading;
    promptButtons.forEach((button) => {
      button.disabled = isLoading;
    });
    submitButton.textContent = isLoading ? "Reflecting..." : "Send";
  }

  function focusInput() {
    try {
      input.focus({ preventScroll: true });
    } catch (error) {
      input.focus();
    }
  }

  function selectCarePath(path) {
    if (!careResult || !carePaths[path]) return;

    const item = carePaths[path];
    careButtons.forEach((button) => {
      const isSelected = button.dataset.carePath === path;
      button.setAttribute("aria-pressed", String(isSelected));
      button.closest("article")?.classList.toggle("is-selected", isSelected);
    });
    careResult.innerHTML = `
      <span>${item.label}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    `;
  }

  function selectSanctuaryTool(tool) {
    if (!sanctuaryOutput || !sanctuaryTools[tool]) return;

    const item = sanctuaryTools[tool];
    sanctuaryButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.sanctuaryTool === tool));
    });
    sanctuaryOutput.innerHTML = `
      <span>${item.label}</span>
      <h3>${item.title}</h3>
      <ol>${item.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
    `;
  }

  function selectLexiconCard(card) {
    if (!card || !lexiconDetail) return;

    const title = card.querySelector("h3")?.textContent.trim() || "Selected term";
    const summary = card.querySelector("p")?.textContent.trim() || "";
    const phrase = lexiconPhrases[title] || "Try naming the need in one plain sentence.";

    lexiconCards.forEach((item) => {
      item.classList.toggle("is-selected", item === card);
    });
    lexiconDetail.innerHTML = `
      <span>Selected term</span>
      <h3>${title}</h3>
      <p>${summary}</p>
      <p>${phrase}</p>
    `;
  }

  function filterLexicon() {
    if (!lexiconSearch || !lexiconCards.length) return;

    const query = lexiconSearch.value.trim().toLowerCase();
    const activeFilter =
      Array.from(lexiconFilters).find((button) => button.getAttribute("aria-pressed") === "true")
        ?.dataset.lexiconFilter || "all";
    let firstVisible = null;
    let visibleCount = 0;

    lexiconCards.forEach((card) => {
      const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
      const terms = `${card.textContent} ${card.dataset.terms || ""}`.toLowerCase();
      const searchMatch = !query || terms.includes(query);
      const isVisible = categoryMatch && searchMatch;
      card.classList.toggle("is-hidden", !isVisible);
      if (isVisible) {
        firstVisible = firstVisible || card;
        visibleCount += 1;
      }
    });

    if (visibleCount === 0 && lexiconDetail) {
      lexiconDetail.innerHTML = `
        <span>No match yet</span>
        <h3>Try a broader word.</h3>
        <p>Search for body, stress, repair, child, boundary, or safety.</p>
      `;
      return;
    }

    const selectedVisible = Array.from(lexiconCards).some(
      (card) => card.classList.contains("is-selected") && !card.classList.contains("is-hidden")
    );
    if (!selectedVisible && firstVisible) {
      selectLexiconCard(firstVisible);
    }
  }

  function parseMailto(href) {
    const raw = href.replace(/^mailto:/i, "");
    const [emailPart, query = ""] = raw.split("?");
    const params = new URLSearchParams(query);

    return {
      body: params.get("body") || "",
      email: decodeURIComponent(emailPart || CONTACT_EMAIL),
      href,
      subject: params.get("subject") || "Doctor Fab inquiry",
    };
  }

  function mailtoHref(details) {
    const params = new URLSearchParams({
      subject: details.subject || "Doctor Fab inquiry",
      body: details.body || "",
    });
    return `mailto:${details.email || CONTACT_EMAIL}?${params.toString()}`;
  }

  function buildContactModal() {
    const modal = document.createElement("div");
    modal.className = "contact-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="contact-modal-backdrop" data-contact-close></div>
      <section class="contact-modal-panel" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" tabindex="-1">
        <button class="contact-modal-close" type="button" data-contact-close aria-label="Close contact panel">&times;</button>
        <p class="eyebrow">Contact Dr. Fab</p>
        <h2 id="contact-modal-title">Send a clear next-step note.</h2>
        <div class="contact-detail">
          <span>To</span>
          <strong data-contact-email></strong>
        </div>
        <div class="contact-detail">
          <span>Subject</span>
          <strong data-contact-subject></strong>
        </div>
        <label class="contact-message-label" for="contact-modal-message">Message starter</label>
        <textarea id="contact-modal-message" data-contact-message readonly></textarea>
        <p class="privacy-note">
          Please do not include crisis details, medical records, or sensitive health information by email.
        </p>
        <div class="contact-modal-actions">
          <a class="button primary" data-contact-open data-bypass-email-dialog>Open email app</a>
          <button class="button secondary" type="button" data-contact-copy-message>Copy message</button>
          <button class="button secondary" type="button" data-contact-copy-email>Copy email</button>
        </div>
        <p class="contact-modal-status" data-contact-status role="status" aria-live="polite"></p>
      </section>
    `;
    document.body.append(modal);
    return modal;
  }

  const contactModal = buildContactModal();
  const contactPanel = contactModal.querySelector(".contact-modal-panel");
  const contactOpenLink = contactModal.querySelector("[data-contact-open]");
  const contactEmailEl = contactModal.querySelector("[data-contact-email]");
  const contactSubjectEl = contactModal.querySelector("[data-contact-subject]");
  const contactMessageEl = contactModal.querySelector("[data-contact-message]");
  const contactStatusEl = contactModal.querySelector("[data-contact-status]");
  let previousFocus = null;

  function setContactStatus(message) {
    contactStatusEl.textContent = message || "";
  }

  function closeContactModal() {
    contactModal.hidden = true;
    document.body.classList.remove("contact-modal-open");
    setContactStatus("");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function openContactDetails(details, actionLabel = "Email Dr. Fab") {
    previousFocus = document.activeElement;
    contactEmailEl.textContent = details.email || CONTACT_EMAIL;
    contactSubjectEl.textContent = details.subject || "Doctor Fab inquiry";
    contactMessageEl.value = details.body || "";
    contactOpenLink.href = details.href || mailtoHref(details);
    contactOpenLink.setAttribute("aria-label", `${actionLabel}: open email app`);

    contactModal.hidden = false;
    document.body.classList.add("contact-modal-open");
    contactPanel.focus();
  }

  function openContactModal(link) {
    const details = parseMailto(link.href);
    const actionLabel = link.getAttribute("aria-label") || link.textContent.trim() || "Email Dr. Fab";
    openContactDetails(details, actionLabel);
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const scratch = document.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.left = "-9999px";
      document.body.append(scratch);
      scratch.select();
      document.execCommand("copy");
      scratch.remove();
    }

    setContactStatus(successMessage);
  }

  function selectedPathwayType() {
    return (
      Array.from(pathwayButtons).find((button) => button.getAttribute("aria-pressed") === "true")
        ?.dataset.pathwayOption || "private"
    );
  }

  function setPathwayStatus(message) {
    if (pathwayStatus) pathwayStatus.textContent = message || "";
  }

  function selectPathway(type, interest = "") {
    if (!pathwayConfig[type]) return;

    const config = pathwayConfig[type];
    pathwayButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.pathwayOption === type));
    });
    if (pathwayKicker) pathwayKicker.textContent = config.label;
    if (pathwayTitle) pathwayTitle.textContent = config.title;
    if (pathwayHelper) pathwayHelper.textContent = config.helper;
    if (pathwayNoteLabel) pathwayNoteLabel.textContent = config.noteLabel;

    if (interest && pathwayNotes) {
      pathwayNotes.value = `I'm interested in the ${interest} Sanctuary track.`;
    }

    setPathwayStatus(`${config.label} selected.`);
  }

  function focusPathwayForm() {
    const field = pathwayName || pathwayNotes;
    if (!field) return;

    try {
      field.focus({ preventScroll: true });
    } catch (error) {
      field.focus();
    }
  }

  function startPathway(type, interest = "") {
    selectPathway(type, interest);
    if (!pathwaySection) return;

    if (window.location.hash !== "#pathway") {
      window.location.hash = "pathway";
    }
    pathwaySection.scrollIntoView({ behavior: "auto", block: "start" });
    window.setTimeout(focusPathwayForm, 0);
  }

  function buildPathwayMessage() {
    const type = selectedPathwayType();
    const config = pathwayConfig[type];
    const name = pathwayName?.value.trim() || "";
    const reply = pathwayReply?.value.trim() || "";
    const notes = pathwayNotes?.value.trim() || "";

    return {
      body: `Hi Dr. Fab,

${config.opening}

Name: ${name || "[Name]"}
Best way to reach me: ${reply || "[Email or phone]"}
${config.noteLabel}: ${notes || "[A few words about what I need]"}

Thank you.`,
      email: CONTACT_EMAIL,
      subject: config.subject,
    };
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
      const errorMessage =
        error && error.message
          ? error.message
          : "The companion could not respond right now.";
      if (canUseLocalFallback(errorMessage)) {
        const reply = localReflectionReply(message);
        conversation.push({ role: "assistant", content: reply });
        trimConversation();
        renderMessage("assistant", reply);
        setStatus(`Guided check-in loaded locally. For direct support, email ${CONTACT_EMAIL}.`);
      } else {
        setStatus(friendlyError(errorMessage));
      }
    } finally {
      setLoading(false);
      focusInput();
    }
  }

  promptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const message = (button.dataset.companionPrompt || "").trim();
      if (!message || submitButton.disabled) return;
      setStatus("");
      sendMessage(message);
    });
  });

  companionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const tool = document.querySelector("#companion");
      if (!tool) return;

      event.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      tool.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      setStatus("The companion is ready when you are.");
      window.setTimeout(() => {
        focusInput();
      }, reduceMotion ? 0 : 450);
    });
  });

  pathwayStarters.forEach((starter) => {
    starter.addEventListener("click", (event) => {
      const type = starter.dataset.pathwayStart || "private";
      const interest = starter.dataset.pathwayInterest || "";

      if (starter.matches("a[href]")) {
        selectPathway(type, interest);
        window.setTimeout(focusPathwayForm, 250);
        return;
      }

      event.preventDefault();
      startPathway(type, interest);
    });
  });

  pathwayButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectPathway(button.dataset.pathwayOption || "private");
      focusPathwayForm();
    });
  });

  pathwayForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const details = buildPathwayMessage();
    openContactDetails(details, "Prepared Doctor Fab message");
    setPathwayStatus("Message prepared.");
  });

  pathwayReset?.addEventListener("click", () => {
    pathwayForm?.reset();
    selectPathway("private");
    focusPathwayForm();
  });

  careButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectCarePath(button.dataset.carePath);
    });
  });

  sanctuaryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectSanctuaryTool(button.dataset.sanctuaryTool);
    });
  });

  lexiconCards.forEach((card) => {
    const button = card.querySelector("button");
    button?.addEventListener("click", () => {
      selectLexiconCard(card);
    });
  });

  lexiconFilters.forEach((button) => {
    button.addEventListener("click", () => {
      lexiconFilters.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      filterLexicon();
    });
  });

  lexiconSearch?.addEventListener("input", filterLexicon);

  contactLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.hasAttribute("data-bypass-email-dialog")) return;

      event.preventDefault();
      openContactModal(link);
    });
  });

  contactModal.querySelectorAll("[data-contact-close]").forEach((button) => {
    button.addEventListener("click", closeContactModal);
  });

  contactModal.querySelector("[data-contact-copy-email]").addEventListener("click", () => {
    copyText(contactEmailEl.textContent, "Email address copied.");
  });

  contactModal.querySelector("[data-contact-copy-message]").addEventListener("click", () => {
    const message = `To: ${contactEmailEl.textContent}
Subject: ${contactSubjectEl.textContent}

${contactMessageEl.value}`;
    copyText(message, "Message copied.");
  });

  contactOpenLink.addEventListener("click", () => {
    setContactStatus("Opening your email app.");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !contactModal.hidden) {
      closeContactModal();
    }
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

  careButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
  });
  selectPathway("private");
  setPathwayStatus("");
  if (lexiconCards.length) {
    selectLexiconCard(lexiconCards[0]);
  }

  renderInitialMessages();
  updateCounter();
})();
