const STORAGE_KEY = "rug-or-hug-v2";

const Storage = {
  defaults() {
    return {
      version: 2,
      run: null,
      stats: {
        runs: 0,
        clears: 0,
        fails: 0,
        rugsTapped: 0,
        bestStreak: 0,
        bestConviction: 0,
        daysCleared: 0,
        skips: 0,
        dailyWins: 0,
      },
      badges: [],
      daily: { date: "", won: false, levelId: 0 },
      settings: { tutorialSeen: false },
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.defaults();
      const data = JSON.parse(raw);
      return { ...this.defaults(), ...data, stats: { ...this.defaults().stats, ...data.stats } };
    } catch (_) {
      return this.defaults();
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) { /* quota */ }
  },

  hasRun(data) {
    return data?.run && data.run.dayIndex >= 0 && data.run.conviction > 0;
  },

  snapshotRun(game) {
    return {
      dayIndex: game.dayIndex,
      conviction: game.conviction,
      streak: game.streak,
      failCounts: { ...game.failCounts },
      skippedDays: [...game.skippedDays],
      mode: game.mode || "career",
      dailyLevelId: game.dailyLevelId || null,
    };
  },

  restoreRun(game, run) {
    if (!run) return;
    game.dayIndex = run.dayIndex;
    game.conviction = run.conviction;
    game.streak = run.streak;
    game.failCounts = { ...run.failCounts };
    game.skippedDays = new Set(run.skippedDays || []);
    game.mode = run.mode || "career";
    game.dailyLevelId = run.dailyLevelId;
  },
};