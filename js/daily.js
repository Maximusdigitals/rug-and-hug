const Daily = {
  todayKey() {
    return new Date().toISOString().slice(0, 10);
  },

  hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  },

  levelIndexForDate(dateKey, total = 20) {
    return this.hash(dateKey) % total;
  },

  levelForToday(total = 20) {
    const date = this.todayKey();
    const idx = this.levelIndexForDate(date, total);
    return { date, index: idx, levelId: idx + 1 };
  },

  isWonToday(data) {
    return data.daily?.date === this.todayKey() && data.daily.won;
  },

  markWon(data, levelId) {
    data.daily = { date: this.todayKey(), won: true, levelId };
    data.stats.dailyWins = (data.stats.dailyWins || 0) + 1;
  },
};