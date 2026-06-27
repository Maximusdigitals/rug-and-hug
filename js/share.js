const GAME_URL = "https://maximusdigitals.github.io/rug-and-hug/";

const ShareCard = {
  render(game, data) {
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1080;
    const ctx = c.getContext("2d");
    const rank = Progression.rankFor(data.stats);
    const day = game.dayIndex + 1;
    const won = game.conviction > 0 && (game.mode === "daily" || day >= 20);

    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#0c0c12");
    grad.addColorStop(0.5, "#12101a");
    grad.addColorStop(1, "#07070a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.strokeStyle = "rgba(139,92,246,0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, 984, 984);

    ctx.fillStyle = "#8b5cf6";
    ctx.font = "bold 28px system-ui,sans-serif";
    ctx.fillText("RUG OR HUG", 80, 120);

    ctx.fillStyle = "#f4f4f5";
    ctx.font = "bold 72px system-ui,sans-serif";
    ctx.fillText(won ? "CLEARED" : `DAY ${day}`, 80, 240);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "36px system-ui,sans-serif";
    const lvl = game.level?.name || "Internship";
    ctx.fillText(lvl, 80, 310);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 48px system-ui,sans-serif";
    ctx.fillText(`Conviction ${game.conviction}`, 80, 420);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "36px system-ui,sans-serif";
    ctx.fillText(`Streak ${game.streak} · ${rank.emoji} ${rank.title}`, 80, 500);

    ctx.fillStyle = "#71717a";
    ctx.font = "28px system-ui,sans-serif";
    ctx.fillText(`Best streak ${data.stats.bestStreak} · Clears ${data.stats.clears}`, 80, 580);

    const badges = Progression.badgeLabels(data.badges || []);
    if (badges.length) {
      ctx.fillStyle = "#22d3ee";
      ctx.font = "24px system-ui,sans-serif";
      ctx.fillText(badges.slice(0, 4).join(" · "), 80, 660);
    }

    ctx.fillStyle = "#52525b";
    ctx.font = "22px system-ui,sans-serif";
    ctx.fillText("maximusdigitals.github.io/rug-and-hug", 80, 980);

    return c;
  },

  tweetText(game, data) {
    const day = game.dayIndex + 1;
    const name = game.level?.name || "";
    if (game.mode === "daily") {
      return `cleared today's Rug or Hug daily (${name}). conviction ${game.conviction} @voidhl ${GAME_URL}`;
    }
    return `Rug or Hug day ${day} cleared — ${name}. conviction ${game.conviction}. this game is actually hard @voidhl ${GAME_URL}`;
  },

  async share(game, data) {
    const canvas = this.render(game, data);
    const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
    const file = new File([blob], "rug-or-hug.png", { type: "image/png" });
    const text = this.tweetText(game, data);

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "Rug or Hug", text, files: [file] });
        return true;
      } catch (_) { /* fall through */ }
    }

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rug-or-hug-score.png";
    a.click();
    URL.revokeObjectURL(a.href);
    return true;
  },
};