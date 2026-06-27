/* Hints, X skip posts, void.hl watermark — merged into LEVELS at load */

/** Natural, human skip promos — 3 variants per level, @voidhl woven in */
const SKIP_TWEETS = {
  1: [
    "Rug or Hug day 1 has me timing gas like it's a rave. Gas Fee Seance is actually hard lol — if you beat it first try you're a degen @voidhl",
    "ok who made Rug or Hug?? day 1 alone humbled me. Gas Fee Seance is not beginner friendly",
    "stuck on Gas Fee Seance in Rug or Hug. 20 days of this sounds insane. @voidhl you owe me therapy",
  ],
  2: [
    "Solana Trench Foot in Rug or Hug is chaos. rugs look like gems until they don't. only real trenchers passing this @voidhl",
    "day 2 of Rug or Hug and my reflexes are cooked. Trench Foot level does not miss",
    "if you beat Solana Trench Foot without sweating you're not human. Rug or Hug is brutal @voidhl",
  ],
  3: [
    "BTC Range Prison = pure sideways pain. Rug or Hug day 3 broke my range discipline lol",
    "who clears BTC Range Prison in Rug or Hug?? day 3 and i'm already tired @voidhl",
    "Rug or Hug day 3 is unfair. keeping that dot centered sounds easy until it isn't",
  ],
  4: [
    "Fear & Greed Exorcism got me aping at the worst times. Rug or Hug day 4 is a vibe check",
    "day 4 Rug or Hug — i keep tapping greed like an idiot. this game is actually difficult @voidhl",
    "if you pass Fear & Greed Exorcism you're built different. Rug or Hug don't play",
  ],
  5: [
    "Meme Whack-A-Rug in Rug or Hug has me tapping rugs like an idiot. day 5 is reflex hell @voidhl",
    "day 5 of Rug or Hug — whack the gems skip the rugs. sounds easy until you're cooked",
    "whoever clears Meme Whack-A-Rug first try is built different. Rug or Hug day 5 @voidhl",
  ],
  6: [
    "ETF Funeral Director is actually impossible. ghosts fade faster than my conviction. Rug or Hug day 6 @voidhl",
    "day 6 Rug or Hug — seating institutional money before they bail?? skill issue on my end",
    "if you beat ETF Funeral Director first try i don't trust you. Rug or Hug is no joke",
  ],
  7: [
    "Hyperliquid Baptism sent me to the wrong pool. Rug or Hug day 7 is humbling @voidhl",
    "day 7 of Rug or Hug and i got liquidated into oil long. PERPS or perish is real",
    "who clears Hyperliquid Baptism?? Rug or Hug day 7 has me questioning everything",
  ],
  8: [
    "HIP-3 Possession level exorcised my portfolio. Rug or Hug day 8 hits @voidhl",
    "day 8 — commodities attacking me and i'm just tapping panic. Rug or Hug is fast and mean",
    "if you beat HIP-3 Possession you're a different breed. this game does not let up",
  ],
  9: [
    "Grandma's SEC Dodge has me dragging a wallet through subpoena rain. Rug or Hug day 9 @voidhl",
    "day 9 of Rug or Hug — catch USDC dodge SEC letters. grandma gameplay is stressful",
    "who clears Grandma's SEC Dodge without getting hit twice?? Rug or Hug day 9 lol",
  ],
  10: [
    "Stablecoin Trust Fall — caught the wrong coin. Rug or Hug day 10 got me @voidhl",
    "day 10 and depegs are falling on my head. Rug or Hug trust fall is not it",
    "if you only catch USDC in Rug or Hug you're a degen. i'm catching rugs apparently",
  ],
  11: [
    "ZEC Identity Crisis — tapped too early every time. Rug or Hug day 11 is stressful @voidhl",
    "day 11 of Rug or Hug. wait for the eye they said. i did not wait",
    "shield timing in Rug or Hug is actually hard. only degens clearing this",
  ],
  12: [
    "Bot Union Bargain timing is brutal. Rug or Hug day 12 has me missing every ACCEPT window @voidhl",
    "day 12 Rug or Hug — tap union demands on the beat. AI strike gameplay is mean",
    "if you beat Bot Union Bargain first try you're not human. Rug or Hug day 12 humbled me",
  ],
  13: [
    "Polymarket Wedding seating chaos. YES left NO right my brain can't. Rug or Hug day 13 @voidhl",
    "day 13 of Rug or Hug and the reception is a brawl. wedding level is unfair",
    "who seats every guest in Polymarket Wedding?? Rug or Hug day 13 is fast af",
  ],
  14: [
    "Proof of Vibes — i rated a rug bullish. Rug or Hug day 14 @voidhl",
    "day 14 VC screams BUY and my hands don't listen. Rug or Hug is actually difficult",
    "if you only tap rockets on BUY you're a degen. i am not that degen yet",
  ],
  15: [
    "Pre-IPO Astronaut g-force rekt me. Rug or Hug day 15 is wild @voidhl",
    "day 15 gap boosting in Rug or Hug — one mistap and you're done. so fast",
    "who flies through every gap in Rug or Hug?? day 15 has me mad lol",
  ],
  16: [
    "Airdrop ER Rush at TGE is hell. 4 bins 2 seconds i'm coding blue. Rug or Hug day 16 @voidhl",
    "day 16 triage patients in Rug or Hug — this level is actually unfair",
    "if you beat Airdrop ER Rush you're not normal. Rug or Hug day 16 broke me",
  ],
  17: [
    "KOL Ventriloquist — shilled without NFA. Rug or Hug day 17 got me @voidhl",
    "day 17 i tap every WAGMI like an idiot. Rug or Hug NFA level is tricky",
    "only degens pass KOL Ventriloquist. Rug or Hug day 17 is humbling lol",
  ],
  18: [
    "Narrative Whiplash — bought last week's meta again. Rug or Hug day 18 @voidhl",
    "day 18 meta rotates faster than CT. Rug or Hug is genuinely hard",
    "if you catch the right balls in Narrative Whiplash respect. i'm lost",
  ],
  19: [
    "Zach Thread Boss Fight — flags everywhere. Rug or Hug day 19 @voidhl",
    "day 19 red flags spawning faster than i can tap. Rug or Hug boss level is mean",
    "who clears the Zach thread in Rug or Hug?? only degens fr",
  ],
  20: [
    "final day Touch Grass and CT notifs won't leave me alone. Rug or Hug day 20 @voidhl",
    "day 20 of Rug or Hug — almost made it then got hit by HYPE +12%. so close",
    "if you beat Touch Grass and actually touch grass you're the main character. Rug or Hug is insane",
  ],
};

const SKIP_FALLBACK = [
  (d, n) => `stuck on Rug or Hug day ${d} (${n}). this game is actually hard — only degens finishing it @voidhl`,
  (d, n) => `Rug or Hug day ${d} humbled me. "${n}" is unfair lol @voidhl`,
  (d, n) => `paying the skip tax bc day ${d} in Rug or Hug is brutal. if you beat "${n}" you're built different`,
];

function buildSkipTweet(level) {
  const pool = SKIP_TWEETS[level.id];
  if (pool?.length) return pool[Math.floor(Math.random() * pool.length)];
  const f = SKIP_FALLBACK[Math.floor(Math.random() * SKIP_FALLBACK.length)];
  return f(level.id, level.name);
}

const LEVEL_ENRICHMENT = {
  1: { hint: "Watch the orb turn gold — tap only in the TAP ZONE line. Early taps count as misses.", voidMark: "receipt" },
  2: { hint: "Green ring = gem. Red ring + RUG label = skip it. You can miss 2 rugs max.", voidMark: "boot" },
  3: { hint: "Drag to center. Walls close slowly — stay in the orange safe zone for the full timer.", voidMark: "chart" },
  4: { hint: "Only tap when meter is in the GREEN zone (left side). Never tap on red greed.", voidMark: "meter" },
  5: { hint: "Only tap BONK/WIF gems with green rings. Red RUG circles = hands off. Miss 2 rugs or 2 timeouts = rekt.", voidMark: "ticker" },
  6: { hint: "Tap the floating ghost directly — not the pew below. They fade in ~1.4s. Seat 6 total.", voidMark: "pew" },
  7: { hint: "Pools shuffle — only PERPS is safe. Drag into the green pool at the dunk line, release, repeat 5×. Wrong pool = one strike.", voidMark: "pool" },
  8: { hint: "Only tap commodities when they PULSE/glow. Oil, Gold, Silver — tap the active one.", voidMark: "barcode" },
  9: { hint: "Drag Grandma's wallet left/right. Catch blue USDC — dodge SEC envelopes and red scam coins. 2 hits = fired.", voidMark: "tv" },
  10: { hint: "Catch blue USDC only. Red-glow coins are depegging — let them fall.", voidMark: "stamp" },
  11: { hint: "Wait for the 👁 eye, then tap SHIELD fast. Tapping early counts as a miss.", voidMark: "shield" },
  12: { hint: "Demands slide to the green ACCEPT line — tap on the beat like Gas Fee Seance. Early/late taps count as misses.", voidMark: "badge" },
  13: { hint: "YES guests go LEFT. NO guests go RIGHT. Tap the side while guest is in the middle.", voidMark: "invite" },
  14: { hint: "Only tap when VC screams BUY and you see 🚀. 'Hard pass' = hands off.", voidMark: "vc" },
  15: { hint: "Tap to boost through gaps. Time your taps — coast through the red obstacle holes.", voidMark: "serial" },
  16: { hint: "Patient must be IN the scanner (center box). Read the symptom text, then tap the matching triage bin below before the timer hits 0.", voidMark: "wristband" },
  17: { hint: "Tap ONLY when 'NFA' appears. WAGMI / 100x / GEM = do not tap.", voidMark: "fineprint" },
  18: { hint: "Wait for LOCKED on the wheel — only then tap chips matching that meta. Tapping during SPIN/WHIPLASH = strike.", voidMark: "channel" },
  19: { hint: "Tap 🚩 flags only. Green AUDITED/SAFU pills are bait. Escaped flags split into two — don't let the swarm hit 10.", voidMark: "thread" },
  20: { hint: "3 phases: (1) breach grass through lasers, (2) hold 3s while grass flickers + missiles chase you, (3) orbiting grass — drag AND tap LOG OFF before the bar empties. Dopamine bar = death.", voidMark: "notif" },
};

LEVELS.forEach((lv) => {
  const m = LEVEL_ENRICHMENT[lv.id];
  if (m) Object.assign(lv, m);
  lv.duration = Math.round((lv.duration || 26) + 6);
  lv.buildSkipTweet = () => buildSkipTweet(lv);
});