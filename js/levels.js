/* 20 levels — mobile-first, tuned difficulty, modern canvas visuals */

function goalBrief(win, how, lose) {
  const loseLine = lose
    ? `<p class="goal-line goal-lose"><span class="goal-tag">LOSE IF</span> ${lose}</p>`
    : "";
  return `<p class="goal-line goal-win"><span class="goal-tag">WIN</span> ${win}</p>`
    + `<p class="goal-line goal-how"><span class="goal-tag">HOW</span> ${how}</p>`
    + loseLine;
}

const LEVELS = [
  // ── ACT I: THE TRENCHES ──────────────────────────────────────
  {
    id: 1, name: "Gas Fee Seance",
    boss: goalBrief("Get 8 perfect taps", "Tap when the orb turns gold in the center", "Tap too early or too late — max 2 misses"),
    instruction: "WIN: 8 gold taps · max 2 misses", mobileInstruction: "Tap when gold",
    logos: ["ethereum.png", "bitcoin.png"],
    accent: "#627eea",
    win: "Tx confirmed. Only cost half your portfolio.", fail: "Tx failed. Gas won.",
    ctWin: ["@ETHGasBot: $4k to send $12", "@InternZero: bullish?"], ctFail: ["@MEVBot: thanks for the tip", "@VitalikFan99: skill issue"],
    duration: 24, showTapButton: true,
    init(e) {
      this.need = 8; this.hits = 0; this.misses = 0; this.maxMiss = 2; this.win = 0.27;
      this.beats = Array.from({ length: this.need }, (_, i) => ({ t: 0.95 + i * 1.05, done: false, miss: false }));
    },
    update(dt, e) {
      this.beats.forEach(b => { if (!b.done && !b.miss && e.elapsed > b.t + this.win) { b.miss = true; this.misses++; } });
      if (this.hits >= this.need) e.winLevel();
      else if (this.misses >= this.maxMiss || (e.elapsed >= e.duration && this.hits < this.need)) e.loseLevel();
    },
    tap(e) {
      const b = this.beats.find(b => !b.done && !b.miss && Math.abs(e.elapsed - b.t) < this.win);
      if (b) { b.done = true; this.hits++; e.juice(e.displayWidth / 2, e.displayHeight * 0.55, "#3fb950", "+1"); }
      else if (this.misses < this.maxMiss) { this.misses++; e.juice(e.displayWidth / 2, e.displayHeight * 0.55, "#f85149"); }
    },
    onKey(e, k) { if ((k === " " || k === "Space") && e.keyDown) this.tap(e); },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0c1018");
      bg.addColorStop(1, "#060810");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const zy = h * 0.55;
      drawGlow(ctx, w / 2, zy, 80, "#d29922");
      ctx.strokeStyle = "#d2992244"; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(24, zy); ctx.lineTo(w - 24, zy); ctx.stroke(); ctx.setLineDash([]);
      drawLogo(ctx, e, "ethereum.png", w / 2, h * 0.22, e.mobile ? 56 : 48);
      this.beats.forEach(b => {
        const x = 40 + ((e.elapsed - (b.t - 1.35)) / 1.45) * (w - 80);
        if (x < 30 || x > w - 30) return;
        const near = Math.abs(e.elapsed - b.t) < this.win;
        const r = e.mobile ? 24 : 18;
        drawGlow(ctx, x, zy, near ? 40 : 20, near ? "#d29922" : b.done ? "#3fb950" : b.miss ? "#f85149" : "#627eea");
        ctx.fillStyle = b.done ? "#3fb950" : b.miss ? "#f85149" : near ? "#d29922" : "#627eea";
        ctx.beginPath(); ctx.arc(x, zy, r, 0, Math.PI * 2); ctx.fill();
      });
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 2, name: "Solana Trench Foot",
    boss: goalBrief("Collect 9 green gems", "Tap falling coins with green rings", "Never tap red-ring RUG coins — 2 rugs ends the run"),
    instruction: "WIN: 9 green gems · skip red", mobileInstruction: "Green yes · red no",
    logos: ["solana.png", "bonk.png", "wif.png", "pump-fun.png"],
    accent: "#14f195",
    win: "Trenches cleared. Dignity optional.", fail: "Too many rugs.",
    ctWin: ["@TrenchKing: W", "@pumpdotfun: soldier"], ctFail: ["@ZachXBT: hm", "@RugWatch: L"],
    duration: 28,
    init(e) {
      this.items = []; this.gems = 0; this.rugs = 0; this.need = 9; this.maxRugs = 2;
      this.spawn = 0; this.gemLogos = ["bonk.png", "wif.png", "jupiter.png", "solana.png"];
      this.hitR = e.mobile ? 44 : 36;
    },
    update(dt, e) {
      this.spawn += dt;
      if (this.spawn > 0.4) {
        this.spawn = 0;
        const rug = Math.random() < 0.42;
        this.items.push({ x: 44 + Math.random() * (e.displayWidth - 88), y: -40, rug,
          logo: rug ? "pump-fun.png" : this.gemLogos[Math.floor(Math.random() * this.gemLogos.length)],
          speed: 118 + Math.random() * 55, alive: true });
      }
      this.items.forEach(it => { it.y += it.speed * dt; });
      this.items = this.items.filter(it => it.y < h(e) + 50 && it.alive);
      if (this.gems >= this.need) e.winLevel();
      else if (this.rugs > this.maxRugs || (e.elapsed >= e.duration && this.gems < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const hit = this.items.find(it => it.alive && Math.hypot(it.x - x, it.y - y) < this.hitR);
      if (!hit) return;
      hit.alive = false;
      if (hit.rug) { this.rugs++; e.juice(x, y, "#f85149"); e.shake(); }
      else { this.gems++; e.juice(x, y, "#14f195", "+1"); }
    },
    draw(ctx, e, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0b1020"); g.addColorStop(1, "#0f1a14");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const sz = e.mobile ? 34 : 28;
      this.items.forEach(it => {
        const col = it.rug ? "#f85149" : "#14f195";
        drawGlow(ctx, it.x, it.y, 36, col);
        drawLogo(ctx, e, it.logo, it.x, it.y, sz * 1.6);
        ctx.strokeStyle = col; ctx.lineWidth = it.rug ? 3 : 2;
        ctx.beginPath(); ctx.arc(it.x, it.y, sz + 2, 0, Math.PI * 2); ctx.stroke();
      });
      e.drawProgress(this.gems, this.need, w, h);
    },
  },
  {
    id: 3, name: "BTC Range Prison",
    boss: goalBrief("Survive until the timer hits zero", "Drag the orange dot and keep it in the safe zone", "Touch the red walls — they slowly close in"),
    instruction: "WIN: survive the timer · stay centered", mobileInstruction: "Keep dot centered",
    logos: ["bitcoin.png", "blackrock-ibit.png"],
    accent: "#f7931a",
    win: "You survived boredom. Institutional.", fail: "You broke the range.",
    ctWin: ["@BlackRock: steady", "@BTC: range is a feature"], ctFail: ["@TraderJoe: broke support", "@ETFflow: out"],
    duration: 22,
    init(e) {
      this.x = 0.5; this.vx = 0; this.walls = 0.33; this.survive = 22; this.done = false;
    },
    update(dt, e) {
      this.walls = Math.max(0.11, 0.33 - e.elapsed * 0.016);
      this.vx += (Math.random() - 0.5) * dt * 1.35;
      this.vx *= 0.95;
      if (e.pointer.down) this.vx += (e.pointer.x / e.displayWidth - this.x) * 2.8 * dt;
      this.x += this.vx * dt;
      if (this.x < 0.5 - this.walls || this.x > 0.5 + this.walls) e.loseLevel();
      if (e.elapsed >= this.survive) e.winLevel();
    },
    onTapAt(e, x) { this.x += (x / e.displayWidth - this.x) * 0.35; },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#0a0c10"; ctx.fillRect(0, 0, w, h);
      const cy = h * 0.5; const wl = (0.5 - this.walls) * w; const wr = (0.5 + this.walls) * w;
      ctx.fillStyle = "#f8514922"; ctx.fillRect(0, cy - 40, wl, 80); ctx.fillRect(wr, cy - 40, w - wr, 80);
      ctx.strokeStyle = "#f85149"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wl, cy - 50); ctx.lineTo(wl, cy + 50); ctx.moveTo(wr, cy - 50); ctx.lineTo(wr, cy + 50); ctx.stroke();
      drawLogo(ctx, e, "bitcoin.png", w / 2, h * 0.18, 44);
      drawGlow(ctx, this.x * w, cy, 36, "#f7931a");
      ctx.fillStyle = "#f7931a"; ctx.beginPath(); ctx.arc(this.x * w, cy, e.mobile ? 16 : 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8b949e"; ctx.font = "13px system-ui"; ctx.fillText(`Survive ${Math.max(0, Math.ceil(this.survive - e.elapsed))}s`, 16, h - 16);
    },
  },
  {
    id: 4, name: "Fear & Greed Exorcism",
    boss: goalBrief("Tap 8 times in the FEAR zone", "Tap only when the slider is green on the left", "Don't tap during red GREED — max 2 wrong taps"),
    instruction: "WIN: 8 FEAR taps · skip greed", mobileInstruction: "Green zone only",
    logos: ["fear-greed.png"],
    accent: "#16c784",
    win: "Fear mastered. Buy signal?", fail: "You aped at peak greed.",
    ctWin: ["@FearGreed: 34", "@Contrarian: W"], ctFail: ["@TopSignal: gg", "@Macro: oof"],
    duration: 22, showTapButton: true,
    init(e) { this.hits = 0; this.need = 8; this.miss = 0; this.maxMiss = 2; this.phase = 0; },
    update(dt, e) {
      this.phase += dt * 2.35;
      const v = (Math.sin(this.phase) + 1) / 2;
      this.val = v;
      this.inFear = v < 0.28;
      this.inGreed = v > 0.64;
    },
    tap(e) {
      if (this.inFear) { this.hits++; e.juice(e.displayWidth / 2, e.displayHeight * 0.45, "#3fb950", "FEAR"); if (this.hits >= this.need) e.winLevel(); }
      else if (this.inGreed) { this.miss++; e.juice(e.displayWidth / 2, e.displayHeight * 0.45, "#f85149"); if (this.miss >= this.maxMiss) e.loseLevel(); }
      else { this.miss++; if (this.miss >= this.maxMiss) e.loseLevel(); }
    },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#080b12"; ctx.fillRect(0, 0, w, h);
      const barW = w * 0.75; const bx = (w - barW) / 2; const by = h * 0.4;
      ctx.fillStyle = "#21262d"; ctx.roundRect(bx, by, barW, 28, 14); ctx.fill();
      ctx.fillStyle = "#3fb95044"; ctx.fillRect(bx, by, barW * 0.38, 28);
      ctx.fillStyle = "#f8514944"; ctx.fillRect(bx + barW * 0.72, by, barW * 0.28, 28);
      const px = bx + this.val * barW;
      drawGlow(ctx, px, by + 14, 30, this.inFear ? "#3fb950" : this.inGreed ? "#f85149" : "#d29922");
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, by + 14, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8b949e"; ctx.font = "13px system-ui"; ctx.textAlign = "center";
      ctx.fillText(this.inFear ? "TAP NOW!" : this.inGreed ? "DON'T TAP" : "Wait...", w / 2, by + 60);
      ctx.textAlign = "left";
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 5, name: "Meme Whack-A-Rug",
    boss: goalBrief("Whack 10 green memecoins", "Tap coins when they pop out of the holes", "Never tap red RUG coins — miss 2 green gems and you're out"),
    instruction: "WIN: 10 green whacks · skip RUG", mobileInstruction: "Green yes · red no",
    logos: ["bonk.png", "wif.png", "pump-fun.png"],
    accent: "#9945ff",
    win: "Trenches cleared. Finger speed: institutional.", fail: "You whacked a rug.",
    ctWin: ["@Bonk: respectable", "@TrenchKing: W"], ctFail: ["@Pump: lmao", "@RugWatch: skill issue"],
    duration: 28,
    init(e) {
      this.holes = [];
      this.whacked = 0; this.need = 10;
      this.rugTaps = 0; this.maxRugs = 2;
      this.missed = 0; this.maxMissed = 2;
      this.spawnCd = 0.35;
      const cols = 2; const rows = 2;
      const padX = e.mobile ? 56 : 72;
      const padY = e.mobile ? 90 : 110;
      const gw = (e.displayWidth - padX * 2) / cols;
      const gh = (e.displayHeight - padY * 2 - 40) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.holes.push({
            x: padX + gw * c + gw / 2,
            y: padY + gh * r + gh / 2,
            pop: null,
          });
        }
      }
      this.gemLogos = ["bonk.png", "wif.png", "jupiter.png"];
      this.mobile = e.mobile;
    },
    spawnPop() {
      const free = this.holes.filter(h => !h.pop);
      if (!free.length) return;
      const hole = free[Math.floor(Math.random() * free.length)];
      const rug = Math.random() < 0.38;
      hole.pop = {
        rug,
        logo: rug ? "pump-fun.png" : this.gemLogos[Math.floor(Math.random() * this.gemLogos.length)],
        t: 0,
        life: (this.mobile ? 1.05 : 0.95) + Math.random() * 0.35,
        scale: 0,
      };
    },
    update(dt, e) {
      this.spawnCd -= dt;
      if (this.spawnCd <= 0) {
        this.spawnCd = 0.42 + Math.random() * 0.38;
        this.spawnPop();
      }
      this.holes.forEach(hole => {
        if (!hole.pop) return;
        hole.pop.t += dt;
        hole.pop.scale = Math.min(1, hole.pop.scale + dt * 5);
        if (hole.pop.t >= hole.pop.life) {
          if (!hole.pop.rug) this.missed++;
          hole.pop = null;
        }
      });
      if (this.whacked >= this.need) e.winLevel();
      else if (this.rugTaps > this.maxRugs || this.missed > this.maxMissed
        || (e.elapsed >= e.duration && this.whacked < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const hitR = e.mobile ? 52 : 44;
      const hole = this.holes.find(h => h.pop && Math.hypot(h.x - x, h.y - y) < hitR);
      if (!hole) return;
      const pop = hole.pop;
      hole.pop = null;
      if (pop.rug) {
        this.rugTaps++;
        e.juice(x, y, "#f85149", "RUG");
        e.shake();
      } else {
        this.whacked++;
        e.juice(x, y, "#3fb950", "+1");
      }
    },
    draw(ctx, e, w, h) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#120a1a");
      bg.addColorStop(1, "#08060e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      this.holes.forEach(hole => {
        drawGlow(ctx, hole.x, hole.y, 36, "#9945ff33");
        ctx.fillStyle = "#1a1228";
        ctx.beginPath();
        ctx.ellipse(hole.x, hole.y + 14, e.mobile ? 44 : 38, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        if (hole.pop) {
          const p = hole.pop;
          const s = (e.mobile ? 46 : 40) * p.scale;
          const col = p.rug ? "#f85149" : "#3fb950";
          drawGlow(ctx, hole.x, hole.y - 8, s, col);
          drawLogo(ctx, e, p.logo, hole.x, hole.y - 8, s);
          if (p.rug) {
            ctx.strokeStyle = "#f85149";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(hole.x, hole.y - 8, s * 0.65, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#f85149";
            ctx.font = "bold 10px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("RUG", hole.x, hole.y - 8 + s * 0.45);
          }
        }
      });
      ctx.textAlign = "left";
      e.drawProgress(this.whacked, this.need, w, h);
    },
  },

  // ── ACT II: INSTITUTIONAL COSPLAY ────────────────────────────
  {
    id: 6, name: "ETF Funeral Director",
    boss: goalBrief("Seat 8 ghosts before they fade", "Tap the floating ghost — not the pew below", "Let 2 ghosts fade away"),
    instruction: "WIN: seat 8 ghosts · tap fast", mobileInstruction: "Tap ghosts fast",
    logos: ["bitcoin.png", "blackrock-ibit.png", "coinbase.png"],
    accent: "#627eea",
    win: "Outflows paused. Miraculously.", fail: "They left for Hyperliquid.",
    ctWin: ["@ETF: inflows?", "@Larry: maybe"], ctFail: ["@FalconX: rotated out", "@IBIT: bye"],
    duration: 22,
    init(e) {
      this.seated = 0; this.need = 8; this.miss = 0; this.maxMiss = 2;
      this.spawn = 0.4; this.ghosts = [];
      this.seats = [0.17, 0.39, 0.61, 0.83].map(x => ({ x, busy: false, cooldown: 0 }));
      this.hitR = e.mobile ? 52 : 44;
      this.rowY = 0.48;
    },
    update(dt, e) {
      const w = e.displayWidth;
      this.seats.forEach(s => {
        if (s.cooldown > 0) {
          s.cooldown -= dt;
          if (s.cooldown <= 0) s.busy = false;
        }
      });
      this.spawn += dt;
      if (this.spawn > 0.62 && this.ghosts.length < 3) {
        const open = this.seats.filter(s => !s.busy);
        if (open.length) {
          this.spawn = 0;
          const seat = open[Math.floor(Math.random() * open.length)];
          seat.busy = true;
          const sx = seat.x * w;
          this.ghosts.push({
            seat, x: sx, y: -36,
            targetY: h(e) * this.rowY,
            life: 0.95, t: 0,
            logo: ["blackrock-ibit.png", "coinbase.png", "bitcoin.png"][Math.floor(Math.random() * 3)],
          });
        }
      }
      this.ghosts.forEach(g => {
        g.t += dt;
        g.y += (g.targetY - g.y) * Math.min(1, dt * 9);
      });
      this.ghosts = this.ghosts.filter(g => {
        if (g.t >= g.life) {
          this.miss++;
          g.seat.busy = false;
          return false;
        }
        return true;
      });
      if (this.seated >= this.need) e.winLevel();
      else if (this.miss >= this.maxMiss || (e.elapsed >= e.duration && this.seated < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const g = this.ghosts.find(gh => Math.hypot(gh.x - x, gh.y - y) < this.hitR);
      if (!g) return;
      this.seated++;
      g.seat.cooldown = 0.75;
      this.ghosts = this.ghosts.filter(gh => gh !== g);
      e.juice(x, y, "#3fb950", "SEATED");
    },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#0a0c14"; ctx.fillRect(0, 0, w, h);
      const pewY = h * 0.66;
      this.seats.forEach(s => {
        const sx = s.x * w;
        const hot = s.cooldown > 0;
        drawCard(ctx, sx - 34, pewY, 68, 50, 10, hot ? "#1a3d2a66" : "#161b2288");
        if (hot) drawLogo(ctx, e, "bitcoin.png", sx, pewY + 25, 30);
      });
      this.ghosts.forEach(g => {
        const a = Math.max(0.35, 1 - g.t / g.life);
        ctx.globalAlpha = a;
        drawGlow(ctx, g.x, g.y, 52, "#627eea");
        drawLogo(ctx, e, g.logo, g.x, g.y, e.mobile ? 44 : 38);
        ctx.strokeStyle = "#627eea88"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(g.x, g.y, this.hitR * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      });
      e.drawProgress(this.seated, this.need, w, h);
    },
  },
  {
    id: 7, name: "Hyperliquid Baptism",
    boss: goalBrief("Dunk into PERPS 5 times", "Drag to the green PERPS pool at the bottom line and release", "Pools shuffle — OIL and PRE-IPO are wrong (1 mistake = fail)"),
    instruction: "WIN: dunk PERPS 5× · green only", mobileInstruction: "Dunk PERPS ×5",
    logos: ["hyperliquid.png", "hyperliquid-mark.svg"],
    accent: "#00d4aa",
    win: "You are collateral now.", fail: "Wrong pool. Oil longed you.",
    ctWin: ["@HYPE: W", "@HIP3: oi up"], ctFail: ["@Oil: lol", "@Macro: rekt"],
    duration: 26,
    init(e) {
      const w = e.displayWidth; const ht = e.displayHeight;
      this.player = { x: w / 2, y: ht * 0.26 };
      this.pools = [
        { label: "PERPS", ok: true, c: "#00d4aa", x: 0.2, tx: 0.2 },
        { label: "PRE-IPO", ok: false, c: "#627eea", x: 0.5, tx: 0.5 },
        { label: "OIL", ok: false, c: "#d29922", x: 0.8, tx: 0.8 },
      ];
      this.dunks = 0; this.need = 5;
      this.wrongs = 0; this.maxWrongs = 1;
      this.shuffleCd = 0.9;
      this.decoy = null; this.decoyT = 0;
      this.lock = 0; this.dunked = false;
      this.pw = e.mobile ? 50 : 40;
      this.zoneY = ht - 118;
    },
    shufflePools() {
      const xs = [0.17, 0.5, 0.83];
      for (let i = xs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [xs[i], xs[j]] = [xs[j], xs[i]];
      }
      this.pools.forEach((p, i) => { p.tx = xs[i]; });
      if (Math.random() < 0.38) {
        const wrong = this.pools.filter(p => !p.ok);
        this.decoy = wrong[Math.floor(Math.random() * wrong.length)];
        this.decoyT = 0.75;
      } else this.decoy = null;
    },
    attemptDunk(e, w, ht) {
      if (this.lock > 0 || this.dunked) return;
      const hit = this.pools.find(p => Math.abs(this.player.x - p.x * w) < this.pw);
      if (!hit) return;
      this.dunked = true;
      if (hit.ok) {
        this.dunks++;
        e.juice(this.player.x, ht - 70, "#00d4aa", `${this.dunks}/${this.need}`);
        this.lock = 0.7;
        if (this.dunks >= this.need) e.winLevel();
      } else {
        this.wrongs++;
        e.juice(this.player.x, ht - 70, "#f85149", hit.label);
        e.shake();
        this.lock = 0.55;
        if (this.wrongs > this.maxWrongs) e.loseLevel();
      }
    },
    update(dt, e) {
      const w = e.displayWidth; const ht = e.displayHeight;
      this.zoneY = ht - 118;

      if (this.lock > 0) {
        this.lock -= dt;
        this.player.y += (ht * 0.26 - this.player.y) * Math.min(1, dt * 9);
        this.player.x += (w / 2 - this.player.x) * Math.min(1, dt * 6);
        if (this.lock <= 0) this.dunked = false;
        if (this.dunks >= this.need || this.wrongs > this.maxWrongs) return;
      }

      this.shuffleCd -= dt;
      if (this.shuffleCd <= 0) {
        this.shuffleCd = 1.25 + Math.random() * 0.35;
        this.shufflePools();
      }
      this.pools.forEach(p => { p.x += (p.tx - p.x) * Math.min(1, dt * 6.5); });
      if (this.decoyT > 0) this.decoyT -= dt;
      else this.decoy = null;

      if (e.pointer.down) {
        this.player.x += (e.pointer.x - this.player.x) * 0.44;
        this.player.y += (e.pointer.y - this.player.y) * 0.44;
      }
      this.player.x = Math.max(28, Math.min(w - 28, this.player.x));
      this.player.y = Math.max(ht * 0.14, Math.min(ht - 72, this.player.y));

      if (!e.pointer.down && this.player.y >= this.zoneY - 8) this.attemptDunk(e, w, ht);
      if (this.dunks < this.need && this.wrongs <= this.maxWrongs && e.elapsed >= e.duration) e.loseLevel();
    },
    onTapAt(e, x, y) {
      if (y >= this.zoneY - 20) {
        this.player.x = x;
        this.player.y = e.displayHeight - 90;
        this.attemptDunk(e, e.displayWidth, e.displayHeight);
      }
    },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#060a09"; ctx.fillRect(0, 0, w, h);
      const pulse = 0.55 + Math.sin(e.elapsed * 4.2) * 0.22;
      const pw = this.pw + 6;
      this.pools.forEach(p => {
        const px = p.x * w;
        const fake = this.decoy === p && this.decoyT > 0;
        const glow = p.ok || fake;
        if (glow) drawGlow(ctx, px, h - 70, (p.ok ? 58 : 42) * pulse, p.ok ? "#00d4aa" : p.c);
        drawCard(ctx, px - pw, h - 112, pw * 2, 92, 14, glow ? p.c + "22" : "#161b2266", p.c + "66");
        ctx.fillStyle = p.c; ctx.font = `bold ${e.mobile ? 13 : 11}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(p.label, px, h - 70);
      });
      ctx.textAlign = "left";
      ctx.strokeStyle = "#00d4aa44"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, this.zoneY); ctx.lineTo(w - 20, this.zoneY); ctx.stroke();
      ctx.setLineDash([]);
      drawGlow(ctx, this.player.x, this.player.y, 30, "#00d4aa");
      drawLogo(ctx, e, "hyperliquid-mark.svg", this.player.x, this.player.y, e.mobile ? 38 : 34);
      e.drawProgress(this.dunks, this.need, w, h);
    },
  },
  {
    id: 8, name: "HIP-3 Possession",
    boss: goalBrief("Exorcise 7 glowing commodities", "Tap oil, gold, or silver only when they pulse/glow", "Don't tap when nothing is glowing"),
    instruction: "WIN: 7 glow taps · active only", mobileInstruction: "Tap when it glows",
    logos: ["hyperliquid.png", "usdc.png"],
    accent: "#d29922",
    win: "Exorcised. RWA perps salute you.", fail: "Commodity possessed you.",
    ctWin: ["@HIP3: $2.6B OI", "@Oil: respect"], ctFail: ["@Gold: owned", "@Silver: L"],
    duration: 22,
    init(e) { this.hits = 0; this.need = 7; this.spawn = 0; this.targets = []; this.types = ["OIL", "GOLD", "SILVER"]; this.colors = ["#d29922", "#ffd700", "#c0c0c0"]; },
    update(dt, e) {
      this.spawn += dt;
      if (this.spawn > 0.68 && this.targets.length < 3) {
        this.spawn = 0;
        const i = Math.floor(Math.random() * 3);
        this.targets.push({ x: 60 + Math.random() * (e.displayWidth - 120), y: 60 + Math.random() * (e.displayHeight - 160), type: i, life: 1.25, t: 0, active: false });
      }
      this.targets.forEach(t => { t.t += dt; if (t.t > 0.22) t.active = true; });
      this.targets = this.targets.filter(t => { if (t.t >= t.life) { if (t.active) return false; } return t.t < t.life; });
      if (this.hits >= this.need) e.winLevel();
      else if (e.elapsed >= e.duration && this.hits < this.need) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const t = this.targets.find(t => t.active && Math.hypot(t.x - x, t.y - y) < 50);
      if (t) { this.hits++; this.targets = this.targets.filter(o => o !== t); e.juice(x, y, this.colors[t.type], "EXORCISED"); }
    },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#0c0a08"; ctx.fillRect(0, 0, w, h);
      this.targets.forEach(t => {
        const col = this.colors[t.type];
        if (t.active) drawGlow(ctx, t.x, t.y, 45 + Math.sin(t.t * 8) * 10, col);
        ctx.fillStyle = col; ctx.font = `bold ${e.mobile ? 16 : 14}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(this.types[t.type], t.x, t.y);
      });
      ctx.textAlign = "left";
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 9, name: "Grandma's SEC Dodge",
    boss: goalBrief("Catch 9 blue USDC coins", "Drag Grandma's wallet left/right into the coins", "Dodge SEC letters and red scams — 2 hits = fail"),
    instruction: "WIN: catch 9 USDC · dodge SEC", mobileInstruction: "Drag · catch blue",
    logos: ["ondo.png", "usdc.png"],
    accent: "#4ecdc4",
    win: "Grandma's savings intact. Compliance baffled.", fail: "SEC got Grandma on tape.",
    ctWin: ["@Ondo: DTCC vibes", "@Grandma: cute"], ctFail: ["@SEC: hello", "@TradFi: no"],
    duration: 30,
    init(e) {
      this.wallet = { x: e.displayWidth / 2, y: e.displayHeight - (e.mobile ? 88 : 76) };
      this.items = [];
      this.caught = 0; this.need = 9;
      this.hits = 0; this.maxHits = 2;
      this.spawn = 0;
      this.pw = e.mobile ? 42 : 36;
    },
    update(dt, e) {
      const w = e.displayWidth; const ht = e.displayHeight;
      this.wallet.y = ht - (e.mobile ? 88 : 76);

      if (e.pointer.down) {
        this.wallet.x += (e.pointer.x - this.wallet.x) * Math.min(1, dt * 14);
      }
      this.wallet.x = Math.max(this.pw + 12, Math.min(w - this.pw - 12, this.wallet.x));

      this.spawn += dt;
      if (this.spawn > 0.45) {
        this.spawn = 0;
        const roll = Math.random();
        const type = roll < 0.42 ? "usdc" : roll < 0.72 ? "sec" : "scam";
        this.items.push({
          type,
          x: 36 + Math.random() * (w - 72),
          y: -36,
          speed: 105 + Math.random() * 65,
          logo: type === "usdc" ? "usdc.png" : type === "scam" ? "usdt.png" : null,
          spin: Math.random() * Math.PI * 2,
        });
      }

      this.items.forEach(it => {
        it.y += it.speed * dt;
        it.spin += dt * 3;
      });

      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        if (Math.hypot(it.x - this.wallet.x, it.y - this.wallet.y) < this.pw + 22) {
          if (it.type === "usdc") {
            this.caught++;
            e.juice(it.x, it.y, "#2775ca", "+1");
          } else {
            this.hits++;
            e.juice(it.x, it.y, "#f85149");
            e.shake();
          }
          this.items.splice(i, 1);
          continue;
        }
        if (it.y > ht + 40) this.items.splice(i, 1);
      }

      if (this.caught >= this.need) e.winLevel();
      else if (this.hits > this.maxHits || (e.elapsed >= e.duration && this.caught < this.need)) e.loseLevel();
    },
    onTapAt(e, x) {
      this.wallet.x += (x - this.wallet.x) * 0.55;
    },
    draw(ctx, e, w, h) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#081418");
      bg.addColorStop(1, "#060c10");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      this.items.forEach(it => {
        if (it.type === "sec") {
          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.rotate(it.spin);
          drawCard(ctx, -28, -18, 56, 36, 6, "#1a1020", "#f8514966");
          ctx.fillStyle = "#f85149";
          ctx.font = "bold 11px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("SEC", 0, 5);
          ctx.restore();
        } else {
          const col = it.type === "usdc" ? "#2775ca" : "#f85149";
          drawGlow(ctx, it.x, it.y, 30, col);
          drawLogo(ctx, e, it.logo, it.x, it.y, 34);
        }
      });

      drawGlow(ctx, this.wallet.x, this.wallet.y, 50, "#4ecdc4");
      drawLogo(ctx, e, "ondo.png", this.wallet.x, this.wallet.y - 10, e.mobile ? 48 : 42);
      ctx.fillStyle = "#4ecdc4";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("GRANDMA", this.wallet.x, this.wallet.y + 28);
      ctx.textAlign = "left";
      e.drawProgress(this.caught, this.need, w, h);
    },
  },
  {
    id: 10, name: "Stablecoin Trust Fall",
    boss: goalBrief("Catch 8 blue USDC coins", "Tap falling blue USDC", "Let red wobbly coins fall — tapping them hurts you (max 2)"),
    instruction: "WIN: 8 blue taps · skip red", mobileInstruction: "Blue yes · red no",
    logos: ["usdc.png", "usdt.png", "dai.png"],
    accent: "#2775ca",
    win: "Peg maintained. Trust restored.", fail: "Depeg emotional damage.",
    ctWin: ["@Circle: nice", "@USDC: stable"], ctFail: ["@USDT: oops", "@DAI: wobble"],
    duration: 26,
    init(e) { this.caught = 0; this.need = 8; this.bad = 0; this.maxBad = 2; this.spawn = 0; this.coins = []; },
    update(dt, e) {
      this.spawn += dt;
      if (this.spawn > 0.38) {
        this.spawn = 0;
        const usdc = Math.random() < 0.44;
        this.coins.push({
          x: 40 + Math.random() * (e.displayWidth - 80), y: -30, usdc,
          logo: usdc ? "usdc.png" : Math.random() > 0.5 ? "usdt.png" : "dai.png",
          speed: 122 + Math.random() * 52, wobble: Math.random() * 7,
        });
      }
      this.coins.forEach(c => { c.y += c.speed * dt; c.x += Math.sin(c.y * 0.05) * c.wobble; });
      this.coins = this.coins.filter(c => c.y < h(e) + 40);
      if (this.caught >= this.need) e.winLevel();
      else if (this.bad > this.maxBad || (e.elapsed >= e.duration && this.caught < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const c = this.coins.find(c => Math.hypot(c.x - x, c.y - y) < 44);
      if (!c) return;
      this.coins = this.coins.filter(o => o !== c);
      if (c.usdc) { this.caught++; e.juice(x, y, "#2775ca", "SAFE"); }
      else { this.bad++; e.juice(x, y, "#f85149"); e.shake(); }
    },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#080d18"; ctx.fillRect(0, 0, w, h);
      this.coins.forEach(c => {
        drawGlow(ctx, c.x, c.y, 32, c.usdc ? "#2775ca" : "#f85149");
        drawLogo(ctx, e, c.logo, c.x, c.y, 38);
      });
      e.drawProgress(this.caught, this.need, w, h);
    },
  },

  // ── ACT III: SMART MONEY THEATER ─────────────────────────────
  {
    id: 11, name: "ZEC Identity Crisis",
    boss: goalBrief("Shield 7 times when the eye appears", "Wait for 👁 then tap SHIELD", "Don't tap early or miss the eye — max 2 mistakes"),
    instruction: "WIN: 7 shields · wait for 👁", mobileInstruction: "Wait for eye → tap",
    logos: ["zcash.png", "dash.png"],
    accent: "#f4b728",
    win: "Privacy preserved. Compliance confused.", fail: "Compliance caught you.",
    ctWin: ["@ZEC: ATH vibes", "@Privacy: W"], ctFail: ["@KYC: gotcha", "@Compliance: nope"],
    duration: 22, showTapButton: true,
    init(e) { this.hits = 0; this.need = 7; this.miss = 0; this.maxMiss = 2; this.next = 0.75; this.showEye = false; this.eyeT = 0; },
    update(dt, e) {
      this.next -= dt;
      if (this.next <= 0) { this.showEye = true; this.eyeT = 0.88; this.next = 1.15 + Math.random() * 0.55; }
      if (this.showEye) { this.eyeT -= dt; if (this.eyeT <= 0) { this.showEye = false; this.miss++; if (this.miss >= this.maxMiss) e.loseLevel(); } }
      if (this.hits >= this.need) e.winLevel();
    },
    tap(e) {
      if (this.showEye) { this.hits++; this.showEye = false; e.juice(e.displayWidth / 2, e.displayHeight * 0.5, "#f4b728", "SHIELDED"); if (this.hits >= this.need) e.winLevel(); }
      else { this.miss++; if (this.miss >= this.maxMiss) e.loseLevel(); }
    },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#0a0a0c"; ctx.fillRect(0, 0, w, h);
      drawLogo(ctx, e, "zcash.png", w / 2, h * 0.38, 64);
      if (this.showEye) {
        drawGlow(ctx, w / 2, h * 0.38, 80, "#f85149");
        ctx.font = "48px system-ui"; ctx.textAlign = "center"; ctx.fillText("👁", w / 2, h * 0.38 + 16);
        ctx.fillStyle = "#f85149"; ctx.font = "bold 14px system-ui"; ctx.fillText("TAP SHIELD!", w / 2, h * 0.6);
      } else ctx.fillStyle = "#8b949e";
      ctx.textAlign = "center"; ctx.fillText("Wait for the eye...", w / 2, h * 0.6); ctx.textAlign = "left";
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 12, name: "Bot Union Bargain",
    boss: goalBrief("Accept 8 union demands on the beat", "Tap when demands hit the green ACCEPT line (same timing as Day 1)", "Too early or too late counts as a miss — max 2"),
    instruction: "WIN: 8 ACCEPT taps · on beat", mobileInstruction: "Tap when green",
    logos: ["venice-vvv.png", "tao.png", "near.png"],
    accent: "#a371f7",
    win: "Deal signed. Bot still useless.", fail: "Union walked. Wallet nuked.",
    ctWin: ["@VVV: unionized", "@AI: W"], ctFail: ["@Wallet: 0", "@Bot: bye"],
    duration: 28, showTapButton: true,
    init(e) {
      this.deals = 0; this.need = 8;
      this.misses = 0; this.maxMiss = 2;
      this.win = 0.28;
      this.demands = ["SNACKS", "GAS $", "4.20%", "FOMC OFF", "TITLE+", "L2 COVER", "EQUITY", "NAP TIME"];
      this.beats = Array.from({ length: this.need }, (_, i) => ({
        t: 0.9 + i * 1.05,
        done: false,
        miss: false,
        label: this.demands[i % this.demands.length],
      }));
    },
    update(dt, e) {
      this.beats.forEach(b => {
        if (!b.done && !b.miss && e.elapsed > b.t + this.win) {
          b.miss = true;
          this.misses++;
        }
      });
      if (this.deals >= this.need) e.winLevel();
      else if (this.misses > this.maxMiss || (e.elapsed >= e.duration && this.deals < this.need)) e.loseLevel();
    },
    tap(e) {
      const b = this.beats.find(b => !b.done && !b.miss && Math.abs(e.elapsed - b.t) < this.win);
      if (b) {
        b.done = true;
        this.deals++;
        e.juice(e.displayWidth / 2, e.displayHeight * 0.58, "#3fb950", "DEAL");
        if (this.deals >= this.need) e.winLevel();
      } else if (this.misses <= this.maxMiss) {
        this.misses++;
        e.juice(e.displayWidth / 2, e.displayHeight * 0.58, "#f85149");
        if (this.misses > this.maxMiss) e.loseLevel();
      }
    },
    onKey(e, k) { if ((k === " " || k === "Space") && e.keyDown) this.tap(e); },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#100818");
      bg.addColorStop(1, "#08060c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const zy = h * 0.58;
      drawGlow(ctx, w / 2, zy, 70, "#3fb950");
      ctx.strokeStyle = "#3fb95055";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(28, zy);
      ctx.lineTo(w - 28, zy);
      ctx.stroke();
      ctx.setLineDash([]);

      drawLogo(ctx, e, "tao.png", w * 0.2, h * 0.22, e.mobile ? 46 : 40);
      drawLogo(ctx, e, "near.png", w * 0.8, h * 0.22, e.mobile ? 46 : 40);
      ctx.fillStyle = "#a371f7";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("UNION", w * 0.2, h * 0.22 + 36);
      ctx.fillText("YOU", w * 0.8, h * 0.22 + 36);

      this.beats.forEach(b => {
        const x = 40 + ((e.elapsed - (b.t - 1.35)) / 1.45) * (w - 80);
        if (x < 34 || x > w - 34) return;
        const near = Math.abs(e.elapsed - b.t) < this.win;
        const r = e.mobile ? 26 : 20;
        const col = b.done ? "#3fb950" : b.miss ? "#f85149" : near ? "#3fb950" : "#a371f7";
        drawGlow(ctx, x, zy, near ? 38 : 18, col);
        drawCard(ctx, x - 38, zy - 18, 76, 36, 8, "#1a1028", col + "88");
        ctx.fillStyle = "#f4f4f5";
        ctx.font = "bold 10px system-ui";
        ctx.fillText(b.label, x, zy + 4);
        ctx.beginPath();
        ctx.arc(x, zy + 28, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      ctx.textAlign = "left";
      e.drawProgress(this.deals, this.need, w, h);
    },
  },
  {
    id: 13, name: "Polymarket Spread Squeeze",
    boss: goalBrief("Match the spread 8 times", "Tap when YES and NO lines snap together and the box glows green", "Don't tap while spread is wide — max 2 bad taps"),
    instruction: "WIN: 8 tight spreads · tap green", mobileInstruction: "Tap when tight",
    logos: ["polymarket-icon.png"],
    accent: "#2e5cff",
    win: "Spread married. Both sides lost money.", fail: "Liquidity divorced you.",
    ctWin: ["@Polymarket: balanced", "@YES: ok"], ctFail: ["@NO: fight", "@Odds: chaos"],
    duration: 26, showTapButton: true,
    init(e) {
      this.hits = 0; this.need = 8;
      this.misses = 0; this.maxMiss = 2;
      this.phase = 0;
      this.speed = 2.4;
      this.tight = 0.14;
      this.cooldown = 0;
    },
    update(dt, e) {
      this.phase += dt * this.speed;
      this.spread = 0.12 + (Math.sin(this.phase) + 1) * 0.38;
      this.speed = Math.min(3.6, 2.4 + e.elapsed * 0.04);
      if (this.cooldown > 0) this.cooldown -= dt;
      if (this.hits >= this.need) e.winLevel();
      else if (this.misses > this.maxMiss || (e.elapsed >= e.duration && this.hits < this.need)) e.loseLevel();
    },
    tap(e) {
      if (this.cooldown > 0) return;
      const tight = this.spread < this.tight;
      if (tight) {
        this.hits++;
        this.cooldown = 0.35;
        e.juice(e.displayWidth / 2, e.displayHeight * 0.5, "#2e5cff", "MATCHED");
        if (this.hits >= this.need) e.winLevel();
      } else {
        this.misses++;
        this.cooldown = 0.25;
        e.juice(e.displayWidth / 2, e.displayHeight * 0.5, "#f85149", "WIDE");
        e.shake();
        if (this.misses > this.maxMiss) e.loseLevel();
      }
    },
    onKey(e, k) { if ((k === " " || k === "Space") && e.keyDown) this.tap(e); },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#080c1a");
      bg.addColorStop(1, "#060810");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cy = h * 0.48;
      const gap = this.spread * h * 0.42;
      const yesY = cy - gap / 2;
      const noY = cy + gap / 2;
      const tight = this.spread < this.tight;

      drawLogo(ctx, e, "polymarket-icon.png", w / 2, h * 0.16, e.mobile ? 40 : 34);
      ctx.fillStyle = "#71717a";
      ctx.font = "11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("WEDDING MARKET", w / 2, h * 0.16 + 38);

      if (tight) drawGlow(ctx, w / 2, cy, 90, "#2e5cff");

      ctx.fillStyle = "#2e5cff33";
      ctx.fillRect(24, yesY - 28, w - 48, 56);
      ctx.fillStyle = "#f8514933";
      ctx.fillRect(24, noY - 28, w - 48, 56);

      ctx.strokeStyle = tight ? "#3fb950" : "#30363d";
      ctx.lineWidth = tight ? 3 : 1;
      ctx.setLineDash(tight ? [] : [6, 6]);
      ctx.strokeRect(w * 0.12, cy - 36, w * 0.76, 72);
      ctx.setLineDash([]);

      ctx.fillStyle = "#2e5cff";
      ctx.font = "bold 15px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`YES ${Math.round((0.5 - this.spread / 2) * 100)}¢`, 32, yesY + 5);
      ctx.fillStyle = "#f85149";
      ctx.textAlign = "right";
      ctx.fillText(`NO ${Math.round((0.5 + this.spread / 2) * 100)}¢`, w - 32, noY + 5);

      ctx.strokeStyle = "#2e5cff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(32, yesY);
      ctx.lineTo(w - 32, yesY);
      ctx.stroke();
      ctx.strokeStyle = "#f85149";
      ctx.beginPath();
      ctx.moveTo(32, noY);
      ctx.lineTo(w - 32, noY);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = tight ? "#3fb950" : "#d29922";
      ctx.font = `bold ${e.mobile ? 18 : 15}px system-ui`;
      ctx.fillText(tight ? "TAP — SPREAD TIGHT!" : "Wait for spread to close...", w / 2, cy + 72);

      ctx.font = "28px system-ui";
      ctx.fillText("💒", w / 2, cy - 4);

      ctx.textAlign = "left";
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 14, name: "Proof of Vibes",
    boss: goalBrief("Rate 7 vibes as bullish", "Tap only when VC screams BUY and 🚀 appears", "Hands off on 'hard pass' — max 2 wrong taps"),
    instruction: "WIN: 7 BUY taps · 🚀 only", mobileInstruction: "Rocket on BUY only",
    logos: ["solana.png", "hyperliquid.png", "ondo.png"],
    accent: "#9945ff",
    win: "Vibes validated. Due diligence skipped.", fail: "You rated a rug as bullish.",
    ctWin: ["@VC: funded", "@Vibes: W"], ctFail: ["@DD: none", "@Rug: thanks"],
    duration: 22,
    init(e) { this.hits = 0; this.need = 7; this.miss = 0; this.maxMiss = 2; this.state = "wait"; this.timer = 0.55; },
    update(dt, e) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = Math.random() < 0.48 ? "buy" : "pass";
        this.timer = this.state === "buy" ? 0.62 : 0.95;
      }
    },
    tap(e) {
      if (this.state === "buy") { this.hits++; e.juice(e.displayWidth / 2, e.displayHeight * 0.45, "#3fb950", "🚀"); if (this.hits >= this.need) e.winLevel(); this.state = "wait"; this.timer = 1; }
      else if (this.state === "pass") { this.miss++; e.juice(e.displayWidth / 2, e.displayHeight * 0.45, "#f85149"); if (this.miss >= this.maxMiss) e.loseLevel(); }
    },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#0b0814"; ctx.fillRect(0, 0, w, h);
      const msg = this.state === "buy" ? "VC: BUY!!!" : this.state === "pass" ? "VC: hard pass" : "Wait...";
      const col = this.state === "buy" ? "#3fb950" : this.state === "pass" ? "#8b949e" : "#d29922";
      drawGlow(ctx, w / 2, h * 0.42, 60, col);
      ctx.fillStyle = col; ctx.font = `bold ${e.mobile ? 22 : 18}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(msg, w / 2, h * 0.42);
      if (this.state === "buy") ctx.font = "56px system-ui", ctx.fillText("🚀", w / 2, h * 0.58);
      ctx.textAlign = "left";
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 15, name: "Pre-IPO Astronaut",
    boss: goalBrief("Fly through 6 gaps", "Tap to boost up and steer through holes in the red walls", "Hit a red wall = instant fail"),
    instruction: "WIN: pass 6 gaps · dodge walls", mobileInstruction: "Tap · dodge walls",
    logos: ["hyperliquid.png"],
    accent: "#627eea",
    win: "Pre-IPO moon mission complete.", fail: "G-force rekt you.",
    ctWin: ["@SpaceX: perp listed", "@HYPE: LFG"], ctFail: ["@IPO: delayed", "@Gforce: L"],
    duration: 26, showTapButton: true,
    init(e) {
      this.y = 0.5; this.vy = 0; this.gaps = []; this.passed = 0; this.need = 6; this.spawnX = 1;
      this.addGap(e);
    },
    addGap(e) {
      this.gaps.push({ x: 1.1, gap: 0.2 + Math.random() * 0.14, w: 0.09 });
    },
    update(dt, e) {
      this.vy += 1.05 * dt; this.y += this.vy * dt; this.y = Math.max(0.12, Math.min(0.88, this.y));
      this.gaps.forEach(g => { g.x -= dt * 0.74; });
      this.gaps = this.gaps.filter(g => {
        if (g.x < 0.15 && g.x > 0.05 && !g.scored) {
          g.scored = true;
          const inGap = this.y > g.gap && this.y < g.gap + 0.22;
          if (inGap) { this.passed++; e.juice(e.displayWidth * 0.2, this.y * e.displayHeight, "#3fb950"); }
          else { e.loseLevel(); return true; }
        }
        return g.x > -0.1;
      });
      if (this.gaps.length < 2) this.addGap(e);
      if (this.passed >= this.need) e.winLevel();
      else if (e.elapsed >= e.duration) e.loseLevel();
    },
    tap(e) { this.vy = -0.62; },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, w, h);
      this.gaps.forEach(g => {
        const gx = g.x * w; const gy = g.gap * h; const gh = h * 0.22;
        ctx.fillStyle = "#f85149"; ctx.fillRect(gx, 0, g.w * w, gy); ctx.fillRect(gx, gy + gh, g.w * w, h);
      });
      drawGlow(ctx, w * 0.12, this.y * h, 28, "#627eea");
      ctx.fillStyle = "#627eea"; ctx.font = "24px system-ui"; ctx.fillText("🚀", w * 0.12 - 12, this.y * h + 8);
      e.drawProgress(this.passed, this.need, w, h);
    },
  },

  // ── ACT IV: CT FINAL BOSS ────────────────────────────────────
  {
    id: 16, name: "Airdrop Supply Drop",
    boss: goalBrief("Claim 10 green airdrops", "Tap green AIRDROP crates as they fall from the sky", "Let red FAKE crates fall — miss 2 real drops or tap 2 scams = fail"),
    instruction: "WIN: 10 green drops · skip fake", mobileInstruction: "Green yes · red no",
    logos: ["megaeth.png", "eigenlayer.png"],
    accent: "#ff6b6b",
    win: "Bags secured. Sybil tears optional.", fail: "You claimed a phishing drop.",
    ctWin: ["@Airdrop: claimed", "@TGE: brutal"], ctFail: ["@Scam: thanks", "@Farm: rekt"],
    duration: 28,
    init(e) {
      this.drops = [];
      this.claimed = 0; this.need = 10;
      this.scamTaps = 0; this.maxScam = 2;
      this.missed = 0; this.maxMissed = 2;
      this.spawn = 0;
      this.logos = ["megaeth.png", "eigenlayer.png"];
      this.hitR = e.mobile ? 46 : 40;
      this.wind = 0;
    },
    update(dt, e) {
      this.wind += dt;
      this.spawn += dt;
      if (this.spawn > 0.42) {
        this.spawn = 0;
        const scam = Math.random() < 0.36;
        this.drops.push({
          x: 40 + Math.random() * (e.displayWidth - 80),
          y: -50,
          scam,
          logo: scam ? "pump-fun.png" : this.logos[Math.floor(Math.random() * this.logos.length)],
          speed: 95 + Math.random() * 55,
          sway: Math.random() * Math.PI * 2,
          chute: !scam,
        });
      }

      this.drops.forEach(d => {
        d.y += d.speed * dt;
        d.x += Math.sin(this.wind * 2 + d.sway) * 28 * dt;
      });

      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        if (d.y > h(e) + 50) {
          if (!d.scam) this.missed++;
          this.drops.splice(i, 1);
        }
      }

      if (this.claimed >= this.need) e.winLevel();
      else if (this.scamTaps > this.maxScam || this.missed > this.maxMissed
        || (e.elapsed >= e.duration && this.claimed < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const hit = this.drops.find(d => Math.hypot(d.x - x, d.y - y) < this.hitR);
      if (!hit) return;
      this.drops = this.drops.filter(d => d !== hit);
      if (hit.scam) {
        this.scamTaps++;
        e.juice(x, y, "#f85149", "SCAM");
        e.shake();
      } else {
        this.claimed++;
        e.juice(x, y, "#3fb950", "CLAIMED");
      }
    },
    draw(ctx, e, w, h) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#1a1030");
      bg.addColorStop(0.45, "#120818");
      bg.addColorStop(1, "#0a0610");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 18; i++) {
        const sx = (i * 97 + this.wind * 12) % w;
        const sy = (i * 53) % (h * 0.7);
        ctx.fillRect(sx, sy, 2, 2);
      }

      ctx.fillStyle = "#ff6b6b";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("TGE SUPPLY DROP", w / 2, 28);

      this.drops.forEach(d => {
        const col = d.scam ? "#f85149" : "#3fb950";
        if (d.chute) {
          ctx.strokeStyle = col + "55";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(d.x - 18, d.y - 34);
          ctx.quadraticCurveTo(d.x, d.y - 52, d.x + 18, d.y - 34);
          ctx.stroke();
        }
        drawGlow(ctx, d.x, d.y, 34, col);
        drawCard(ctx, d.x - 28, d.y - 22, 56, 44, 8, d.scam ? "#2a1018" : "#102818", col + "66");
        drawLogo(ctx, e, d.logo, d.x, d.y - 2, 30);
        ctx.fillStyle = col;
        ctx.font = "bold 9px system-ui";
        ctx.fillText(d.scam ? "FAKE" : "AIRDROP", d.x, d.y + 22);
      });

      ctx.fillStyle = "#3fb95044";
      ctx.fillRect(0, h - 6, w, 6);
      ctx.textAlign = "left";
      e.drawProgress(this.claimed, this.need, w, h);
    },
  },
  {
    id: 17, name: "KOL Ventriloquist",
    boss: goalBrief("Post disclaimer 6 times", "Tap only when NFA scrolls on screen", "Never tap WAGMI, 100x, or GEM — max 2 wrong taps"),
    instruction: "WIN: 6 NFA taps · skip shills", mobileInstruction: "NFA only",
    logos: ["x-logo.svg"],
    accent: "#1d9bf0",
    win: "Disclaimer delivered. SEC distracted.", fail: "Shilled without NFA.",
    ctWin: ["@KOL: NFA", "@SEC: hmm"], ctFail: ["@SEC: got you", "@Shill: oops"],
    duration: 22,
    init(e) { this.hits = 0; this.need = 6; this.miss = 0; this.maxMiss = 2; this.word = null; this.timer = 0.45; },
    update(dt, e) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.word = Math.random() < 0.44 ? "NFA" : ["WAGMI", "NFA*", "GEM", "100x"][Math.floor(Math.random() * 4)];
        this.timer = this.word === "NFA" ? 0.58 : 0.88;
      }
    },
    tap(e) {
      if (this.word === "NFA") { this.hits++; e.juice(e.displayWidth / 2, e.displayHeight * 0.45, "#3fb950", "NFA"); if (this.hits >= this.need) e.winLevel(); }
      else { this.miss++; e.juice(e.displayWidth / 2, e.displayHeight * 0.45, "#f85149"); if (this.miss >= this.maxMiss) e.loseLevel(); }
      this.word = null; this.timer = 0.6;
    },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#0a1018"; ctx.fillRect(0, 0, w, h);
      drawLogo(ctx, e, "x-logo.svg", w / 2, h * 0.22, 40);
      if (this.word) {
        const ok = this.word === "NFA";
        drawGlow(ctx, w / 2, h * 0.48, 70, ok ? "#3fb950" : "#d29922");
        ctx.fillStyle = ok ? "#3fb950" : "#e6edf3";
        ctx.font = `bold ${e.mobile ? 36 : 28}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(this.word, w / 2, h * 0.48);
      }
      ctx.textAlign = "left";
      e.drawProgress(this.hits, this.need, w, h);
    },
  },
  {
    id: 18, name: "Narrative Whiplash",
    boss: goalBrief("Catch the meta 10 times", "Wait for LOCKED on the wheel, then tap chips matching that narrative", "Don't tap during SPIN or on wrong meta — 3 strikes = fail"),
    instruction: "WIN: 10 meta taps · wait LOCK", mobileInstruction: "Wait LOCK → tap",
    logos: ["solana.png", "hyperliquid.png", "zcash.png", "ondo.png"],
    accent: "#d29922",
    win: "You caught the meta. It already rotated.", fail: "You bought last week's narrative.",
    ctWin: ["@Rotation: fast", "@Meta: caught"], ctFail: ["@Late: always", "@CT: ngmi"],
    duration: 30,
    init(e) {
      this.metas = [
        { n: "SOL", l: "solana.png", c: "#9945ff" },
        { n: "HYPE", l: "hyperliquid.png", c: "#00d4aa" },
        { n: "ZEC", l: "zcash.png", c: "#f4b728" },
        { n: "ONDO", l: "ondo.png", c: "#4ecdc4" },
      ];
      this.lockIdx = 0;
      this.wheelAngle = 0;
      this.phase = "spin";
      this.phaseT = 0;
      this.spinDur = 1.85;
      this.lockDur = 1.05;
      this.whipDur = 0.35;
      this.chips = [];
      this.hits = 0;
      this.need = 10;
      this.strikes = 0;
      this.maxStrikes = 2;
      this.spawn = 0;
      this.hitR = e.mobile ? 40 : 34;
    },
    setLockFromWheel() {
      const seg = Math.PI * 2 / this.metas.length;
      this.lockIdx = Math.floor(((this.wheelAngle % (Math.PI * 2)) + seg * 0.5) / seg) % this.metas.length;
    },
    spawnChip(e) {
      const m = this.metas[Math.floor(Math.random() * this.metas.length)];
      this.chips.push({
        m,
        x: 36 + Math.random() * (e.displayWidth - 72),
        y: -28,
        speed: 128 + Math.random() * 48,
        drift: (Math.random() - 0.5) * 42,
        spin: Math.random() * 6,
      });
    },
    update(dt, e) {
      this.phaseT += dt;
      if (this.phase === "spin") {
        this.wheelAngle += dt * 5.8;
        if (this.phaseT >= this.spinDur) {
          this.phase = "lock";
          this.phaseT = 0;
          this.setLockFromWheel();
        }
      } else if (this.phase === "lock") {
        if (this.phaseT >= this.lockDur) {
          this.phase = "whip";
          this.phaseT = 0;
        }
      } else {
        this.wheelAngle += dt * 14;
        if (this.phaseT >= this.whipDur) {
          this.phase = "spin";
          this.phaseT = 0;
        }
      }

      const spawnRate = this.phase === "lock" ? 0.34 : 0.62;
      this.spawn += dt;
      if (this.spawn > spawnRate) {
        this.spawn = 0;
        this.spawnChip(e);
        if (this.phase === "lock" && Math.random() < 0.42) this.spawnChip(e);
      }

      this.chips.forEach(c => {
        c.y += c.speed * dt;
        c.x += c.drift * dt;
        c.spin += dt * 3;
      });
      this.chips = this.chips.filter(c => c.y < h(e) + 40 && c.x > -20 && c.x < e.displayWidth + 20);

      if (this.hits >= this.need) e.winLevel();
      else if (this.strikes > this.maxStrikes || (e.elapsed >= e.duration && this.hits < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const c = this.chips.find(ch => Math.hypot(ch.x - x, ch.y - y) < this.hitR);
      if (!c) return;
      this.chips = this.chips.filter(o => o !== c);
      if (this.phase !== "lock") {
        this.strikes++;
        e.juice(x, y, "#f85149", "WAIT");
        e.shake();
        if (this.strikes > this.maxStrikes) e.loseLevel();
        return;
      }
      const locked = this.metas[this.lockIdx];
      if (c.m.n === locked.n) {
        this.hits++;
        e.juice(x, y, locked.c, "META");
      } else {
        this.strikes++;
        e.juice(x, y, "#f85149", "STALE");
        e.shake();
        if (this.strikes > this.maxStrikes) e.loseLevel();
      }
    },
    draw(ctx, e, w, ht) {
      const g = ctx.createLinearGradient(0, 0, w, ht);
      g.addColorStop(0, "#0a0814");
      g.addColorStop(1, "#120a08");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, ht);

      const cx = w / 2;
      const cy = ht * 0.19;
      const r = e.mobile ? 54 : 46;
      const seg = (Math.PI * 2) / this.metas.length;
      this.metas.forEach((m, i) => {
        const a0 = this.wheelAngle + i * seg;
        const a1 = a0 + seg;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a0, a1);
        ctx.closePath();
        ctx.fillStyle = m.c + (this.phase === "lock" && i === this.lockIdx ? "cc" : "44");
        ctx.fill();
        const mid = a0 + seg / 2;
        drawLogo(ctx, e, m.l, cx + Math.cos(mid) * r * 0.62, cy + Math.sin(mid) * r * 0.62, e.mobile ? 22 : 18);
      });
      ctx.strokeStyle = this.phase === "lock" ? "#3fb950" : this.phase === "whip" ? "#f85149" : "#d29922";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.stroke();

      const locked = this.metas[this.lockIdx];
      const status = this.phase === "lock" ? `LOCKED · ${locked.n}` : this.phase === "whip" ? "WHIPLASH" : "SPINNING";
      const statusCol = this.phase === "lock" ? "#3fb950" : this.phase === "whip" ? "#f85149" : "#d29922";
      drawCard(ctx, 14, ht * 0.34, w - 28, 36, 10, "#21262d99", statusCol + "66");
      ctx.fillStyle = statusCol;
      ctx.font = `bold ${e.mobile ? 13 : 12}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(status, w / 2, ht * 0.34 + 22);
      ctx.textAlign = "left";

      this.chips.forEach(c => {
        const hot = this.phase === "lock" && c.m.n === locked.n;
        drawGlow(ctx, c.x, c.y, hot ? 34 : 22, c.m.c);
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(Math.sin(c.spin) * 0.25);
        drawLogo(ctx, e, c.m.l, 0, 0, e.mobile ? 34 : 28);
        ctx.restore();
      });
      ctx.fillStyle = "#8b949e";
      ctx.font = "11px system-ui";
      ctx.fillText(`Strikes ${this.strikes}/${this.maxStrikes}`, 14, ht - 12);
      e.drawProgress(this.hits, this.need, w, ht);
    },
  },
  {
    id: 19, name: "Zach Thread Boss Fight",
    boss: goalBrief("Kill 9 red flags before they escape", "Tap 🚩 flags as they fall down the thread", "Never tap green AUDITED/SAFU pills — let max 2 flags escape"),
    instruction: "WIN: 9 flags · skip pills", mobileInstruction: "Flags yes · pills no",
    logos: ["x-logo.svg"],
    accent: "#f85149",
    win: "Thread neutralized. Supply unclear.", fail: "95% supply controlled.",
    ctWin: ["@Zach: thread", "@CT: awareness"], ctFail: ["@LAB: pumped", "@OTC: yikes"],
    duration: 28,
    init(e) {
      this.flags = [];
      this.pills = [];
      this.killed = 0;
      this.need = 9;
      this.miss = 0;
      this.maxMiss = 2;
      this.spawn = 0.55;
      this.pillSpawn = 1.1;
      this.scroll = 0;
      this.scrollSpeed = 52;
      this.bossPhase = 1;
      this.thread = [
        "1/ Team anonymous since 2022",
        "2/ 90% supply OTC before TGE",
        "3/ 'Audited' — no link attached",
        "4/ KOL wallet funded same block",
        "5/ Liquidity unlock tomorrow",
      ];
      this.hitR = e.mobile ? 44 : 38;
    },
    spawnFlag(e, x, y, split) {
      this.flags.push({
        x: x ?? 40 + Math.random() * (e.displayWidth - 80),
        y: y ?? -24,
        vx: (Math.random() - 0.5) * (this.bossPhase > 1 ? 48 : 18),
        vy: 62 + Math.random() * 38 + (split ? 20 : 0),
        t: 0,
        size: split ? 0.72 : 1,
      });
    },
    spawnPill(e) {
      this.pills.push({
        x: 50 + Math.random() * (e.displayWidth - 100),
        y: -20,
        vy: 48 + Math.random() * 24,
        label: Math.random() < 0.5 ? "AUDITED ✓" : "SAFU ✓",
      });
    },
    update(dt, e) {
      const ht = h(e);
      if (this.killed >= 5) {
        this.bossPhase = 2;
        this.scrollSpeed = 78;
      }

      this.scroll += this.scrollSpeed * dt;
      this.spawn += dt;
      if (this.spawn > (this.bossPhase > 1 ? 0.48 : 0.62)) {
        this.spawn = 0;
        this.spawnFlag(e);
        if (this.bossPhase > 1 && Math.random() < 0.35) this.spawnFlag(e);
      }
      this.pillSpawn += dt;
      if (this.pillSpawn > (this.bossPhase > 1 ? 0.85 : 1.15)) {
        this.pillSpawn = 0;
        this.spawnPill(e);
      }

      this.flags.forEach(f => {
        f.y += f.vy * dt;
        f.x += f.vx * dt;
        f.t += dt;
        f.x = Math.max(28, Math.min(e.displayWidth - 28, f.x));
      });
      this.pills.forEach(p => { p.y += p.vy * dt; });

      this.flags = this.flags.filter(f => {
        if (f.y > ht + 30) {
          this.miss++;
          e.shake();
          this.spawnFlag(e, f.x, ht * 0.55, true);
          this.spawnFlag(e, f.x + (Math.random() - 0.5) * 60, ht * 0.5, true);
          return false;
        }
        return true;
      });
      this.pills = this.pills.filter(p => p.y < ht + 30);

      if (this.killed >= this.need) e.winLevel();
      else if (this.miss > this.maxMiss || this.flags.length > 10 || (e.elapsed >= e.duration && this.killed < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const pill = this.pills.find(p => Math.hypot(p.x - x, p.y - y) < this.hitR * 0.9);
      if (pill) {
        this.pills = this.pills.filter(o => o !== pill);
        this.miss++;
        e.juice(x, y, "#3fb950", "BAIT");
        e.shake();
        if (this.miss > this.maxMiss) e.loseLevel();
        return;
      }
      const f = this.flags.find(fl => Math.hypot(fl.x - x, fl.y - y) < this.hitR * fl.size);
      if (!f) return;
      this.killed++;
      this.flags = this.flags.filter(o => o !== f);
      e.juice(x, y, "#f85149", "FLAG");
    },
    draw(ctx, e, w, ht) {
      ctx.fillStyle = "#0c0808";
      ctx.fillRect(0, 0, w, ht);
      drawLogo(ctx, e, "x-logo.svg", w - 36, 28, 26);

      const threadY = (this.scroll % (ht * 0.55)) - ht * 0.1;
      ctx.fillStyle = "rgba(22,27,34,0.55)";
      ctx.fillRect(18, ht * 0.08, w - 36, ht * 0.38);
      ctx.strokeStyle = "#30363d";
      ctx.strokeRect(18, ht * 0.08, w - 36, ht * 0.38);
      ctx.fillStyle = "#8b949e";
      ctx.font = `11px ui-monospace, monospace`;
      this.thread.forEach((line, i) => {
        const ly = ht * 0.12 + i * 22 - (threadY % 110);
        if (ly > ht * 0.06 && ly < ht * 0.46) ctx.fillText(line, 28, ly);
      });

      if (this.bossPhase > 1) {
        drawGlow(ctx, w / 2, ht * 0.52, 80, "#f85149");
        ctx.fillStyle = "#f85149";
        ctx.font = `bold ${e.mobile ? 12 : 11}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("PHASE 2 · FLAGS MULTIPLY", w / 2, ht * 0.52);
        ctx.textAlign = "left";
      }

      this.pills.forEach(p => {
        drawCard(ctx, p.x - 52, p.y - 14, 104, 28, 8, "#1a3d2a88", "#3fb95066");
        ctx.fillStyle = "#3fb950";
        ctx.font = `bold ${e.mobile ? 10 : 9}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(p.label, p.x, p.y + 4);
      });
      ctx.textAlign = "left";

      this.flags.forEach(f => {
        const sz = 28 * f.size;
        drawGlow(ctx, f.x, f.y, 24 * f.size, "#f85149");
        ctx.font = `${sz}px system-ui`;
        ctx.fillText("🚩", f.x - sz * 0.5, f.y + sz * 0.35);
      });

      ctx.fillStyle = "#8b949e";
      ctx.font = "11px system-ui";
      ctx.fillText(`Escaped ${this.miss}/${this.maxMiss} · swarm ${this.flags.length}/10`, 14, ht - 12);
      e.drawProgress(this.killed, this.need, w, ht);
    },
  },
  {
    id: 20, name: "Touch Grass",
    boss: goalBrief(
      "Complete all 3 phases and log off",
      "① Drag past lasers into grass → ② Hold in grass 3 seconds → ③ Drag to grass and tap LOG OFF",
      "Lasers, missiles, notifications, or a full dopamine bar end the run"
    ),
    instruction: "Phase 1: reach the grass", mobileInstruction: "Get to grass",
    logos: ["x-logo.svg", "bitcoin.png", "hyperliquid.png"],
    accent: "#3fb950",
    win: "Grass touched. CT disappointed.", fail: "Notification overdose.",
    ctWin: ["@TouchGrass: W", "@CT: rare"], ctFail: ["@Alpha: missed", "@HYPE: +12%"],
    duration: 40,
    init(e) {
      const w = e.displayWidth;
      const ht = e.displayHeight;
      this.player = { x: w * 0.68, y: ht * 0.44 };
      this.phase = 1;
      this.hold = 0;
      this.holdNeed = 6;
      this.dopamine = 0;
      this.maxDopamine = 100;
      this.pulse = 0;
      this.grassLit = true;
      this.flickerT = 0;
      this.orbit = 0;
      this.resistT = 1.05;
      this.spawn = 0;
      this.missileCd = 1.2;
      this.decoyCd = 2.4;
      this.hookCd = 1.6;
      this.hook = null;
      this.notifs = [];
      this.missiles = [];
      this.decoys = [];
      this.texts = ["HYPE +12%", "ALPHA", "ZACH", "FOMO", "CPI", "TGE", "OTC"];
      this.sweepers = [
        { kind: "h", pos: 0.22, vel: 0.42, thick: 0.045 },
        { kind: "h", pos: 0.58, vel: -0.36, thick: 0.04 },
        { kind: "v", pos: 0.38, vel: 0.48, thick: 0.038 },
      ];
      this.grassBase = { x: 0, y: 0.46, w: 0.3, h: 0.54 };
      this.pr = e.mobile ? 20 : 15;
      this.setPrompt(e);
      if (e.tapBtn) {
        e.tapBtn.style.display = "none";
        e.tapBtn.textContent = "LOG OFF";
      }
    },
    setPrompt(e) {
      const prompts = {
        1: ["Phase 1: Drag into the grass", "Drag to grass"],
        2: ["Phase 2: Stay in grass 3 seconds", "Hold in grass 3s"],
        3: ["Phase 3: Tap LOG OFF at grass", "Tap LOG OFF"],
      };
      const p = prompts[this.phase];
      if (e.instructionEl && p) e.instructionEl.textContent = e.mobile ? p[1] : p[0];
    },
    grassZone(e) {
      const w = e.displayWidth;
      const ht = e.displayHeight;
      if (this.phase < 3) {
        const g = this.grassBase;
        return { x: g.x * w, y: g.y * ht, w: g.w * w, h: g.h * ht, r: null };
      }
      const cx = w * 0.17 + Math.cos(this.orbit) * w * 0.09;
      const cy = ht * 0.74 + Math.sin(this.orbit * 1.3) * ht * 0.07;
      const r = e.mobile ? 52 : 42;
      return { x: cx - r, y: cy - r, w: r * 2, h: r * 2, r, cx, cy };
    },
    inGrass(e) {
      const p = this.player;
      const z = this.grassZone(e);
      if (z.r) return Math.hypot(p.x - z.cx, p.y - z.cy) < z.r;
      return p.x < z.x + z.w && p.y > z.y;
    },
    grassActive() {
      return this.phase === 1 || (this.grassLit && this.phase >= 2);
    },
    spawnNotif(e, homing) {
      const w = e.displayWidth;
      const ht = e.displayHeight;
      const text = this.texts[Math.floor(Math.random() * this.texts.length)];
      if (homing) {
        this.missiles.push({
          x: w * 0.82 + Math.random() * w * 0.12,
          y: 40 + Math.random() * (ht - 80),
          speed: 95 + this.phase * 18,
          text,
        });
        return;
      }
      const side = Math.floor(Math.random() * 3);
      if (side === 0) {
        this.notifs.push({ x: w + 20, y: 30 + Math.random() * (ht - 80), vx: -(140 + Math.random() * 60), vy: (Math.random() - 0.5) * 50, text });
      } else if (side === 1) {
        this.notifs.push({ x: 20 + Math.random() * (w - 40), y: -20, vx: (Math.random() - 0.5) * 60, vy: 110 + Math.random() * 50, text });
      } else {
        this.notifs.push({ x: -120, y: 40 + Math.random() * (ht - 100), vx: 125 + Math.random() * 55, vy: (Math.random() - 0.5) * 40, text });
      }
    },
    spawnDecoy(e) {
      const w = e.displayWidth;
      const ht = e.displayHeight;
      this.decoys.push({
        x: w * (0.35 + Math.random() * 0.45),
        y: ht * (0.2 + Math.random() * 0.45),
        life: 2.2,
        t: 0,
      });
    },
    addDopamine(e, amt, x, y, label) {
      this.dopamine = Math.min(this.maxDopamine, this.dopamine + amt);
      if (x != null) e.juice(x, y, "#f85149", label || "+DOP");
      e.shake();
      if (this.dopamine >= this.maxDopamine) e.loseLevel();
    },
    hitLasers(e) {
      const w = e.displayWidth;
      const ht = e.displayHeight;
      const p = this.player;
      const pad = this.pr;
      for (const s of this.sweepers) {
        if (s.kind === "h") {
          const ly = s.pos * ht;
          const th = s.thick * ht;
          if (p.y + pad > ly - th && p.y - pad < ly + th) {
            this.addDopamine(e, 28, p.x, p.y, "LASER");
            p.y += s.vel > 0 ? 22 : -22;
          }
        } else {
          const lx = s.pos * w;
          const tw = s.thick * w;
          if (p.x + pad > lx - tw && p.x - pad < lx + tw) {
            this.addDopamine(e, 28, p.x, p.y, "LASER");
            p.x += s.vel > 0 ? 18 : -18;
          }
        }
      }
    },
    advancePhase(e, next) {
      this.phase = next;
      this.setPrompt(e);
      if (e.tapBtn) e.tapBtn.style.display = next >= 3 ? "flex" : "none";
      if (next === 2) {
        this.flickerT = 0;
        this.grassLit = true;
      }
      if (next === 3) {
        this.orbit = 0;
        this.resistT = 1.05;
        this.sweepers.push({ kind: "h", pos: 0.78, vel: 0.55, thick: 0.035 });
      }
      e.juice(e.displayWidth * 0.5, e.displayHeight * 0.5, "#3fb950", `PHASE ${next}`);
    },
    update(dt, e) {
      const w = e.displayWidth;
      const ht = e.displayHeight;
      this.pulse += dt * 3.5;
      const drag = this.phase >= 3 ? 0.44 : 0.5;

      if (e.pointer.down) {
        this.player.x += (e.pointer.x - this.player.x) * drag;
        this.player.y += (e.pointer.y - this.player.y) * drag;
      }

      const laserMul = 1 + this.phase * 0.22 + e.elapsed * 0.02;
      this.sweepers.forEach(s => {
        s.pos += s.vel * dt * laserMul;
        if (s.kind === "h" && (s.pos < 0.05 || s.pos > 0.95)) s.vel *= -1;
        if (s.kind === "v" && (s.pos < 0.08 || s.pos > 0.92)) s.vel *= -1;
      });
      this.hitLasers(e);

      if (this.phase >= 2) {
        this.flickerT += dt;
        const flickRate = this.phase >= 3 ? 0.62 : 0.88;
        if (this.flickerT >= flickRate) {
          this.flickerT = 0;
          this.grassLit = !this.grassLit;
        }
      }
      if (this.phase >= 3) this.orbit += dt * 1.15;

      this.hookCd -= dt;
      if (this.hookCd <= 0 && !this.inGrass(e)) {
        this.hookCd = 0.75 + Math.random() * 0.5;
        this.hook = { t: 0.95, label: ["ONE MORE TRADE", "CT MOVING", "LAST ALPHA"][Math.floor(Math.random() * 3)] };
      }
      if (this.hook) {
        this.hook.t -= dt;
        const cx = w * 0.62;
        const cy = ht * 0.34;
        this.player.x += (cx - this.player.x) * dt * 2.1;
        this.player.y += (cy - this.player.y) * dt * 2.1;
        this.dopamine = Math.min(this.maxDopamine, this.dopamine + dt * 14);
        if (this.hook.t <= 0) this.hook = null;
      }

      this.spawn += dt;
      const rate = Math.max(0.28, 0.62 - this.phase * 0.08 - e.elapsed * 0.006);
      if (this.spawn > rate) {
        this.spawn = 0;
        this.spawnNotif(e, false);
        if (this.phase > 1 && Math.random() < 0.45) this.spawnNotif(e, false);
      }

      if (this.phase >= 2) {
        this.missileCd -= dt;
        if (this.missileCd <= 0) {
          this.missileCd = this.phase >= 3 ? 0.55 : 0.95;
          this.spawnNotif(e, true);
        }
      }
      if (this.phase >= 1) {
        this.decoyCd -= dt;
        if (this.decoyCd <= 0) {
          this.decoyCd = 2.1 - this.phase * 0.25;
          this.spawnDecoy(e);
        }
      }

      this.notifs.forEach(n => { n.x += n.vx * dt; n.y += n.vy * dt; });
      this.notifs = this.notifs.filter(n => n.x > -200 && n.x < w + 200 && n.y > -80 && n.y < ht + 80);

      this.missiles.forEach(m => {
        const dx = this.player.x - m.x;
        const dy = this.player.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        m.x += (dx / d) * m.speed * dt;
        m.y += (dy / d) * m.speed * dt;
      });
      this.missiles = this.missiles.filter(m => m.x > -40 && m.x < w + 40 && m.y > -40 && m.y < ht + 40);

      this.decoys.forEach(d => { d.t += dt; });
      this.decoys = this.decoys.filter(d => d.t < d.life);

      const hitR = e.mobile ? 34 : 28;
      [...this.notifs, ...this.missiles].forEach(n => {
        if (Math.hypot(n.x - this.player.x, n.y - this.player.y) < hitR + 18) {
          n.x = -9999;
          this.addDopamine(e, 16, this.player.x, this.player.y);
        }
      });
      this.decoys.forEach(d => {
        if (Math.hypot(d.x - this.player.x, d.y - this.player.y) < hitR + 24) {
          d.t = d.life;
          this.addDopamine(e, 22, d.x, d.y, "FAKE");
        }
      });

      this.player.x = Math.max(this.pr, Math.min(w - this.pr, this.player.x));
      this.player.y = Math.max(this.pr, Math.min(ht - this.pr, this.player.y));

      const inG = this.inGrass(e);
      const active = this.grassActive();

      if (this.phase === 1) {
        if (inG) this.advancePhase(e, 2);
      } else if (inG && active) {
        this.hold += dt;
        this.dopamine = Math.max(0, this.dopamine - dt * 38);
        if (this.phase === 2 && this.hold >= 3) this.advancePhase(e, 3);
      } else {
        this.hold = Math.max(0, this.hold - dt * (this.phase >= 3 ? 2.6 : 2.1));
        if (!inG) this.dopamine = Math.min(this.maxDopamine, this.dopamine + dt * 5);
      }

      if (this.phase >= 3) {
        this.resistT -= dt;
        if (this.resistT <= 0) {
          this.resistT = 0.95;
          this.hold = Math.max(0, this.hold - 1.4);
          this.addDopamine(e, 10, this.player.x, this.player.y, "SCROLL");
        }
      }

      if (this.hold >= this.holdNeed) e.winLevel();
      else if (this.dopamine >= this.maxDopamine || e.elapsed >= e.duration) e.loseLevel();
    },
    tap(e) {
      if (this.phase < 3) return;
      this.resistT = 1.05;
      e.juice(e.displayWidth / 2, e.displayHeight * 0.72, "#3fb950", "LOG OFF");
    },
    onTap(e) { this.tap(e); },
    draw(ctx, e, w, ht) {
      const sky = ctx.createLinearGradient(0, 0, w, ht);
      sky.addColorStop(0, "#0d1117");
      sky.addColorStop(0.5, "#12101a");
      sky.addColorStop(1, "#0f2418");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, ht);

      ctx.fillStyle = "rgba(248,113,113,0.04)";
      ctx.fillRect(w * 0.42, 0, w * 0.58, ht);
      drawCard(ctx, w * 0.58, ht * 0.1, w * 0.36, ht * 0.55, 14, "#161b2288", "#f8514933");
      drawLogo(ctx, e, "x-logo.svg", w * 0.76, ht * 0.2, e.mobile ? 36 : 30);
      drawLogo(ctx, e, "hyperliquid.png", w * 0.66, ht * 0.38, 28);
      drawLogo(ctx, e, "bitcoin.png", w * 0.86, ht * 0.38, 28);
      ctx.fillStyle = "#f85149";
      ctx.font = `bold ${e.mobile ? 10 : 9}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("CT BUNKER", w * 0.76, ht * 0.52);
      ctx.textAlign = "left";

      this.sweepers.forEach(s => {
        if (s.kind === "h") {
          const ly = s.pos * ht;
          const th = s.thick * ht;
          const g = ctx.createLinearGradient(0, ly - th, 0, ly + th);
          g.addColorStop(0, "transparent");
          g.addColorStop(0.5, "rgba(248,113,113,0.55)");
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.fillRect(0, ly - th, w, th * 2);
        } else {
          const lx = s.pos * w;
          const tw = s.thick * w;
          ctx.fillStyle = "rgba(248,113,113,0.4)";
          ctx.fillRect(lx - tw, 0, tw * 2, ht);
        }
      });

      const z = this.grassZone(e);
      const lit = this.grassActive();
      if (z.r) {
        if (lit) {
          drawGlow(ctx, z.cx, z.cy, z.r + 12, "#3fb950");
          ctx.fillStyle = "rgba(35,134,54,0.55)";
          ctx.beginPath();
          ctx.arc(z.cx, z.cy, z.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(63,185,80,0.35)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(z.cx, z.cy, z.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (lit) {
        ctx.fillStyle = "#238636";
        ctx.fillRect(z.x, z.y, z.w, z.h);
        drawGlow(ctx, z.x + z.w * 0.5, z.y + z.h * 0.5, 70 + Math.sin(this.pulse) * 20, "#3fb950");
      } else {
        ctx.fillStyle = "rgba(35,134,54,0.12)";
        ctx.fillRect(z.x, z.y, z.w, z.h);
      }
      ctx.fillStyle = lit ? "#aff0b8" : "#8b949e";
      ctx.font = `bold ${e.mobile ? 12 : 11}px system-ui`;
      ctx.fillText(lit ? "GRASS" : "grass offline", 14, ht - 14);

      this.decoys.forEach(d => {
        const a = 1 - d.t / d.life;
        ctx.globalAlpha = a * 0.85;
        drawGlow(ctx, d.x, d.y, 36, "#3fb950");
        ctx.fillStyle = "#238636";
        ctx.beginPath();
        ctx.arc(d.x, d.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (this.hook) {
        const cx = w * 0.62;
        const cy = ht * 0.34;
        ctx.strokeStyle = "rgba(248,113,113,0.5)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#f85149";
        ctx.font = `bold ${e.mobile ? 10 : 9}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(this.hook.label, cx, cy);
        ctx.textAlign = "left";
      }

      this.notifs.forEach(n => {
        drawCard(ctx, n.x - 62, n.y - 14, 124, 28, 8, "#f8514966", "#f85149");
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${e.mobile ? 9 : 8}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(n.text, n.x, n.y + 3);
      });
      this.missiles.forEach(m => {
        drawGlow(ctx, m.x, m.y, 26, "#f85149");
        drawCard(ctx, m.x - 48, m.y - 12, 96, 24, 6, "#f8514966", "#f85149");
        ctx.fillStyle = "#fff";
        ctx.font = "8px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(m.text, m.x, m.y + 3);
      });
      ctx.textAlign = "left";

      const inG = this.inGrass(e);
      drawGlow(ctx, this.player.x, this.player.y, inG && lit ? 36 : 26, inG && lit ? "#3fb950" : "#2e5cff");
      ctx.fillStyle = inG && lit ? "#3fb950" : "#2e5cff";
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.pr, 0, Math.PI * 2);
      ctx.fill();

      const phaseLabel = ["", "BREACH", "FLICKER", "LOG OFF"][this.phase];
      drawCard(ctx, w / 2 - 72, 10, 144, 26, 8, "#21262dcc", "#3fb95055");
      ctx.fillStyle = "#3fb950";
      ctx.font = `bold ${e.mobile ? 10 : 9}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(`PHASE ${this.phase} · ${phaseLabel}`, w / 2, 27);
      ctx.textAlign = "left";

      ctx.fillStyle = "#21262d";
      ctx.fillRect(14, 14, 80, 8);
      ctx.fillStyle = this.dopamine > 70 ? "#f85149" : "#d29922";
      ctx.fillRect(14, 14, 80 * (this.dopamine / this.maxDopamine), 8);
      ctx.fillStyle = "#8b949e";
      ctx.font = "9px system-ui";
      ctx.fillText("DOPAMINE", 14, 32);

      if (this.phase >= 3) {
        const rw = 60;
        ctx.fillStyle = "#21262d";
        ctx.fillRect(w / 2 - rw / 2, ht - 18, rw, 6);
        ctx.fillStyle = this.resistT < 0.35 ? "#f85149" : "#8b5cf6";
        ctx.fillRect(w / 2 - rw / 2, ht - 18, rw * (this.resistT / 1.05), 6);
      }

      e.drawProgress(Math.floor(this.hold * 10), this.holdNeed * 10, w, ht);
    },
  },
];

function h(e) { return e.displayHeight || 400; }