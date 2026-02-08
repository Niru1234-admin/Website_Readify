document.addEventListener("DOMContentLoaded", () => {
  // Modal shell elements shared by all mini-games.
  const modal = document.getElementById("gameModal");
  const overlay = document.getElementById("gameModalOverlay");
  const closeBtn = document.getElementById("gameModalClose");
  const titleEl = document.getElementById("gameModalTitle");
  const labelEl = document.getElementById("gameModalLabel");
  const mount = document.getElementById("gameMount");
  const gameCards = document.querySelectorAll(".game_card");

  if (!modal || !overlay || !closeBtn || !titleEl || !labelEl || !mount || gameCards.length === 0) {
    return;
  }

  // Memory game markup injected into the modal mount.
  const memoryTemplate = `
    <section style="padding:0; background:transparent;">
      <div>
        <div class="memory_header">
          <div>
            <p class="memory_label">Mini Game</p>
            <h2 class="memory_title">Memory Match</h2>
            <p class="memory_subtitle">Flip two cards. Match all pairs to win.</p>
          </div>

          <div class="memory_stats">
            <div class="stat_box">
              <span class="stat_label">Time</span>
              <span class="stat_value" data-time>00:00</span>
            </div>
            <div class="stat_box">
              <span class="stat_label">Moves</span>
              <span class="stat_value" data-moves>0</span>
            </div>
            <div class="stat_box">
              <span class="stat_label">Best</span>
              <span class="stat_value" data-best>--</span>
            </div>

            <button class="memory_btn" data-restart type="button">
              <i class="ri-refresh-line"></i> Restart
            </button>
          </div>
        </div>

        <div class="memory_board" data-board aria-label="Memory card board"></div>

        <div class="memory_modal" data-win aria-hidden="true">
          <div class="memory_modal_box">
            <h3>🎉 You won!</h3>
            <p data-wintext>Great job.</p>
            <button class="memory_btn primary" data-playagain type="button">
              Play again
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  // Builds and runs the memory match mini-game.
  function initMemoryGame(root) {
    const board = root.querySelector("[data-board]");
    const timeText = root.querySelector("[data-time]");
    const movesText = root.querySelector("[data-moves]");
    const bestText = root.querySelector("[data-best]");
    const restartBtn = root.querySelector("[data-restart]");

    const winModal = root.querySelector("[data-win]");
    const winText = root.querySelector("[data-wintext]");
    const playAgainBtn = root.querySelector("[data-playagain]");

    if (!board || !timeText || !movesText || !bestText || !restartBtn || !winModal || !winText || !playAgainBtn) {
      console.error("Memory game elements missing inside modal mount.");
      return () => {};
    }

    const BEST_KEY = "readify_memory_best_seconds";
    const EMOJIS = ["📘","📗","📙","📕","📚","🖊️","🧠","✨"];

    let first = null;
    let second = null;
    let lock = false;
    let moves = 0;
    let matchedPairs = 0;

    let seconds = 0;
    let timer = null;
    let started = false;

    // Formats elapsed seconds into mm:ss.
    const formatTime = (s) => {
      const mm = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      return `${mm}:${ss}`;
    };

    // Loads best time from localStorage.
    const loadBest = () => {
      const best = Number(localStorage.getItem(BEST_KEY));
      bestText.textContent = (!best || best <= 0) ? "--" : formatTime(best);
    };

    // Stores new best time when current run is faster.
    const setBestIfBetter = (newSeconds) => {
      const best = Number(localStorage.getItem(BEST_KEY));
      if (!best || newSeconds < best) {
        localStorage.setItem(BEST_KEY, String(newSeconds));
        bestText.textContent = formatTime(newSeconds);
        return true;
      }
      return false;
    };

    // Starts the in-game timer.
    const startTimer = () => {
      if (timer) return;
      timer = setInterval(() => {
        seconds += 1;
        timeText.textContent = formatTime(seconds);
      }, 1000);
    };

    // Stops and clears the in-game timer.
    const stopTimer = () => {
      clearInterval(timer);
      timer = null;
    };

    // Randomizes card order for each new round.
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Creates a doubled emoji deck and shuffles it.
    const createDeck = () => shuffle([...EMOJIS, ...EMOJIS]);

    // Handles card flipping and matching rules.
    function onCardClick(card){
      if (lock) return;
      if (card.classList.contains("flipped")) return;
      if (card.classList.contains("matched")) return;

      if (!started) {
        started = true;
        startTimer();
      }

      card.classList.add("flipped");

      if (!first) {
        first = card;
        return;
      }

      second = card;
      lock = true;

      moves += 1;
      movesText.textContent = String(moves);

      const v1 = first.dataset.value;
      const v2 = second.dataset.value;

      if (v1 === v2) {
        first.classList.add("matched", "disabled");
        second.classList.add("matched", "disabled");

        first = null;
        second = null;
        lock = false;

        matchedPairs += 1;
        if (matchedPairs === EMOJIS.length) {
          setTimeout(showWin, 350);
        }
        return;
      }

      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        first = null;
        second = null;
        lock = false;
      }, 650);
    }

    // Draw all cards to the board.
    const render = () => {
      board.innerHTML = "";
      const deck = createDeck();

      deck.forEach((emoji) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "card";
        card.dataset.value = emoji;

        card.innerHTML = `
          <div class="card_inner">
            <div class="card_face card_front">
              <div class="mark"><i class="ri-book-2-line"></i></div>
            </div>
            <div class="card_face card_back">
              <div class="emoji">${emoji}</div>
            </div>
          </div>
        `;

        card.addEventListener("click", () => onCardClick(card));
        board.appendChild(card);
      });
    };

    // Shows win modal with final stats.
    const showWin = () => {
      stopTimer();
      const bestUpdated = setBestIfBetter(seconds);
      winText.textContent = `You finished in ${formatTime(seconds)} with ${moves} moves.${bestUpdated ? " New best!" : ""}`;
      winModal.classList.add("show");
      winModal.setAttribute("aria-hidden", "false");
    };

    // Hides the win modal overlay.
    const hideWin = () => {
      winModal.classList.remove("show");
      winModal.setAttribute("aria-hidden", "true");
    };

    // Resets all memory game state and starts a fresh board.
    const restart = () => {
      hideWin();
      stopTimer();

      seconds = 0;
      moves = 0;
      matchedPairs = 0;
      started = false;
      first = null;
      second = null;
      lock = false;

      timeText.textContent = "00:00";
      movesText.textContent = "0";
      loadBest();
      render();
    };

    // Allows clicking outside win panel to restart quickly.
    const onWinClick = (e) => { if (e.target === winModal) restart(); };
    winModal.addEventListener("click", onWinClick);
    playAgainBtn.addEventListener("click", restart);
    restartBtn.addEventListener("click", restart);

    loadBest();
    restart();

    return () => {
      stopTimer();
      winModal.removeEventListener("click", onWinClick);
    };
  }

  let cleanupGame = null;
  let lastFocusedEl = null;

  // Opens the game modal and mounts selected game UI.
  function openModal({ title, label, html, initFn }) {
    lastFocusedEl = document.activeElement;

    labelEl.textContent = label;
    titleEl.textContent = title;

    mount.innerHTML = html;
    mount.scrollTop = 0;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal_open");

    cleanupGame = initFn ? initFn(mount) : null;

    requestAnimationFrame(() => {
      closeBtn.focus();
    });
  }

  // Closes modal and runs game cleanup logic if present.
  function closeModal() {
    if (typeof cleanupGame === "function") cleanupGame();
    cleanupGame = null;

    mount.innerHTML = "";
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal_open");

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  }

  // Launches a specific mini-game based on card data attribute.
  gameCards.forEach((btn) => {
    btn.addEventListener("click", () => {
      const game = btn.dataset.game;

      if (game === "memory") {
        openModal({
          title: "Memory Match",
          label: "Mini Game",
          html: memoryTemplate,
          initFn: initMemoryGame
        });
      } else if (game === "typing") {
        openModal({
          title: "Typing Speed",
          label: "Mini Game",
          html: typingTemplate,
          initFn: initTypingGame
        });
      } else {
        openModal({
          title: "Coming Soon",
          label: "Next Game",
          html: `
            <div style="padding:1rem; text-align:center;">
              <h3 style="margin-bottom:0.5rem;">🚧 Game not added yet</h3>
              <p style="color: var(--text-light); line-height:1.7;">
                We’ll add the next game later. For now, enjoy the games!
              </p>
            </div>
          `,
          initFn: null
        });
      }

    });
  });

  // Shared modal close controls.
  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });
});


  // Typing game markup injected into the same modal mount.
  const typingTemplate = `
    <section style="padding:0; background:transparent;">
      <div class="typing_wrap">
        <div class="typing_top">
          <div>
            <p class="typing_label">Mini Game</p>
            <h2 class="typing_title">Typing Speed</h2>
            <p class="typing_subtitle">Type the text below. We’ll calculate WPM + accuracy.</p>
          </div>

          <div class="typing_controls">
            <select class="typing_select" data-duration aria-label="Select duration">
              <option value="30">30s</option>
              <option value="45">45s</option>
              <option value="60" selected>60s</option>
            </select>

            <button class="memory_btn" data-new type="button">
              <i class="ri-shuffle-line"></i> New text
            </button>

            <button class="memory_btn" data-start type="button">
              <i class="ri-play-line"></i> Start
            </button>

            <button class="memory_btn" data-reset type="button">
              <i class="ri-refresh-line"></i> Reset
            </button>
          </div>

          <div class="typing_stats">
            <div class="stat_box">
              <span class="stat_label">Time</span>
              <span class="stat_value" data-time>60</span>
            </div>
            <div class="stat_box">
              <span class="stat_label">WPM</span>
              <span class="stat_value" data-wpm>0</span>
            </div>
            <div class="stat_box">
              <span class="stat_label">Accuracy</span>
              <span class="stat_value" data-acc>0%</span>
            </div>
          </div>
        </div>

        <div class="typing_quote" data-quote aria-label="Text to type"></div>

        <input class="typing_input" data-input
          type="text"
          placeholder="Click Start, then type here…"
          autocomplete="off"
          spellcheck="false"
          disabled
        />

        <p class="typing_note" data-note>
          Tip: Don’t use backspace too much — try to stay accurate.
        </p>
      </div>
    </section>
  `;

  // Builds and runs the typing speed mini-game.
  function initTypingGame(root){
    const quoteEl = root.querySelector("[data-quote]");
    const inputEl = root.querySelector("[data-input]");
    const timeEl = root.querySelector("[data-time]");
    const wpmEl = root.querySelector("[data-wpm]");
    const accEl = root.querySelector("[data-acc]");

    const durationSel = root.querySelector("[data-duration]");
    const btnNew = root.querySelector("[data-new]");
    const btnStart = root.querySelector("[data-start]");
    const btnReset = root.querySelector("[data-reset]");

    if (!quoteEl || !inputEl || !timeEl || !wpmEl || !accEl || !durationSel || !btnNew || !btnStart || !btnReset) {
      console.error("Typing game elements missing.");
      return () => {};
    }

    const QUOTES = [
      "Books are a uniquely portable magic that fits inside your mind.",
      "Small progress every day becomes a big result over time.",
      "Readify helps you find stories, build habits, and stay curious.",
      "Focus on clarity first, then speed. Accuracy builds confidence.",
      "A good reader becomes a better thinker, writer, and problem solver.",
      "Discipline beats motivation when motivation disappears.",
      "Learn deeply, practice often, and keep improving step by step."
    ];

    let quote = "";
    let started = false;
    let secondsLeft = Number(durationSel.value);
    let totalSeconds = secondsLeft;

    let timer = null;
    let startTime = null;

    // Picks a random sentence for the current round.
    const pickQuote = () => {
      quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      renderQuote("");
    };

    // Renders quote text with correct/incorrect character highlighting.
    const renderQuote = (typed) => {
      let html = "";
      for (let i = 0; i < quote.length; i++) {
        const qChar = quote[i];
        const tChar = typed[i];

        if (tChar == null) {
          if (i === typed.length && started) html += `<span class="cur">${escapeHtml(qChar)}</span>`;
          else html += escapeHtml(qChar);
        } else if (tChar === qChar) {
          html += `<span class="good">${escapeHtml(qChar)}</span>`;
        } else {
          html += `<span class="bad">${escapeHtml(qChar)}</span>`;
        }
      }
      quoteEl.innerHTML = html;
    };

    // Escapes dynamic text before injecting into HTML.
    const escapeHtml = (s) =>
      s.replaceAll("&", "&amp;")
       .replaceAll("<", "&lt;")
       .replaceAll(">", "&gt;")
       .replaceAll('"', "&quot;")
       .replaceAll("'", "&#039;");

    // Calculates and updates live accuracy and WPM values.
    const computeStats = () => {
      const typed = inputEl.value;

      let correct = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === quote[i]) correct++;
      }
      const acc = typed.length ? Math.round((correct / typed.length) * 100) : 0;

      const now = Date.now();
      const elapsedMs = startTime ? (now - startTime) : 0;
      const minutes = Math.max(elapsedMs / 60000, 1 / 60000);

      const words = correct / 5;
      const wpm = Math.max(0, Math.round(words / minutes));

      accEl.textContent = `${acc}%`;
      wpmEl.textContent = String(wpm);
    };

    // Updates remaining time display.
    const setTime = (s) => {
      timeEl.textContent = String(s);
    };

    // Stops timer and locks typing input.
    const stop = () => {
      clearInterval(timer);
      timer = null;
      started = false;
      inputEl.disabled = true;
      btnStart.innerHTML = `<i class="ri-play-line"></i> Start`;
    };

    // One timer tick for countdown and stat refresh.
    const tick = () => {
      secondsLeft -= 1;
      setTime(secondsLeft);
      computeStats();

      if (secondsLeft <= 0) {
        stop();
      }
    };

    // Starts a fresh typing attempt.
    const start = () => {
      if (timer) return;

      started = true;
      secondsLeft = Number(durationSel.value);
      totalSeconds = secondsLeft;
      setTime(secondsLeft);

      inputEl.value = "";
      inputEl.disabled = false;
      inputEl.focus();

      startTime = Date.now();
      renderQuote("");
      wpmEl.textContent = "0";
      accEl.textContent = "0%";

      btnStart.innerHTML = `<i class="ri-pause-line"></i> Stop`;

      timer = setInterval(tick, 1000);
    };

    // Resets typing game UI and state.
    const reset = () => {
      stop();
      secondsLeft = Number(durationSel.value);
      totalSeconds = secondsLeft;
      setTime(secondsLeft);

      inputEl.value = "";
      inputEl.disabled = true;

      wpmEl.textContent = "0";
      accEl.textContent = "0%";
      renderQuote("");
    };

    // Handles user typing and quote completion checks.
    const onInput = () => {
      if (!started) return;
      const typed = inputEl.value;

      if (typed.length > quote.length) {
        inputEl.value = typed.slice(0, quote.length);
      }

      renderQuote(inputEl.value);
      computeStats();

      if (inputEl.value.length === quote.length) {
        stop();
      }
    };

    // Toggle between start and stop actions.
    const onStartClick = () => {
      if (timer) stop();
      else start();
    };

    // Apply new duration when not actively running.
    const onDurationChange = () => {
      if (!timer) reset();
    };

    // Generate a new quote and clear current run.
    const onNewClick = () => {
      pickQuote();
      reset();
    };

    // Manual reset button handler.
    const onResetClick = () => {
      reset();
    };

    btnNew.addEventListener("click", onNewClick);
    btnReset.addEventListener("click", onResetClick);
    btnStart.addEventListener("click", onStartClick);
    durationSel.addEventListener("change", onDurationChange);
    inputEl.addEventListener("input", onInput);

    pickQuote();
    reset();

    // Cleanup handlers when modal closes.
    return () => {
      stop();
      btnNew.removeEventListener("click", onNewClick);
      btnReset.removeEventListener("click", onResetClick);
      btnStart.removeEventListener("click", onStartClick);
      durationSel.removeEventListener("change", onDurationChange);
      inputEl.removeEventListener("input", onInput);
    };
  }

