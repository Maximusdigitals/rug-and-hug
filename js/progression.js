const RANKS = [
  { min: 0, title: "Unpaid Intern", emoji: "📎" },
  { min: 3, title: "Trench Analyst", emoji: "🕳️" },
  { min: 8, title: "Narrative Associate", emoji: "📈" },
  { min: 15, title: "VP of Vibes", emoji: "🚀" },
  { min: 25, title: "CT Main Character", emoji: "👑" },
];

const BADGE_DEFS = [
  { id: "first_clear", label: "First Clear", test: s => s.clears >= 1 },
  { id: "streak_5", label: "Hot Hand", test: s => s.bestStreak >= 5 },
  { id: "no_skip", label: "Pure DD", test: (s, g) => g && g.skippedDays?.size === 0 && g.dayIndex >= 19 },
  { id: "void_survivor", label: "Timeline Editor", test: (s, g) => g?.voidAlmighty && g.dayIndex >= 19 },
  { id: "daily_hero", label: "Daily Degen", test: s => s.dailyWins >= 3 },
  { id: "iron_conviction", label: "Diamond Hands", test: s => s.bestConviction >= 90 },
];

const BOSS_DAYS = new Set([5, 10, 15, 20]);

const ACT_THEMES = {
  1: { bg: "#07070a", accent: "#8b5cf6", orb: "rgba(139,92,246,0.35)" },
  2: { bg: "#06080f", accent: "#627eea", orb: "rgba(98,126,234,0.3)" },
  3: { bg: "#050a0c", accent: "#14f195", orb: "rgba(20,241,149,0.22)" },
  4: { bg: "#0a0608", accent: "#f87171", orb: "rgba(248,113,113,0.25)" },
};

const Progression = {
  isBossDay(dayIndex) {
    return BOSS_DAYS.has(dayIndex + 1);
  },

  actForDay(i) {
    if (i < 5) return 1;
    if (i < 10) return 2;
    if (i < 15) return 3;
    return 4;
  },

  applyActTheme(act) {
    const t = ACT_THEMES[act] || ACT_THEMES[1];
    document.documentElement.style.setProperty("--act-bg", t.bg);
    document.documentElement.style.setProperty("--act-accent", t.accent);
    document.body.dataset.act = String(act);
  },

  rankFor(stats) {
    const days = stats.daysCleared || 0;
    let r = RANKS[0];
    for (const x of RANKS) if (days >= x.min) r = x;
    return r;
  },

  syncBadges(data, game) {
    const earned = new Set(data.badges || []);
    BADGE_DEFS.forEach(b => {
      if (!earned.has(b.id) && b.test(data.stats, game)) earned.add(b.id);
    });
    data.badges = [...earned];
    return data.badges;
  },

  badgeLabels(ids) {
    return BADGE_DEFS.filter(b => ids.includes(b.id)).map(b => b.label);
  },

  recordLevelResult(data, won, game) {
    const s = data.stats;
    if (won) {
      s.clears++;
      s.daysCleared = Math.max(s.daysCleared, game.dayIndex + 1);
    } else {
      s.fails++;
    }
    s.bestStreak = Math.max(s.bestStreak, game.streak);
    s.bestConviction = Math.max(s.bestConviction, game.conviction);
    s.skips = game.skippedDays?.size || s.skips;
    this.syncBadges(data, game);
  },

  endingFor(game) {
    const skips = game.skippedDays?.size || 0;
    const conv = game.conviction;
    const voidMode = game.voidAlmighty;

    if (conv <= 0) {
      return { title: "Fired", icon: "✗", msg: "Conviction zero. Mandatory grass touching." };
    }
    if (game.mode === "daily") {
      return { title: "Daily Cleared", icon: "☀️", msg: `Today's challenge beaten. Conviction: ${conv}. See you tomorrow.` };
    }
    if (voidMode && skips > 3) {
      return { title: "Timeline Fractured", icon: "🌀", msg: `20 days survived via void skips. Conviction: ${conv}. Reality optional.` };
    }
    if (skips === 0 && conv >= 80) {
      return { title: "CT Main Character", icon: "👑", msg: `Perfect run. ${conv} conviction. Hyperbole Capital is proud.` };
    }
    if (skips >= 5) {
      return { title: "Survived (Barely)", icon: "😅", msg: `20 days with ${skips} skips. Conviction: ${conv}. CT forgives nothing.` };
    }
    if (conv >= 60) {
      return { title: "Senior Intern", icon: "✓", msg: `20 days survived. Conviction: ${conv}. Promotion pending.` };
    }
    return { title: "CT Survivor", icon: "🫡", msg: `20 days done. Conviction: ${conv}. Barely employable.` };
  },

  bossModifier(level, dayIndex) {
    if (!this.isBossDay(dayIndex)) return 1;
    return dayIndex + 1 === 20 ? 0.88 : 0.92;
  },
};