/** Procedural SFX — no asset files, Web Audio API */
const AudioFX = {
  ctx: null,
  muted: false,
  _last: {},

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) { /* no audio */ }
    const saved = localStorage.getItem("rug-or-hug-mute");
    if (saved === "1") this.muted = true;
  },

  unlock() {
    this.init();
    if (this.ctx?.state === "suspended") this.ctx.resume();
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("rug-or-hug-mute", this.muted ? "1" : "0");
    return this.muted;
  },

  _throttle(id, ms) {
    const t = performance.now();
    if (this._last[id] && t - this._last[id] < ms) return false;
    this._last[id] = t;
    return true;
  },

  tone(freq, dur, type = "sine", vol = 0.08, slide = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  noise(dur = 0.06, vol = 0.04) {
    if (this.muted || !this.ctx) return;
    const sr = this.ctx.sampleRate;
    const len = Math.floor(sr * dur);
    const buf = this.ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(this.ctx.destination);
    src.start();
  },

  tap() { if (this._throttle("tap", 40)) this.tone(520, 0.05, "triangle", 0.06); },
  hit() { if (this._throttle("hit", 50)) { this.tone(880, 0.07, "sine", 0.07, 200); } },
  miss() { if (this._throttle("miss", 80)) { this.tone(180, 0.12, "sawtooth", 0.05, -80); } },
  win() { this.tone(523, 0.1, "sine", 0.08); setTimeout(() => this.tone(784, 0.15, "sine", 0.08), 90); },
  lose() { this.tone(220, 0.2, "square", 0.05, -100); },
  tick() { if (this._throttle("tick", 200)) this.tone(440, 0.04, "sine", 0.04); },
  go() { this.tone(660, 0.12, "sine", 0.09, 120); },
  boss() { this.tone(110, 0.35, "sawtooth", 0.06); setTimeout(() => this.tone(165, 0.25, "sawtooth", 0.05), 120); },
  act() { this.tone(330, 0.2, "triangle", 0.07); setTimeout(() => this.tone(495, 0.25, "triangle", 0.07), 150); },
};