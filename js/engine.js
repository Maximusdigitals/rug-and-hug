const ASSET_PATH = "assets/logos/curated/";
const ACTS = ["", "THE TRENCHES", "INSTITUTIONAL COSPLAY", "SMART MONEY THEATER", "CT FINAL BOSS"];
const SECRET_SKIP_CODE = "jeff";
const VOID_ALMIGHTY_CODE = "void almighty";

class GameEngine {
  constructor() {
    this.conviction = 100;
    this.dayIndex = 0;
    this.streak = 0;
    this.mode = "career";
    this.dailyLevelId = null;
    this.saveData = Storage.load();
    this._lastAct = 0;
    this.images = {};
    this.level = null;
    this.running = false;
    this.elapsed = 0;
    this.duration = 20;
    this.lastTs = 0;
    this._accum = 0;
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

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
    AudioFX.init();
    this.bindEvents();
    this.preloadImages();
    this.resize();
    this.updateTitleUI();
    this.registerSW();
    Progression.applyActTheme(1);
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

  haptic(ms = 12) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  persist() {
    this.saveData.run = Storage.snapshotRun(this);
    Storage.save(this.saveData);
  }

  registerSW() {
    if (!("serviceWorker" in navigator)) return;
    const base = location.pathname.replace(/\/[^/]*$/, "/");
    navigator.serviceWorker.register(base + "sw.js").catch(() => {});
  }

  updateTitleUI() {
    const cont = document.getElementById("btn-continue");
    const dailyBtn = document.getElementById("btn-daily");
    const dailyLbl = document.getElementById("daily-label");
    const rankEl = document.getElementById("title-rank");
    const stats = this.saveData.stats;
    const rank = Progression.rankFor(stats);

    if (cont) cont.style.display = Storage.hasRun(this.saveData) ? "inline-flex" : "none";
    if (rankEl) rankEl.textContent = `${rank.emoji} ${rank.title} · ${stats.clears} clears`;

    const d = Daily.levelForToday(LEVELS.length);
    if (dailyLbl) {
      dailyLbl.textContent = Daily.isWonToday(this.saveData)
        ? "Daily ✓"
        : `Daily: Day ${d.levelId}`;
    }
    if (dailyBtn) dailyBtn.classList.toggle("done", Daily.isWonToday(this.saveData));

    const muteBtn = document.getElementById("btn-mute");
    if (muteBtn) muteBtn.textContent = AudioFX.muted ? "🔇" : "🔊";
  }

  showStats() {
    const modal = document.getElementById("modal-stats");
    if (!modal) return;
    const s = this.saveData.stats;
    const rank = Progression.rankFor(s);
    const badges = Progression.badgeLabels(this.saveData.badges || []);
    document.getElementById("stats-rank").textContent = `${rank.emoji} ${rank.title}`;
    document.getElementById("stats-body").innerHTML = `
      <div class="stat-row"><span>Clears</span><strong>${s.clears}</strong></div>
      <div class="stat-row"><span>Best streak</span><strong>${s.bestStreak}</strong></div>
      <div class="stat-row"><span>Best conviction</span><strong>${s.bestConviction}</strong></div>
      <div class="stat-row"><span>Days cleared</span><strong>${s.daysCleared}</strong></div>
      <div class="stat-row"><span>Skips</span><strong>${s.skips}</strong></div>
      <div class="stat-row"><span>Daily wins</span><strong>${s.dailyWins || 0}</strong></div>
      <p class="stat-badges">${badges.length ? badges.join(" · ") : "No badges yet — keep grinding."}</p>`;
    modal.classList.add("show");
  }

  hideStats() {
    document.getElementById("modal-stats")?.classList.remove("show");
  }

  bindEvents() {
    const unlock = () => AudioFX.unlock();
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    document.getElementById("btn-start").onclick = () => { unlock(); this.startRun(); };
    const btnCont = document.getElementById("btn-continue");
    if (btnCont) btnCont.onclick = () => { unlock(); this.continueRun(); };
    const btnDaily = document.getElementById("btn-daily");
    if (btnDaily) btnDaily.onclick = () => { unlock(); this.startDaily(); };
    const btnStats = document.getElementById("btn-stats");
    if (btnStats) btnStats.onclick = () => this.showStats();
    const btnStatsClose = document.getElementById("btn-stats-close");
    if (btnStatsClose) btnStatsClose.onclick = () => this.hideStats();
    const btnShare = document.getElementById("btn-share");
    if (btnShare) btnShare.onclick = () => ShareCard.share(this, this.saveData);
    const btnShareResult = document.getElementById("btn-share-result");
    if (btnShareResult) btnShareResult.onclick = () => ShareCard.share(this, this.saveData);
    const btnMute = document.getElementById("btn-mute");
    if (btnMute) btnMute.onclick = () => { AudioFX.toggleMute(); this.updateTitleUI(); };
    const btnInstall = document.getElementById("btn-install");
    if (btnInstall) btnInstall.onclick = () => this._installPrompt?.prompt();
    const btnTutorialOk = document.getElementById("btn-tutorial-ok");
    if (btnTutorialOk) btnTutorialOk.onclick = () => this.dismissTutorial();

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
    if (name === "title") this.updateTitleUI();
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
    this.mode = "career";
    this.dailyLevelId = null;
    this.conviction = 100;
    this.dayIndex = 0;
    this.streak = 0;
    this.failCounts = {};
    this.skippedDays = new Set();
    this._lastAct = 0;
    this.saveData.stats.runs = (this.saveData.stats.runs || 0) + 1;
    this.persist();
    this.setCT(["<strong>@HyperboleCap</strong> intern #0 starts today", "<strong>@CT</strong> no DD policy 🫡"]);
    this.loadBriefing();
  }

  continueRun() {
    const run = this.saveData.run;
    if (!Storage.hasRun(run)) return this.startRun();
    this.mode = run.mode || "career";
    this.dailyLevelId = run.dailyLevelId;
    Storage.restoreRun(this, run);
    this.setCT(["<strong>@InternZero</strong> back from lunch", "<strong>@CT</strong> resume timeline 🫡"]);
    this.loadBriefing();
  }

  startDaily() {
    if (Daily.isWonToday(this.saveData)) {
      this.setCT(["<strong>@voidhl</strong> daily already cleared", "<strong>@CT</strong> come back tomorrow"]);
      return;
    }
    const d = Daily.levelForToday(LEVELS.length);
    this.mode = "daily";
    this.dailyLevelId = d.levelId;
    this.conviction = 100;
    this.dayIndex = d.index;
    this.streak = 0;
    this.failCounts = {};
    this.skippedDays = new Set();
    this._lastAct = 0;
    this.setCT([`<strong>@voidhl</strong> daily challenge: day ${d.levelId}`, "<strong>@CT</strong> one shot only"]);
    this.loadBriefing();
  }

  failCountForLevel() {
    return this.failCounts[this.level?.id] || 0;
  }

  xSkipUrl(text) {
    const msg = text
      || `stuck on Rug or Hug day ${this.dayIndex + 1}. this game is actually hard @voidhl https://maximusdigitals.github.io/rug-and-hug/`;
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
    const act = Progression.actForDay(this.dayIndex);
    const isBoss = Progression.isBossDay(this.dayIndex);
    const bossEl = document.getElementById("boss-banner");
    if (bossEl) {
      bossEl.hidden = !isBoss;
      if (isBoss) {
        bossEl.textContent = `⚔ BOSS DAY ${this.dayIndex + 1}`;
        AudioFX.boss();
      }
    }

    if (act !== this._lastAct) {
      Progression.applyActTheme(act);
      if (this._lastAct) {
        document.body.classList.add("act-transition");
        AudioFX.act();
        setTimeout(() => document.body.classList.remove("act-transition"), 900);
      }
      this._lastAct = act;
    }

    const dayLabel = this.mode === "daily" ? `Daily · Day ${this.dayIndex + 1}` : `Day ${this.dayIndex + 1} · Act ${act}`;
    document.getElementById("briefing-day").textContent = dayLabel;
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
    this.persist();
    this.showScreen("briefing");
  }

  maybeShowTutorial() {
    if (this.saveData.settings.tutorialSeen || this.dayIndex > 1) return;
    const t = document.getElementById("tutorial-overlay");
    if (!t) return;
    const copy = this.dayIndex === 0
      ? "Tap when orbs hit the gold zone. Miss twice and you're rekt. Conviction = your job security."
      : "Green = gem, red ring = rug. Conviction drops −10 per fail. Streak 3+ for bonus conviction.";
    document.getElementById("tutorial-text").textContent = copy;
    t.classList.add("show");
  }

  dismissTutorial() {
    document.getElementById("tutorial-overlay")?.classList.remove("show");
    this.saveData.settings.tutorialSeen = true;
    Storage.save(this.saveData);
    this.beginLevelAfterCountdown();
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
    this.countdown(this.lowPower ? 1 : 2, () => {
      if (!this.saveData.settings.tutorialSeen && this.dayIndex <= 1) this.maybeShowTutorial();
      else this.beginLevelAfterCountdown();
    });
  }

  beginLevelAfterCountdown() {
    this.beginLevel();
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
      if (v > 0) AudioFX.tick();
      else AudioFX.go();
      const ms = this.lowPower ? 280 : 360;
      if (v === 0) setTimeout(() => { this.countdownEl.classList.remove("show"); cb(); }, ms);
      else setTimeout(() => tick(v - 1), ms);
    };
    tick(n);
  }

  beginLevel() {
    this.running = true;
    this.elapsed = 0;
    this._accum = 0;
    const base = this.level.duration || 20;
    const mod = Progression.bossModifier(this.level, this.dayIndex);
    this.duration = Math.round(base * mod);
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
    let frame = Math.min(0.05, (now - this.lastTs) / 1000);
    this.lastTs = now;
    this._accum += frame;
    const step = 1 / 60;
    while (this._accum >= step) {
      this._accum -= step;
      this.elapsed += step;
      Effects.update(step);
      if (this.level.update) this.level.update(step, this);
    }
    const sec = Math.ceil(Math.max(0, this.duration - this.elapsed));
    if (sec !== this._timerSec) {
      this._timerSec = sec;
      if (this.timerEl) this.timerEl.textContent = sec;
    }
    this.draw(frame);
    this.raf = requestAnimationFrame(t => this.loop(t));
  }

  draw(interp = 0) {
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
    if (!PERF_LITE && this.level && !this.level.isDialogue) {
      const ctx = this.ctx;
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.72);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
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
    Effects.burst(x, y, color, this.lowPower ? 6 : 10);
    Effects.ripple(x, y, color);
    if (text) {
      Effects.floatText(x, y - 10, text, color);
      AudioFX.hit();
      this.haptic(8);
    } else {
      AudioFX.tap();
      this.haptic(4);
    }
  }

  flash(c) { this.flashColor = c; }

  shake() {
    this.canvas.classList.add("shake");
    this.playArea?.classList.add("shake");
    AudioFX.miss();
    this.haptic([12, 30, 12]);
    setTimeout(() => {
      this.canvas.classList.remove("shake");
      this.playArea?.classList.remove("shake");
    }, 160);
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
    Progression.recordLevelResult(this.saveData, true, this);
    if (this.mode === "daily") Daily.markWon(this.saveData, this.level.id);
    this.persist();
    AudioFX.win();
    this.haptic([10, 20, 10]);
    this.showResult(true);
  }

  loseLevel() {
    if (!this.running) return;
    this.stopLevel();
    this.streak = 0;
    this.conviction = Math.max(0, this.conviction - 10);
    Progression.recordLevelResult(this.saveData, false, this);
    this.persist();
    AudioFX.lose();
    this.haptic(40);
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

    const careerLast = this.mode === "career" && this.dayIndex >= LEVELS.length - 1;
    const dailyDone = this.mode === "daily" && won;
    const runOver = this.conviction <= 0 || careerLast && won || dailyDone;

    document.getElementById("btn-next").style.display = won && this.conviction > 0 && !careerLast && this.mode === "career" ? "inline-flex" : "none";
    document.getElementById("btn-retry").style.display = !won && this.conviction > 0 ? "inline-flex" : "none";
    document.getElementById("btn-skip").style.display = !won && this.conviction > 0 && !careerLast && this.mode === "career" ? "inline-flex" : "none";
    document.getElementById("btn-home").style.display = runOver ? "inline-flex" : "none";
    const btnShareResult = document.getElementById("btn-share-result");
    if (btnShareResult) btnShareResult.style.display = won ? "inline-flex" : "none";

    this.updateSkipCodeUI(!won);
    this.updateVoidAlmightyUI();

    if (runOver && won) {
      const end = Progression.endingFor(this);
      document.getElementById("btn-home").textContent = "Play Again";
      document.getElementById("screen-end-icon").textContent = end.icon;
      document.getElementById("screen-end-title").textContent = end.title;
      document.getElementById("screen-end-msg").textContent = end.msg;
      this.saveData.run = null;
      Storage.save(this.saveData);
      setTimeout(() => this.showScreen("end"), 1800);
    } else if (this.conviction <= 0) {
      const end = Progression.endingFor(this);
      document.getElementById("screen-end-icon").textContent = end.icon;
      document.getElementById("screen-end-title").textContent = end.title;
      document.getElementById("screen-end-msg").textContent = end.msg;
      this.saveData.run = null;
      Storage.save(this.saveData);
      setTimeout(() => this.showScreen("end"), 1800);
    }
  }

  advanceAfterResult() {
    this.resultEl.classList.remove("show", "win", "fail");
    this.resetSkipCodeUI();
    this.dayIndex++;
    this.persist();
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
    if (this.saveData?.stats) {
      this.saveData.stats.skips = this.skippedDays.size;
      Storage.save(this.saveData);
    }
    const msgs = via === "code"
      ? [`<strong>@InternZero</strong> day ${day} skipped`, `<strong>@HyperboleCap</strong> no questions asked`]
      : [`<strong>@InternZero</strong> posted on X to skip Day ${day}`, `<strong>@HyperboleCap</strong> free CT tax 🫡`];
    this.setCT(msgs);
    this.updateHUD();
    this.persist();
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
      || `stuck on Rug or Hug day ${day}. this game is actually hard @voidhl https://maximusdigitals.github.io/rug-and-hug/`;
    const ok = confirm(
      `Skip "${name}"?\n\nPost on X to continue (free skip):\n\n"${tweet}"`
    );
    if (!ok) return;

    const url = this.xSkipUrl(tweet);
    // Apply skip BEFORE opening X — mobile often navigates away before post-open code runs
    this.applySkip(0, "x");

    setTimeout(() => {
      const tab = window.open(url, "_blank", "noopener,noreferrer");
      if (!tab) window.location.assign(url);
    }, 80);
  }

  resetToTitle() {
    this.stopLevel();
    this.resultEl.classList.remove("show", "win", "fail");
    document.getElementById("btn-home").textContent = "Menu";
    this.mode = "career";
    this.saveData.run = null;
    Storage.save(this.saveData);
    Effects.clear();
    this.showScreen("title");
    this.updateVoidAlmightyUI();
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.game._installPrompt = e;
  const bar = document.getElementById("install-banner");
  if (bar) bar.hidden = false;
});

document.addEventListener("DOMContentLoaded", () => {
  window.game = new GameEngine();
  requestAnimationFrame(() => document.body.classList.add("ui-ready"));
});