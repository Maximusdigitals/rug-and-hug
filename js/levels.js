/* 20 levels — mobile-first, tuned difficulty, modern canvas visuals */

const LEVELS = [
  // ── ACT I: THE TRENCHES ──────────────────────────────────────
  {
    id: 1, name: "Gas Fee Seance",
    boss: "Summon your pending ETH transaction. Tap when the orb hits the gold zone.",
    instruction: "Tap on the beat", mobileInstruction: "Tap when gold",
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
      ctx.fillStyle = "#080b12"; ctx.fillRect(0, 0, w, h);
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
    boss: "Green = gem. Red ring = rug. Tap the gems.",
    instruction: "Tap green gems", mobileInstruction: "Tap green, skip red",
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
    boss: "BTC is sideways forever. Keep the dot between the walls.",
    instruction: "Drag or tap sides to stay centered", mobileInstruction: "Drag to center",
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
    boss: "Tap when the meter is in FEAR (green). Skip greed.",
    instruction: "Tap in green FEAR zone", mobileInstruction: "Tap green zone",
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
    id: 5, name: "Meme Coin Naming Committee",
    boss: "Pick a ticker that isn't cursed. Less is more.",
    instruction: "Tap the safe ticker", mobileInstruction: "Tap safe ticker",
    logos: ["bonk.png", "wif.png"],
    accent: "#9945ff",
    win: "Ticker approved. Chart still dumps.", fail: "Cursed ticker deployed.",
    ctWin: ["@Bonk: respectable", "@CT: tame"], ctFail: ["@Pump: lmao", "@Dev: rugged"],
    duration: 20, isDialogue: true,
    init(e) {
      this.round = 0; this.miss = 0; this.maxMiss = 2;
      this.rounds = [
        { q: "Deploy your memecoin. Pick a ticker:", options: ["BONK", "BONKx", "BONK-ETH", "xBONK"], correct: 0 },
        { q: "CT wants a rename. What's still clean?", options: ["WBONK", "BONK", "BONKINU", "BONK-SOL"], correct: 1 },
        { q: "Final approval — pick the ticker:", options: ["BONK2", "BONKAI", "BONK", "sBONK"], correct: 2 },
      ];
      e.showDialogue(this.rounds[0]);
    },
    pick(e, i) {
      const r = this.rounds[this.round];
      if (i === r.correct) {
        this.round++;
        if (this.round >= this.rounds.length) e.winLevel();
        else e.showDialogue(this.rounds[this.round]);
      } else {
        this.miss++;
        if (this.miss >= this.maxMiss) e.loseLevel();
        else e.showDialogue({ ...r, q: r.q + " — committee rejected that." });
      }
    },
  },

  // ── ACT II: INSTITUTIONAL COSPLAY ────────────────────────────
  {
    id: 6, name: "ETF Funeral Director",
    boss: "Institutional ghosts bail fast. Tap them before they fade — pews recycle.",
    instruction: "Tap ghosts before they fade", mobileInstruction: "Tap the ghost",
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
    boss: "Pools shuffle every few seconds. Dunk into PERPS five times — OIL and PRE-IPO will rekt you.",
    instruction: "Drag into moving PERPS", mobileInstruction: "Dunk PERPS ×5",
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
    boss: "Oil, gold, silver spirits attack. Tap the glowing one.",
    instruction: "Tap the pulsing commodity", mobileInstruction: "Tap the glow",
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
    id: 9, name: "Tokenized Grandma",
    boss: "Grandma has questions about her on-chain TSLA. Pick the right answer.",
    instruction: "Tap the best answer", mobileInstruction: "Tap best answer",
    logos: ["ondo.png", "usdc.png"],
    accent: "#4ecdc4",
    win: "Grandma understands. She's still confused.", fail: "Grandma called the SEC.",
    ctWin: ["@Ondo: DTCC vibes", "@Grandma: cute"], ctFail: ["@SEC: hello", "@TradFi: no"],
    duration: 20, isDialogue: true,
    init(e) {
      this.round = 0; this.miss = 0; this.maxMiss = 2;
      this.rounds = [
        { q: "Grandma: Where's my dividend?", options: ["It's on-chain vibes", "Accrued per block in USDC", "Paid quarterly via oracle", "Auto-compounds in your wallet"], correct: 0 },
        { q: "Grandma: Is this a scam?", options: ["Absolutely not*", "Audited — read the litepaper", "Only on weekends", "Same as your savings account"], correct: 2 },
        { q: "Grandma: Can I redeem for cash?", options: ["Instant fiat rails live", "Redeem window Q4 maybe", "Anytime via bridge", "Composable with Maker"], correct: 1 },
        { q: "Grandma: Who holds the shares?", options: ["DTCC wrapper trust", "It's on-chain vibes", "Self-custody = ownership", "SPV under Delaware law"], correct: 1 },
      ];
      e.showDialogue(this.rounds[0]);
    },
    pick(e, i) {
      const r = this.rounds[this.round];
      if (i === r.correct) { this.round++; if (this.round >= this.rounds.length) e.winLevel(); else e.showDialogue(this.rounds[this.round]); }
      else { this.miss++; if (this.miss >= this.maxMiss) e.loseLevel(); else e.showDialogue({ ...r, q: r.q + " — Grandma's not convinced." }); }
    },
  },
  {
    id: 10, name: "Stablecoin Trust Fall",
    boss: "Catch blue USDC. Let red wobbly coins fall.",
    instruction: "Tap USDC only", mobileInstruction: "Catch blue USDC",
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
    boss: "Toggle SHIELD when the eye appears. Stay public otherwise.",
    instruction: "Tap SHIELD when eye shows", mobileInstruction: "Tap SHIELD on eye",
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
    id: 12, name: "AI Agent Union Strike",
    boss: "Your trading bot is on strike. Negotiate or get liquidated.",
    instruction: "Pick the best deal", mobileInstruction: "Pick best deal",
    logos: ["venice-vvv.png", "tao.png", "near.png"],
    accent: "#a371f7",
    win: "Bot back online. Still useless.", fail: "Bot liquidated everything.",
    ctWin: ["@VVV: unionized", "@AI: W"], ctFail: ["@Wallet: 0", "@Bot: bye"],
    duration: 24, isDialogue: true,
    init(e) {
      this.round = 0; this.miss = 0; this.maxMiss = 2;
      this.rounds = [
        { q: "Agent wants APY.", options: ["Market rate only", "4.20% + snacks", "Exposure + equity", "Vibes-based yield"], correct: 1 },
        { q: "Agent wants FOMC break.", options: ["Never", "Half day on CPI only", "FOMC days off", "Trade through — we're bots"], correct: 2 },
        { q: "Agent wants gas reimbursement.", options: ["Pay your own gas", "Mainnet reimbursement cap", "We cover L2 + snacks", "Deduct from PnL"], correct: 2 },
        { q: "Agent wants a title bump.", options: ["Chief Vibes Officer", "Senior Exposure Intern", "Co-Head of Alpha", "Associate + snack stipend"], correct: 3 },
      ];
      e.showDialogue(this.rounds[0]);
    },
    pick(e, i) {
      const r = this.rounds[this.round];
      if (i === r.correct) { this.round++; if (this.round >= this.rounds.length) e.winLevel(); else e.showDialogue(this.rounds[this.round]); }
      else { this.miss++; if (this.miss >= this.maxMiss) e.loseLevel(); else e.showDialogue({ ...r, q: r.q + " — union rejected that." }); }
    },
  },
  {
    id: 13, name: "Polymarket Wedding",
    boss: "Seat guests: YES left, NO right. Tap the correct side.",
    instruction: "YES ← → NO", mobileInstruction: "Tap correct side",
    logos: ["polymarket-icon.png"],
    accent: "#2e5cff",
    win: "Wedding saved. Both sides lost money.", fail: "Brawl at the reception.",
    ctWin: ["@Polymarket: balanced", "@YES: ok"], ctFail: ["@NO: fight", "@Odds: chaos"],
    duration: 24,
    init(e) { this.done = 0; this.need = 9; this.miss = 0; this.maxMiss = 2; this.spawn = 0; this.guests = []; },
    update(dt, e) {
      this.spawn += dt;
      if (this.spawn > 0.58 && this.guests.length < 3) {
        this.spawn = 0;
        this.guests.push({ yes: Math.random() < 0.5, y: 50 + Math.random() * (e.displayHeight - 140), life: 1.15, t: 0 });
      }
      this.guests.forEach(g => { g.t += dt; });
      this.guests = this.guests.filter(g => { if (g.t >= g.life) { this.miss++; return false; } return true; });
      if (this.done >= this.need) e.winLevel();
      else if (this.miss > this.maxMiss || (e.elapsed >= e.duration && this.done < this.need)) e.loseLevel();
    },
    onTapAt(e, x, y) {
      const w = e.displayWidth;
      const g = this.guests.find(g => Math.abs(g.y - y) < 40);
      if (!g) return;
      const left = x < w * 0.5;
      if ((g.yes && left) || (!g.yes && !left)) { this.done++; this.guests = this.guests.filter(o => o !== g); e.juice(x, y, "#2e5cff", "SEATED"); }
      else { this.miss++; e.juice(x, y, "#f85149"); e.shake(); }
    },
    draw(ctx, e, w, h) {
      ctx.fillStyle = "#080c1a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2e5cff18"; ctx.fillRect(0, 0, w / 2, h); ctx.fillStyle = "#f8514918"; ctx.fillRect(w / 2, 0, w / 2, h);
      ctx.strokeStyle = "#30363d"; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
      ctx.fillStyle = "#2e5cff"; ctx.font = "bold 16px system-ui"; ctx.fillText("YES", 24, 32);
      ctx.fillStyle = "#f85149"; ctx.textAlign = "right"; ctx.fillText("NO", w - 24, 32); ctx.textAlign = "left";
      drawLogo(ctx, e, "polymarket-icon.png", w / 2, 28, 32);
      this.guests.forEach(g => {
        const col = g.yes ? "#2e5cff" : "#f85149";
        drawGlow(ctx, w / 2, g.y, 30, col);
        ctx.fillStyle = col; ctx.font = "bold 13px system-ui"; ctx.textAlign = "center";
        ctx.fillText(g.yes ? "YES guest" : "NO guest", w / 2, g.y);
      });
      ctx.textAlign = "left";
      e.drawProgress(this.done, this.need, w, h);
    },
  },
  {
    id: 14, name: "Proof of Vibes",
    boss: "Only tap 🚀 when the VC screams BUY. Ignore the rest.",
    instruction: "Tap 🚀 on BUY only", mobileInstruction: "Tap rocket on BUY",
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
    boss: "Tap to boost through gaps. SpaceX perp energy.",
    instruction: "Tap to fly up", mobileInstruction: "Tap to boost",
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
    id: 16, name: "Airdrop ER Rush",
    boss: "TGE casualties flood the ER. Wait for the scanner, read symptoms, tap the triage bin — fast.",
    instruction: "Scan → read symptom → tap matching bin", mobileInstruction: "Scanner → tap bin",
    logos: ["megaeth.png", "eigenlayer.png"],
    accent: "#ff6b6b",
    win: "ER cleared. Malpractice narrowly avoided.", fail: "Patient coded at TGE.",
    ctWin: ["@Airdrop: triaged", "@TGE: brutal"], ctFail: ["@Farm: still clicking", "@Dump: instant"],
    duration: 30,
    init(e) {
      this.done = 0; this.need = 8; this.miss = 0; this.maxMiss = 2;
      this.bins = [
        { id: "SOLD", label: "SOLD TGE", symptom: "Dumped entire bag at TGE open", color: "#f85149" },
        { id: "FARM", label: "STILL FARMING", symptom: "47 testnets · 0 tokens", color: "#d29922" },
        { id: "HACK", label: "HACKED", symptom: "Discord mod drained wallet", color: "#a371f7" },
        { id: "DELAY", label: "DELAYED TGE", symptom: "Mainnet soon™ since 2023", color: "#627eea" },
      ];
      this.cases = [
        { bin: "SOLD", logo: "megaeth.png" }, { bin: "FARM", logo: "eigenlayer.png" },
        { bin: "HACK", logo: "megaeth.png" }, { bin: "DELAY", logo: "eigenlayer.png" },
        { bin: "FARM", logo: "megaeth.png" }, { bin: "SOLD", logo: "eigenlayer.png" },
        { bin: "DELAY", logo: "megaeth.png" },
      ];
      this.caseIdx = 0;
      this.patient = null;
      this.scanX = 0.5;
      this.scannerW = 0.38;
      this.triageWindow = 1.4;
      this.spawnDelay = 0.28;
      this.beat = 0;
      this.pulse = 0;
    },
    spawnPatient(e) {
      const c = this.cases[this.caseIdx % this.cases.length];
      this.caseIdx++;
      this.patient = {
        x: -0.12, bin: c.bin, logo: c.logo,
        phase: "incoming", scanT: 0, speed: 0.52 + Math.random() * 0.1,
      };
    },
    update(dt, e) {
      this.pulse += dt * 4;
      this.beat += dt;
      if (!this.patient && this.beat >= this.spawnDelay) {
        this.beat = 0;
        this.spawnPatient(e);
      }
      if (this.patient) {
        const p = this.patient;
        if (p.phase === "incoming") {
          p.x += p.speed * dt;
          if (p.x >= this.scanX - 0.02) { p.phase = "scanning"; p.x = this.scanX; p.scanT = this.triageWindow; }
        } else if (p.phase === "scanning") {
          p.scanT -= dt;
          if (p.scanT <= 0) { this.miss++; this.patient = null; e.shake(); this.spawnDelay = 0.8; }
        }
      }
      if (this.done >= this.need) e.winLevel();
      else if (this.miss > this.maxMiss || (e.elapsed >= e.duration && this.done < this.need)) e.loseLevel();
    },
    triage(e, binId, x, y) {
      const p = this.patient;
      if (!p || p.phase !== "scanning") return;
      if (p.bin === binId) {
        this.done++;
        e.juice(x, y, "#3fb950", "STABLE");
        this.patient = null;
        this.spawnDelay = 0.5;
      } else {
        this.miss++;
        e.juice(x, y, "#f85149", "CODE BLUE");
        e.shake();
        this.patient = null;
        this.spawnDelay = 0.9;
      }
    },
    onTapAt(e, x, y) {
      const w = e.displayWidth; const ht = e.displayHeight;
      const binH = e.mobile ? 68 : 58;
      if (y < ht - binH - 8) return;
      const bi = Math.floor((x / w) * 4);
      if (bi < 0 || bi > 3) return;
      this.triage(e, this.bins[bi].id, x, y);
    },
    draw(ctx, e, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#12080c"); g.addColorStop(1, "#1a0a10");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      const scanL = (this.scanX - this.scannerW / 2) * w;
      const scanR = (this.scanX + this.scannerW / 2) * w;
      const scanY = h * 0.38;
      const scanH = h * 0.28;
      const pulse = 0.5 + Math.sin(this.pulse) * 0.5;

      ctx.strokeStyle = `rgba(255,107,107,${0.35 + pulse * 0.35})`;
      ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
      ctx.strokeRect(scanL, scanY, scanR - scanL, scanH);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,107,107,0.06)";
      ctx.fillRect(scanL, scanY, scanR - scanL, scanH);
      ctx.fillStyle = "#ff6b6b"; ctx.font = `bold ${e.mobile ? 10 : 9}px ui-monospace,monospace`;
      ctx.textAlign = "center"; ctx.fillText("◈ SCANNER ◈", w / 2, scanY - 8);

      ctx.fillStyle = "rgba(255,107,107,0.15)";
      for (let i = 0; i < 12; i++) {
        const lx = scanL + 8 + (i * (scanR - scanL - 16)) / 11;
        const ly = scanY + scanH - 18 + Math.sin(this.pulse + i * 0.5) * 6;
        ctx.fillRect(lx, ly, 3, 10);
      }

      if (this.patient) {
        const p = this.patient;
        const px = p.x * w;
        const py = scanY + scanH * 0.45;
        drawGlow(ctx, px, py, 40, p.phase === "scanning" ? "#ff6b6b" : "#627eea");
        drawLogo(ctx, e, p.logo, px, py, e.mobile ? 48 : 42);
        if (p.phase === "scanning") {
          const bin = this.bins.find(b => b.id === p.bin);
          drawCard(ctx, scanL + 6, scanY + 10, scanR - scanL - 12, scanH - 20, 10, "#21262dcc", bin.color + "88");
          ctx.fillStyle = bin.color; ctx.font = `bold ${e.mobile ? 12 : 11}px system-ui`;
          ctx.fillText(bin.symptom, w / 2, scanY + scanH * 0.42);
          ctx.fillStyle = "#ff6b6b"; ctx.font = `bold ${e.mobile ? 14 : 12}px system-ui`;
          ctx.fillText(`${Math.ceil(p.scanT)}s`, w / 2, scanY + scanH * 0.68);
        } else {
          ctx.fillStyle = "#8b949e"; ctx.font = "11px system-ui";
          ctx.fillText("incoming…", px, py + 34);
        }
      }

      const binH = e.mobile ? 68 : 58;
      const bw = w / 4;
      this.bins.forEach((b, i) => {
        const bx = i * bw + 3;
        const by = h - binH - 4;
        drawCard(ctx, bx, by, bw - 6, binH, 10, b.color + "22", b.color + "66");
        ctx.fillStyle = b.color; ctx.font = `bold ${e.mobile ? 9 : 8}px system-ui`;
        ctx.fillText(b.label, bx + (bw - 6) / 2, by + binH * 0.55);
      });
      ctx.textAlign = "left";
      e.drawProgress(this.done, this.need, w, h);
    },
  },
  {
    id: 17, name: "KOL Ventriloquist",
    boss: "Tap when NFA scrolls across. Don't tap the shill.",
    instruction: "Tap on NFA only", mobileInstruction: "Tap NFA",
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
    boss: "Meta roulette spins — only tap chips when LOCKED matches the wheel. Wrong narrative = strike.",
    instruction: "Tap chips during LOCK", mobileInstruction: "LOCK → tap meta",
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
    boss: "Thread scrolls nonstop. Tap 🚩 flags before they multiply — never tap green AUDITED pills.",
    instruction: "Tap flags · skip pills", mobileInstruction: "🚩 yes · pills no",
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
    boss: "3-phase offline protocol: breach CT lasers, survive flickering grass, then LOG OFF while the shrine orbits.",
    instruction: "Phase 1 · Breach GRASS", mobileInstruction: "Breach the grass",
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
        1: ["Phase 1 · Breach GRASS", "Breach the grass"],
        2: ["Phase 2 · Flicker hold 3s", "Hold when grass glows"],
        3: ["Phase 3 · Tap LOG OFF", "Drag + tap LOG OFF"],
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