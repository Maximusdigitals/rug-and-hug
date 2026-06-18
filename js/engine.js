const ASSET_PATH = "assets/logos/curated/";
const ACTS = ["", "THE TRENCHES", "INSTITUTIONAL COSPLAY", "SMART MONEY THEATER", "CT FINAL BOSS"];
const SECRET_SKIP_CODE = "jeff";
const VOID_ALMIGHTY_CODE = "void almighty";

class GameEngine {
  constructor() {
    this.conviction = 100;
    this.dayIndex = 0;
    this.streak = 0;
    this.images = {};
    this.level = null;
    this.running = false;
    this.elapsed = 0;
    this.duration = 20;
    this.lastTs = 0;
    this.raf = null;
    this.keyDown = false;
    this.forceMobile = new URLSearchParams(location.search).has("mobile");
    this.mobile = this.forceMobile
      || matchMedia("(max-width:768px)").matches
      || "ontouchstart" in window;
    if (this.forceMobile) document.body.classList.add("force-mobile");
    this.lowPower = this.mobile
      || (navigator.hardwareConcurrency || 8) <= 4
      || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.lowPower) {
      document.body.classList.add("low-power");
      PERF_LITE = true;
    }
    this.pointer = { x: 0, y: 0, down: false };
    this.failCounts = {};
    this.skippedDays = new Set();
    this.voidAlmighty = false;
    this._codeBuf = "";

    this.screens = {
      title: document.getElementById("screen-title"),
      briefing: document.getElementById("screen-briefing"),
      play: document.getElementById("screen-play"),
      end: document.getElementById("screen-end"),
    };
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false, desynchronized: true });
    this.timerEl = document.getElementById("timer");
    this._timerSec = -1;
    this._resizeRaf = null;
    this.countdownEl = document.getElementById("countdown");
    this.resultEl = document.getElementById("result-overlay");
    this.dialogueEl = document.getElementById("dialogue-panel");
    this.instructionEl = document.getElementById("instruction");
    this.tapBtn = document.getElementById("btn-tap");
    this.playArea = document.getElementById("play-area");
    this.accentBar = document.getElementById("accent-bar");
    this.hintBar = document.getElementById("hint-bar");
    this.resultHint = document.getElementById("result-hint");
    this.skipGate = document.getElementById("skip-gate");
    this.skipCodePanel = document.getElementById("skip-code-panel");

    this.bindEvents();
    this.preloadImages();
    this.resize();
    matchMedia("(max-width:768px)").addEventListener("change", e => {
      this.mobile = e.matches || this.forceMobile;
      this.lowPower = this.mobile || (navigator.hardwareConcurrency || 8) <= 4;
      PERF_LITE = this.lowPower;
      document.body.classList.toggle("low-power", this.lowPower);
      this.scheduleResize();
    });
    window.addEventListener("resize", () => this.scheduleResize());
    window.addEventListener("orientationchange", () => this.scheduleResize());
    this.showScreen("title");
  }

  bindEvents() {
    document.getElementById("btn-start").onclick = () => this.startRun();
    document.getElementById("btn-next").onclick = () => this.advanceAfterResult();
    document.getElementById("btn-retry").onclick = () => this.retryDay();
    document.getElementById("btn-skip").onclick = () => this.skipLevel();
    document.getElementById("btn-home").onclick = () => this.resetToTitle();

    if (this.skipGate) {
      this.skipGate.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.submitSecretSkip();
        }
      });
    }
    const btnSkipCode = document.getElementById("btn-skip-code");
    if (btnSkipCode) btnSkipCode.onclick = () => this.submitSecretSkip();

    const voidActivate = document.getElementById("void-activate");
    const btnVoidActivate = document.getElementById("btn-void-activate");
    if (btnVoidActivate) btnVoidActivate.onclick = () => this.tryActivateVoidFromInput();
    if (voidActivate) {
      voidActivate.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.tryActivateVoidFromInput();
        }
      });
    }
    ["btn-void-skip-briefing", "btn-void-skip-play", "btn-void-skip-result"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.onclick = () => this.voidSkipDay();
    });

    const tap = (e) => { e.preventDefault(); this.handleTap(); };
    if (this.tapBtn) {
      this.tapBtn.addEventListener("touchstart", tap, { passive: false });
      this.tapBtn.addEventListener("click", tap);
    }

    window.addEventListener("keydown", (e) => {
      this.handleSecretCode(e);
      if (!this.running) return;
      this.keyDown = true;
      if (this.level?.onKey) this.level.onKey(this, e.key);
      if (e.key === " ") e.preventDefault();
    });
    window.addEventListener("keyup", () => { this.keyDown = false; });

    const down = (e) => {
      if (!this.running) return;
      e.preventDefault();
      const p = this.canvasPos(e);
      this.pointer = { x: p.x, y: p.y, down: true };
      if (this.level?.onTapAt) this.level.onTapAt(this, p.x, p.y);
      else if (this.level?.onTap) this.level.onTap(this);
    };
    const move = (e) => {
      if (!this.running || !this.pointer.down) return;
      e.preventDefault();
      const p = this.canvasPos(e);
      this.pointer.x = p.x; this.pointer.y = p.y;
      if (this.level?.onMove) this.level.onMove(this, p.x, p.y);
    };
    const up = () => { this.pointer.down = false; };

    this.canvas.addEventListener("mousedown", down);
    this.canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    this.canvas.addEventListener("touchstart", down, { passive: false });
    this.canvas.addEventListener("touchmove", move, { passive: false });
    this.canvas.addEventListener("touchend", up);
    this.canvas.addEventListener("touchcancel", up);

    document.body.addEventListener("touchmove", (e) => {
      if (this.running && this.screens.play.classList.contains("active")) e.preventDefault();
    }, { passive: false });
  }

  canvasPos(e) {
    const r = this.canvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return {
      x: (s.clientX - r.left) * (this.displayWidth / r.width),
      y: (s.clientY - r.top) * (this.displayHeight / r.height),
    };
  }

  handleTap() {
    if (!this.running || !this.level?.onTap) return;
    this.level.onTap(this);
    this.tapBtn?.classList.add("pressed");
    setTimeout(() => this.tapBtn?.classList.remove("pressed"), 100);
  }

  preloadImages() {
    const names = new Set();
    LEVELS.forEach(lv => {
      (lv.logos || []).forEach(n => names.add(n));
    });
    ["bonk.png","wif.png","jupiter.png","pump-fun.png","ethereum.png","hyperliquid-mark.svg",
     "bitcoin.png","usdc.png","usdt.png","dai.png","fear-greed.png","polymarket-icon.png",
     "megaeth.png","eigenlayer.png","blackrock-ibit.png","coinbase.png","ondo.png","zcash.png"
    ].forEach(n => names.add(n));
    names.forEach(name => {
      const img = new Image();
      img.src = ASSET_PATH + name;
      this.images[name] = img;
    });
  }

  image(name) { return this.images[name]?.complete ? this.images[name] : null; }

  scheduleResize() {
    if (this._resizeRaf) return;
    this._resizeRaf = requestAnimationFrame(() => {
      this._resizeRaf = null;
      this.resize();
    });
  }

  resize() {
    const area = this.playArea;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const dpr = this.lowPower ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    const tapH = this.tapBtn?.offsetHeight || 0;
    const w = Math.max(280, Math.floor(rect.width));
    const h = Math.max(200, Math.floor(rect.height - tapH));
    if (w === this.displayWidth && h === this.displayHeight && dpr === this._dpr) return;
    this._dpr = dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.displayWidth = w;
    this.displayHeight = h;
  }

  showScreen(name) {
    Object.values(this.screens).forEach(s => s.classList.remove("active"));
    this.screens[name].classList.add("active");
    document.body.dataset.screen = name;
    if (name === "play") this.scheduleResize();
    this.updateVoidAlmightyUI();
  }

  normalizeSecretCode(raw) {
    return String(raw || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  tryActivateVoidFromInput() {
    const el = document.getElementById("void-activate");
    if (!el) return false;
    const v = this.normalizeSecretCode(el.value);
    if (v === VOID_ALMIGHTY_CODE) {
      el.value = "";
      this.activateVoidAlmighty();
      return true;
    }
    if (v) {
      el.classList.add("shake");
      setTimeout(() => el.classList.remove("shake"), 140);
      el.value = "";
    }
    return false;
  }

  activateVoidAlmighty() {
    if (this.voidAlmighty) return;
    this.voidAlmighty = true;
    this.setCT([
      "<strong>@voidhl</strong> void mode engaged",
      "<strong>@HyperboleCap</strong> skip timeline unlocked",
    ]);
    this.updateVoidAlmightyUI();
  }

  updateVoidAlmightyUI() {
    document.body.classList.toggle("void-almighty", this.voidAlmighty);
    const chip = document.getElementById("void-mode-chip");
    if (chip) chip.hidden = !this.voidAlmighty;

    const canAdvance = this.voidAlmighty && this.dayIndex < LEVELS.length - 1;
    const onBriefing = this.screens.briefing.classList.contains("active");
    const onPlay = this.screens.play.classList.contains("active");
    const onResult = this.resultEl.classList.contains("show");

    const briefingBtn = document.getElementById("btn-void-skip-briefing");
    const playBtn = document.getElementById("btn-void-skip-play");
    const resultBtn = document.getElementById("btn-void-skip-result");

    if (briefingBtn) briefingBtn.hidden = !(canAdvance && onBriefing);
    if (playBtn) playBtn.hidden = !(canAdvance && onPlay);
    if (resultBtn) resultBtn.style.display = canAdvance && onPlay && onResult ? "inline-flex" : "none";
  }

  voidSkipDay() {
    if (!this.voidAlmighty) return;

    this.stopLevel();
    this.resultEl.classList.remove("show", "win", "fail");
    this.resetSkipCodeUI();

    if (this.dayIndex >= LEVELS.length - 1) {
      document.getElementById("btn-home").textContent = "Play Again";
      document.getElementById("screen-end-title").textContent = "CT Main Character";
      document.getElementById("screen-end-msg").textContent = `20 days survived. Conviction: ${this.conviction}. Timeline edited.`;
      this.showScreen("end");
      return;
    }

    const from = this.dayIndex + 1;
    this.dayIndex++;
    this.streak = 0;
    this.setCT([
      `<strong>@voidhl</strong> skipped day ${from}`,
      "<strong>@InternZero</strong> wasn't looking",
    ]);
    this.updateHUD();
    this.loadBriefing();
  }

  actForDay(i) {
    if (i < 5) return 1;
    if (i < 10) return 2;
    if (i < 15) return 3;
    return 4;
  }

  updateHUD() {
    const act = this.actForDay(this.dayIndex);
    document.getElementById("day-label").textContent = `Day ${this.dayIndex + 1}/${LEVELS.length}`;
    document.getElementById("act-label").textContent = ACTS[act];
    document.getElementById("conviction-val").textContent = this.conviction;
    document.getElementById("conviction-fill").style.width = `${this.conviction}%`;
    const prog = document.getElementById("day-progress");
    if (prog) prog.style.width = `${(this.dayIndex / LEVELS.length) * 100}%`;
    const progVal = document.getElementById("day-progress-val");
    if (progVal) progVal.textContent = `${this.dayIndex}/${LEVELS.length}`;
  }

  setCT(posts) {
    document.getElementById("ct-feed-posts").innerHTML = posts.map(p => `<div class="feed-item">${p}</div>`).join("");
  }

  startRun() {
    this.conviction = 100;
    this.dayIndex = 0;
    this.streak = 0;
    this.failCounts = {};
    this.skippedDays = new Set();
    this.setCT(["<strong>@HyperboleCap</strong> intern #0 starts today", "<strong>@CT</strong> no DD policy 🫡"]);
    this.loadBriefing();
  }

  failCountForLevel() {
    return this.failCounts[this.level?.id] || 0;
  }

  xSkipUrl(text) {
    const msg = text
      || `stuck on Rug or Hug day ${this.dayIndex + 1}. this game is actually hard @voidhl`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`;
  }

  updateHintUI() {
    const fails = this.failCountForLevel();
    const show = fails > 2 && this.level?.hint;
    if (this.hintBar) {
      if (show) {
        this.hintBar.hidden = false;
        this.hintBar.textContent = `💡 ${this.level.hint}`;
      } else {
        this.hintBar.hidden = true;
        this.hintBar.textContent = "";
      }
    }
  }

  loadBriefing() {
    this.level = LEVELS[this.dayIndex];
    const act = this.actForDay(this.dayIndex);
    document.getElementById("briefing-day").textContent = `Day ${this.dayIndex + 1} · Act ${act}`;
    document.getElementById("briefing-title").textContent = this.level.name;
    document.getElementById("briefing-boss").innerHTML = this.level.boss;
    document.getElementById("briefing-logos").innerHTML = (this.level.logos || [])
      .map(l => `<div class="logo-tile"><img src="${ASSET_PATH}${l}" alt=""></div>`).join("");
    const accent = this.level.accent || "#4d7cff";
    if (this.accentBar) this.accentBar.style.background = accent;
    const playBar = document.getElementById("accent-bar-play");
    if (playBar) playBar.style.background = accent;
    document.documentElement.style.setProperty("--accent", accent);
    this.updateHUD();
    this.showScreen("briefing");
  }

  nextDay() {
    this.showScreen("play");
    this.dialogueEl.style.display = "none";
    this.canvas.style.display = "block";
    const instr = this.mobile && this.level.mobileInstruction ? this.level.mobileInstruction : this.level.instruction;
    this.instructionEl.textContent = instr;
    this.updateHintUI();
    if (this.tapBtn) this.tapBtn.style.display = this.level.showTapButton ? "flex" : "none";
    this.resize();
    Effects.clear();
    this.countdown(this.lowPower ? 1 : 2, () => this.beginLevel());
  }

  retryDay() {
    this.resultEl.classList.remove("show", "win", "fail");
    this.resetSkipCodeUI();
    this.nextDay();
  }

  countdown(n, cb) {
    this.countdownEl.classList.add("show");
    const tick = (v) => {
      this.countdownEl.textContent = v || "GO";
      this.countdownEl.dataset.n = v || 0;
      const ms = this.lowPower ? 280 : 360;
      if (v === 0) setTimeout(() => { this.countdownEl.classList.remove("show"); cb(); }, ms);
      else setTimeout(() => tick(v - 1), ms);
    };
    tick(n);
  }

  beginLevel() {
    this.running = true;
    this.elapsed = 0;
    this.duration = this.level.duration || 20;
    this.pointer.down = false;
    this.resultEl.classList.remove("show", "win", "fail");
    this.resetSkipCodeUI();
    this._timerSec = Math.ceil(this.duration);
    if (this.timerEl) this.timerEl.textContent = this._timerSec;
    this.updateVoidAlmightyUI();

    if (this.level.isDialogue) {
      this.canvas.style.display = "none";
      if (this.tapBtn) this.tapBtn.style.display = "none";
      this.dialogueEl.style.display = "flex";
      this.level.init(this);
    } else {
      this.dialogueEl.style.display = "none";
      this.canvas.style.display = "block";
      this.level.init(this);
      this.lastTs = performance.now();
      this.loop();
    }

  }

  loop(ts) {
    if (!this.running) return;
    const now = ts || performance.now();
    const dt = Math.min(0.033, (now - this.lastTs) / 1000);
    this.lastTs = now;
    this.elapsed += dt;
    const sec = Math.ceil(Math.max(0, this.duration - this.elapsed));
    if (sec !== this._timerSec) {
      this._timerSec = sec;
      if (this.timerEl) this.timerEl.textContent = sec;
    }
    Effects.update(dt);
    if (this.level.update) this.level.update(dt, this);
    this.draw();
    this.raf = requestAnimationFrame(t => this.loop(t));
  }

  draw() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    if (this.level.draw) this.level.draw(this.ctx, this, w, h);
    if (this.level?.voidMark && !this.level.isDialogue) {
      drawVoidMark(this.ctx, w, h, this.level.voidMark, this.elapsed);
    }
    Effects.draw(this.ctx);
    if (this.flashColor) {
      this.ctx.fillStyle = this.flashColor + "33";
      this.ctx.fillRect(0, 0, w, h);
      this.flashColor = null;
    }
  }

  drawProgress(cur, max, w, h) {
    const bw = Math.min(200, w - 32);
    const bx = (w - bw) / 2;
    const by = h - 28;
    const ctx = this.ctx;
    ctx.fillStyle = "#1a1a1f";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, 8, 4);
    ctx.fill();
    const pct = Math.min(1, cur / max);
    ctx.fillStyle = this.level.accent || "#6366f1";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw * pct, 8, 4);
    ctx.fill();
    ctx.fillStyle = "#71717a";
    ctx.font = "11px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${cur} / ${max}`, w / 2, by - 6);
    ctx.textAlign = "left";
  }

  juice(x, y, color, text) {
    if (!this.lowPower) this.flashColor = color;
    Effects.burst(x, y, color, this.lowPower ? 5 : 8);
    if (text) Effects.floatText(x, y - 10, text, color);
  }

  flash(c) { this.flashColor = c; }

  shake() {
    this.canvas.classList.add("shake");
    this.playArea?.classList.add("shake");
    setTimeout(() => {
      this.canvas.classList.remove("shake");
      this.playArea?.classList.remove("shake");
    }, 140);
  }

  showDialogue(round) {
    document.getElementById("dialogue-q").textContent = round.q;
    const opts = document.getElementById("dialogue-opts");
    opts.innerHTML = "";
    round.options.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.className = "dialogue-btn";
      btn.innerHTML = text;
      btn.onclick = () => this.level.pick(this, i);
      opts.appendChild(btn);
    });
  }

  stopLevel() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = null;
    this.pointer.down = false;
  }

  winLevel() {
    if (!this.running) return;
    this.stopLevel();
    if (this.level?.id) this.failCounts[this.level.id] = 0;
    this.streak++;
    this.conviction = Math.min(100, this.conviction + (this.streak >= 3 ? 10 : 8));
    this.showResult(true);
  }

  loseLevel() {
    if (!this.running) return;
    this.stopLevel();
    this.streak = 0;
    this.conviction = Math.max(0, this.conviction - 10);
    this.showResult(false);
  }

  showResult(won) {
    if (!won) {
      const id = this.level.id;
      this.failCounts[id] = (this.failCounts[id] || 0) + 1;
    }

    this.resultEl.classList.add("show", won ? "win" : "fail");
    document.getElementById("result-title").textContent = won ? "CLEARED ✓" : "REKT ✗";
    document.getElementById("result-msg").textContent = won ? this.level.win : this.level.fail;

    const fails = this.failCountForLevel();
    if (this.resultHint) {
      if (!won && fails > 2 && this.level.hint) {
        this.resultHint.hidden = false;
        this.resultHint.textContent = `💡 Hint: ${this.level.hint}`;
      } else {
        this.resultHint.hidden = true;
        this.resultHint.textContent = "";
      }
    }

    const posts = (won ? this.level.ctWin : this.level.ctFail).map(t => {
      const i = t.indexOf(":");
      return i < 0 ? t : `<strong>${t.slice(0, i)}</strong>${t.slice(i + 1)}`;
    });
    if (!won && fails > 2 && this.level.hint) {
      posts.unshift(`<strong>@voidhl</strong> hint unlocked after ${fails} fails`);
    }
    this.setCT(posts);
    this.updateHUD();

    const last = this.dayIndex >= LEVELS.length - 1;
    document.getElementById("btn-next").style.display = won && this.conviction > 0 && !last ? "inline-flex" : "none";
    document.getElementById("btn-retry").style.display = !won && this.conviction > 0 ? "inline-flex" : "none";
    document.getElementById("btn-skip").style.display = !won && this.conviction > 0 && !last ? "inline-flex" : "none";
    document.getElementById("btn-home").style.display = this.conviction <= 0 || (won && last) ? "inline-flex" : "none";

    this.updateSkipCodeUI(!won);
    this.updateVoidAlmightyUI();

    if (won && last) {
      document.getElementById("btn-home").textContent = "Play Again";
      document.getElementById("screen-end-title").textContent = "CT Main Character";
      document.getElementById("screen-end-msg").textContent = `20 days survived. Conviction: ${this.conviction}. Hyperbole Capital is proud.`;
      setTimeout(() => this.showScreen("end"), 1800);
    } else if (this.conviction <= 0) {
      document.getElementById("screen-end-title").textContent = "Fired";
      document.getElementById("screen-end-msg").textContent = "Conviction zero. Mandatory grass touching.";
      setTimeout(() => this.showScreen("end"), 1800);
    }
  }

  advanceAfterResult() {
    this.resultEl.classList.remove("show", "win", "fail");
    this.resetSkipCodeUI();
    this.dayIndex++;
    this.loadBriefing();
  }

  canSecretSkip() {
    return this.resultEl.classList.contains("show")
      && this.resultEl.classList.contains("fail")
      && this.failCountForLevel() > 2
      && this.conviction > 0
      && this.dayIndex < LEVELS.length - 1;
  }

  resetSkipCodeUI() {
    if (this.skipGate) {
      this.skipGate.value = "";
      this.skipGate.disabled = true;
      this.skipGate.blur();
    }
    if (this.skipCodePanel) this.skipCodePanel.hidden = true;
    this._codeBuf = "";
  }

  updateSkipCodeUI(showOnFail) {
    const visible = showOnFail && this.canSecretSkip();
    if (this.skipCodePanel) this.skipCodePanel.hidden = !visible;
    if (this.skipGate) {
      this.skipGate.value = "";
      this.skipGate.disabled = !visible;
      if (!visible) this.skipGate.blur();
    }
    this._codeBuf = "";
  }

  rejectSkipCodeInput() {
    if (!this.skipGate) return;
    this.skipGate.classList.add("shake");
    setTimeout(() => this.skipGate.classList.remove("shake"), 140);
    this.skipGate.value = "";
    this.skipGate.focus({ preventScroll: true });
  }

  submitSecretSkip() {
    if (!this.skipGate) return;
    const v = this.normalizeSecretCode(this.skipGate.value);
    if (!v) return;

    if (v === VOID_ALMIGHTY_CODE) {
      this.skipGate.value = "";
      this.activateVoidAlmighty();
      return;
    }

    if (!this.canSecretSkip()) {
      this.rejectSkipCodeInput();
      return;
    }

    if (v === SECRET_SKIP_CODE) {
      this.skipGate.value = "";
      this.skipLevelByCode();
    } else {
      this.rejectSkipCodeInput();
    }
  }

  handleSecretCode(e) {
    if (!this.canSecretSkip() || !this.skipCodePanel || this.skipCodePanel.hidden) {
      this._codeBuf = "";
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : "";
    if (!/[a-z]/.test(k)) return;
    this._codeBuf = (this._codeBuf + k).slice(-4);
    if (this._codeBuf === SECRET_SKIP_CODE) {
      this._codeBuf = "";
      e.preventDefault();
      this.skipLevelByCode();
    }
  }

  applySkip(penalty, via) {
    const day = this.dayIndex + 1;
    this.stopLevel();
    this.resultEl.classList.remove("show", "win", "fail");
    this.resetSkipCodeUI();
    this.skippedDays.add(this.dayIndex);
    this.streak = 0;
    this.conviction = Math.max(0, this.conviction - penalty);
    const msgs = via === "code"
      ? [`<strong>@InternZero</strong> day ${day} skipped`, `<strong>@HyperboleCap</strong> no questions asked`]
      : [`<strong>@InternZero</strong> paid CT tax to skip Day ${day}`, `<strong>@HyperboleCap</strong> no DD, no shame`];
    this.setCT(msgs);
    this.updateHUD();
    this.dayIndex++;

    if (this.conviction <= 0) {
      document.getElementById("screen-end-title").textContent = "Fired";
      document.getElementById("screen-end-msg").textContent = "Skipped one too many. Conviction zero.";
      this.showScreen("end");
      return;
    }
    if (this.dayIndex >= LEVELS.length) {
      document.getElementById("screen-end-title").textContent = "Survived (Barely)";
      document.getElementById("screen-end-msg").textContent = `20 days done with skips. Conviction: ${this.conviction}.`;
      this.showScreen("end");
      return;
    }
    this.loadBriefing();
  }

  skipLevelByCode() {
    this.applySkip(10, "code");
  }

  skipLevel() {
    const day = this.dayIndex + 1;
    const name = this.level?.name || `Day ${day}`;
    const tweet = this.level?.buildSkipTweet?.()
      || `stuck on Rug or Hug day ${day}. this game is actually hard @voidhl`;
    const ok = confirm(
      `Skip "${name}"?\n\nPost on X to continue (−12 conviction):\n\n"${tweet}"`
    );
    if (!ok) return;
    window.open(this.xSkipUrl(tweet), "_blank", "noopener,noreferrer");
    this.applySkip(12, "x");
  }

  resetToTitle() {
    this.stopLevel();
    this.resultEl.classList.remove("show", "win", "fail");
    document.getElementById("btn-home").textContent = "Menu";
    Effects.clear();
    this.showScreen("title");
    this.updateVoidAlmightyUI();
  }
}

document.addEventListener("DOMContentLoaded", () => { window.game = new GameEngine(); });