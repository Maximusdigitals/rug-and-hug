/** Set by GameEngine — lighter FX on mobile */
let PERF_LITE = false;

const Effects = {
  particles: [],
  floats: [],
  maxParticles: 48,

  burst(x, y, color, count = 12) {
    const n = PERF_LITE ? Math.min(5, count) : Math.min(count, 10);
    const cap = this.maxParticles - this.particles.length;
    const spawn = Math.min(n, cap);
    for (let i = 0; i < spawn; i++) {
      const a = (Math.PI * 2 * i) / spawn + Math.random() * 0.4;
      const s = PERF_LITE ? 60 + Math.random() * 80 : 80 + Math.random() * 120;
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: PERF_LITE ? 0.35 : 0.45 + Math.random() * 0.3,
        t: 0, color, r: PERF_LITE ? 2 : 2 + Math.random() * 2,
      });
    }
  },

  floatText(x, y, text, color = "#3fb950") {
    if (this.floats.length > 6) return;
    this.floats.push({ x, y, text, color, t: 0, life: PERF_LITE ? 0.75 : 0.95 });
  },

  update(dt) {
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.t += dt;
      if (p.t >= p.life) { ps.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
    }
    const fs = this.floats;
    for (let i = fs.length - 1; i >= 0; i--) {
      const f = fs[i];
      f.t += dt;
      if (f.t >= f.life) fs.splice(i, 1);
      else f.y -= 24 * dt;
    }
  },

  draw(ctx) {
    const ps = this.particles;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const a = 1 - p.t / p.life;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const fs = this.floats;
    if (fs.length) {
      ctx.font = "bold 14px system-ui,sans-serif";
      ctx.textAlign = "center";
      for (let i = 0; i < fs.length; i++) {
        const f = fs[i];
        ctx.globalAlpha = 1 - f.t / f.life;
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
    }
  },

  clear() {
    this.particles.length = 0;
    this.floats.length = 0;
  },
};

function drawGlow(ctx, x, y, r, color) {
  if (PERF_LITE) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color + "66");
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawCard(ctx, x, y, w, h, radius = 12, fill = "rgba(22,27,34,0.9)", stroke = "rgba(48,54,61,0.8)") {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (!PERF_LITE) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawLogo(ctx, engine, name, x, y, size) {
  const img = engine.image(name);
  if (!img) return;
  const half = size / 2;
  ctx.drawImage(img, x - half, y - half, size, size);
}

function drawVoidMark(ctx, w, h, style, elapsed = 0) {
  if (PERF_LITE && elapsed > 0 && Math.floor(elapsed * 2) % 2 === 0) return;
  ctx.save();
  ctx.globalAlpha = PERF_LITE ? 0.18 : 0.22;
  ctx.fillStyle = "rgba(180,200,255,0.55)";
  ctx.font = "9px ui-monospace, monospace";
  const t = "void.hl";
  const mark = (tx, ty) => ctx.fillText(t, tx, ty);
  switch (style) {
    case "receipt": mark(w - 52, h - 42); break;
    case "boot": mark(14, h - 12); break;
    case "chart": mark(w - 46, 38); break;
    case "meter": mark(12, h - 50); break;
    case "ticker": ctx.font = "8px monospace"; mark(w / 2 - 28, 28); break;
    case "pew": mark(w - 44, h - 58); break;
    case "pool": mark(w * 0.2 - 18, h - 8); break;
    case "barcode": mark(w - 68, h - 22); break;
    case "tv": mark(14, 22); break;
    case "stamp": mark(w - 48, 52); break;
    case "shield": mark(w - 42, h * 0.38); break;
    case "badge": mark(12, h - 60); break;
    case "invite": mark(w / 2 - 22, h - 8); break;
    case "vc": mark(w - 52, 52); break;
    case "serial": mark(w * 0.12 - 20, h * 0.12); break;
    case "wristband": mark(w / 2 - 18, h * 0.32 + 8); break;
    case "fineprint": mark(10, h - 6); break;
    case "channel": mark(w - 38, 18); break;
    case "thread": mark(12, h - 10); break;
    case "notif": mark(w - 58, 20); break;
    default: mark(w - 40, h - 8);
  }
  ctx.restore();
}