/** Set by GameEngine — lighter FX on mobile */
let PERF_LITE = false;

const Effects = {
  particles: [],
  floats: [],
  ripples: [],
  maxParticles: 64,

  burst(x, y, color, count = 12) {
    const n = PERF_LITE ? Math.min(6, count) : Math.min(count, 14);
    const cap = this.maxParticles - this.particles.length;
    const spawn = Math.min(n, cap);
    for (let i = 0; i < spawn; i++) {
      const a = (Math.PI * 2 * i) / spawn + Math.random() * 0.5;
      const s = PERF_LITE ? 70 + Math.random() * 90 : 90 + Math.random() * 140;
      this.particles.push({
        x, y, px: x, py: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: PERF_LITE ? 0.4 : 0.5 + Math.random() * 0.35,
        t: 0, color, r: PERF_LITE ? 2.5 : 2 + Math.random() * 3,
        trail: !PERF_LITE,
      });
    }
  },

  ripple(x, y, color, maxR = 48) {
    if (this.ripples.length > 8) return;
    this.ripples.push({ x, y, color, r: 8, maxR, t: 0, life: PERF_LITE ? 0.35 : 0.5 });
  },

  floatText(x, y, text, color = "#3fb950") {
    if (this.floats.length > 8) return;
    this.floats.push({ x, y, text, color, t: 0, life: PERF_LITE ? 0.8 : 1.05, scale: 1 });
  },

  update(dt) {
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.t += dt;
      if (p.t >= p.life) { ps.splice(i, 1); continue; }
      p.px = p.x; p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      p.vx *= 1 - dt * 0.8;
    }
    const rs = this.ripples;
    for (let i = rs.length - 1; i >= 0; i--) {
      const r = rs[i];
      r.t += dt;
      if (r.t >= r.life) { rs.splice(i, 1); continue; }
      const k = r.t / r.life;
      r.r = 8 + k * r.maxR;
    }
    const fs = this.floats;
    for (let i = fs.length - 1; i >= 0; i--) {
      const f = fs[i];
      f.t += dt;
      if (f.t >= f.life) fs.splice(i, 1);
      else {
        f.y -= 28 * dt;
        f.scale = 1 + f.t * 0.15;
      }
    }
  },

  draw(ctx) {
    const rs = this.ripples;
    for (let i = 0; i < rs.length; i++) {
      const r = rs[i];
      const a = 1 - r.t / r.life;
      ctx.save();
      ctx.globalAlpha = a * 0.55;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const ps = this.particles;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const a = 1 - p.t / p.life;
      if (p.trail) {
        ctx.save();
        ctx.globalAlpha = a * 0.35;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.r;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.6 + a * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const fs = this.floats;
    if (fs.length) {
      ctx.textAlign = "center";
      for (let i = 0; i < fs.length; i++) {
        const f = fs[i];
        const a = 1 - f.t / f.life;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(f.x, f.y);
        ctx.scale(f.scale, f.scale);
        ctx.font = "bold 15px system-ui,sans-serif";
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, 0, 0);
        ctx.restore();
      }
      ctx.textAlign = "left";
    }
  },

  clear() {
    this.particles.length = 0;
    this.floats.length = 0;
    this.ripples.length = 0;
  },
};

function drawBackdrop(ctx, w, h, accent = "#8b5cf6", elapsed = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0a0a10");
  g.addColorStop(0.55, "#080810");
  g.addColorStop(1, "#050508");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (!PERF_LITE) {
    const pulse = 0.5 + Math.sin(elapsed * 1.2) * 0.15;
    drawGlow(ctx, w * 0.5, h * 0.35, Math.min(w, h) * 0.45 * pulse, accent);
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = accent + "11";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawGlow(ctx, x, y, r, color) {
  if (PERF_LITE) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color + "88");
  g.addColorStop(0.45, color + "33");
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawCard(ctx, x, y, w, h, radius = 12, fill = "rgba(22,27,34,0.92)", stroke = "rgba(255,255,255,0.08)") {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (!PERF_LITE) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    const shine = ctx.createLinearGradient(x, y, x, y + h * 0.4);
    shine.addColorStop(0, "rgba(255,255,255,0.06)");
    shine.addColorStop(1, "transparent");
    ctx.fillStyle = shine;
    ctx.fill();
  }
}

function drawLogo(ctx, engine, name, x, y, size) {
  const img = engine.image(name);
  if (!img) return;
  const half = size / 2;
  if (!PERF_LITE) drawGlow(ctx, x, y, half * 1.1, "rgba(255,255,255,0.15)");
  ctx.drawImage(img, x - half, y - half, size, size);
}

function drawVoidMark(ctx, w, h, style, elapsed = 0) {
  if (PERF_LITE && elapsed > 0 && Math.floor(elapsed * 2) % 2 === 0) return;
  ctx.save();
  ctx.globalAlpha = PERF_LITE ? 0.18 : 0.24;
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