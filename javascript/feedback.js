document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const successBox = document.getElementById("feedbackSuccess");

  const nameEl = document.getElementById("fbName");
  const emailEl = document.getElementById("fbEmail");
  const msgEl = document.getElementById("fbMessage");

  const errName = document.getElementById("errName");
  const errEmail = document.getElementById("errEmail");
  const errMessage = document.getElementById("errMessage");

  if (!form || !successBox || !nameEl || !emailEl || !msgEl || !errName || !errEmail || !errMessage) {
    return;
  }

  const STORAGE_KEY = "readifyFeedback";

  // Basic email format check for feedback form validation.
  const isEmailValid = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(email.trim());
  };

  // Marks a field invalid and shows its error text.
  const setError = (inputEl, errEl, message) => {
    const group = inputEl.closest(".feedback_group");
    group.classList.add("invalid");
    errEl.textContent = message;
  };

  // Clears invalid state for a field.
  const clearError = (inputEl, errEl) => {
    const group = inputEl.closest(".feedback_group");
    group.classList.remove("invalid");
    errEl.textContent = "";
  };

  // Shows and auto-hides the success message box.
  const showSuccess = (text) => {
    successBox.textContent = text;
    successBox.style.display = "block";

    setTimeout(() => {
      successBox.style.display = "none";
      successBox.textContent = "";
    }, 3500);
  };

  // Appends one feedback record to localStorage.
  const saveFeedback = (data) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    existing.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  };


  // Live name validation while typing.
  nameEl.addEventListener("input", () => {
    const v = nameEl.value.trim();
    if (v.length >= 2) clearError(nameEl, errName);
  });

  // Live email validation while typing.
  emailEl.addEventListener("input", () => {
    const v = emailEl.value.trim();
    if (isEmailValid(v)) clearError(emailEl, errEmail);
  });

  // Live message validation while typing.
  msgEl.addEventListener("input", () => {
    const v = msgEl.value.trim();
    if (v.length >= 10) clearError(msgEl, errMessage);
  });

  // Validates, stores, and clears feedback form on submit.
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    successBox.style.display = "none";
    successBox.textContent = "";

    let ok = true;

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const message = msgEl.value.trim();

    // Name validation
    if (name.length < 2) {
      setError(nameEl, errName, "Please enter your name (at least 2 characters).");
      ok = false;
    } else {
      clearError(nameEl, errName);
    }

    // Email validation
    if (!isEmailValid(email)) {
      setError(emailEl, errEmail, "Please enter a valid email address.");
      ok = false;
    } else {
      clearError(emailEl, errEmail);
    }

    // Message validation
    if (message.length < 10) {
      setError(msgEl, errMessage, "Message should be at least 10 characters.");
      ok = false;
    } else {
      clearError(msgEl, errMessage);
    }

    if (!ok) return;

    // Save to localStorage
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };

    saveFeedback(payload);

    // Confirmation message
    showSuccess("Thanks! Your feedback has been saved successfully.");

    // Reset form
    form.reset();
  });

  const faqList = document.getElementById("faqList");

  const faqs = [
    {
      q: "How soon do you reply to messages?",
      a: "We usually reply within 24–48 hours. If it’s urgent, please mention it in your message."
    },
    {
      q: "Do you offer personalized reading plans?",
      a: "Yes. Readify helps you discover books based on your mood and preferences, and you can build a reading list."
    },
    {
      q: "Can I request a new book or feature?",
      a: "Absolutely. Use the feedback form and tell us what you’d like to see. We review user requests regularly."
    },
    {
      q: "How do I report a bug or issue on the site?",
      a: "Send a message through the feedback form and include what you clicked, what happened, and (if possible) a screenshot."
    },
    {
      q: "Do you have a mobile app?",
      a: "Yes, we have apps for both iOS and Android. You can download them from the App Store or Google Play."
    }
  ];

  // Builds one FAQ item with toggle behavior.
  const createFaqItem = (item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "faq_item";

    const btn = document.createElement("button");
    btn.className = "faq_btn";
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", `faq_panel_${index}`);

    const title = document.createElement("span");
    title.textContent = item.q;

    const icon = document.createElement("i");
    icon.className = "ri-arrow-down-s-line";

    btn.appendChild(title);
    btn.appendChild(icon);

    const panel = document.createElement("div");
    panel.className = "faq_panel";
    panel.id = `faq_panel_${index}`;

    const inner = document.createElement("div");
    inner.className = "faq_panel_inner";
    inner.textContent = item.a;

    panel.appendChild(inner);

    btn.addEventListener("click", () => {

      document.querySelectorAll(".faq_item").forEach((it) => {
        if (it !== wrapper) {
          it.classList.remove("open");
          const b = it.querySelector(".faq_btn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });

      const isOpen = wrapper.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(panel);
    return wrapper;
  };

  // Render FAQ items when the container exists.
  if (faqList) {
    faqs.forEach((f, i) => faqList.appendChild(createFaqItem(f, i)));
  }
});
