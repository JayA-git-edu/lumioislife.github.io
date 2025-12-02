const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "assets", "data", "games.json");
const MAX_GAMES = 400;

const IGNORE = new Set([
  "assets",
  "scripts",
  "node_modules",
  ".git",
  ".github",
  ".cursor",
  "terminals",
]);

const PREFERRED_COVERS = [
  "thumbnail.png",
  "thumb.png",
  "cover.png",
  "logo.png",
  "icon.png",
  "banner.png",
  "preview.png",
];

const COVER_FOLDERS = [".", "assets", "assets/img", "assets/images", "img", "images", "media"];

const TAGS = [
  "Action",
  "Adventure",
  "Arcade",
  "Puzzle",
  "Strategy",
  "Simulation",
  "Racing",
  "Sports",
  "Casual",
  "Platformer",
  "Shooter",
  "Roguelike",
  "Survival",
  "Multiplayer",
  "Retro",
];

const CONTROL_SETS = [
  {
    scheme: "Keyboard & Mouse",
    steps: ["WASD / Arrow keys to move", "Space / Enter to interact", "Mouse to aim & confirm"],
  },
  {
    scheme: "Touch / Pointer",
    steps: ["Tap to move or select", "Pinch to zoom (if supported)", "Long-press for alt actions"],
  },
  {
    scheme: "Controller",
    steps: ["Left stick to move", "A / X to jump or confirm", "B / O to cancel / dash"],
  },
];

const LANGUAGES = ["English", "Español", "Français", "Deutsch", "日本語", "한국어", "Português", "中文"];

function hashString(input) {
  return input.split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function formatName(slug) {
  return slug
    .replace(/-|_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickTags(slug) {
  const h = hashString(slug);
  const chosen = new Set();
  for (let i = 0; chosen.size < 3; i += 1) {
    const tag = TAGS[(h + i * 17) % TAGS.length];
    chosen.add(tag);
  }
  return Array.from(chosen);
}

function pickControls(slug) {
  return CONTROL_SETS[hashString(slug) % CONTROL_SETS.length];
}

function pickLanguages(slug) {
  const h = hashString(slug);
  const result = new Set(["English"]);
  for (let i = 1; result.size < 3; i += 1) {
    result.add(LANGUAGES[(h + i * 13) % LANGUAGES.length]);
  }
  return Array.from(result);
}

function buildDescription(name, tags) {
  const vibe = [
    "ultra-fluid combat loops",
    "neon-washed vistas",
    "tactile puzzle beats",
    "quick-hit arcade energy",
    "precision competitive flow",
    "chill idle progression",
    "story sparks between encounters",
  ];
  const feature = vibe[hashString(name) % vibe.length];
  return `${name} blends ${tags.join(", ")} gameplay with ${feature}, delivering a premium browser experience you can jump into instantly.`;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function findCover(slugDir) {
  for (const folder of COVER_FOLDERS) {
    const dirPath = folder === "." ? slugDir : path.join(slugDir, folder);
    if (!fs.existsSync(dirPath)) continue;
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) continue;

    for (const preferred of PREFERRED_COVERS) {
      const candidate = path.join(dirPath, preferred);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return toPosix(path.relative(ROOT, candidate));
      }
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const fallback = entries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"));
    if (fallback) {
      return toPosix(path.relative(ROOT, path.join(dirPath, fallback.name)));
    }
  }
  return null;
}

function collectGames() {
  const dirEntries = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !IGNORE.has(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const games = [];

  for (const entry of dirEntries) {
    if (games.length >= MAX_GAMES) break;

    const slug = entry.name;
    const folder = path.join(ROOT, slug);
    const indexPath = path.join(folder, "index.html");
    if (!fs.existsSync(indexPath)) continue;

    const cover = findCover(folder);
    const name = formatName(slug);
    const tags = pickTags(slug);
    const description = buildDescription(name, tags);
    const h = hashString(slug);

    games.push({
      id: `lumio-${games.length + 1}`,
      slug,
      name,
      cover,
      playUrl: `${toPosix(slug)}/index.html`,
      tags,
      category: tags[0],
      description,
      shortDescription: description.split(".")[0] + ".",
      releaseYear: 2010 + (h % 15),
      sessionLength: ["3-5 min", "5-10 min", "10-20 min"][(h >> 3) % 3],
      difficulty: ["Relaxed", "Moderate", "Intense"][(h >> 5) % 3],
      controls: pickControls(slug),
      languages: pickLanguages(slug),
      rating: ((h % 40) + 60) / 10,
    });
  }

  return games;
}

function main() {
  const games = collectGames();
  if (!games.length) {
    console.error("No games discovered. Aborting.");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: games.length,
        games,
      },
      null,
      2,
    ),
  );

  console.log(`Generated ${games.length} Lumio entries -> ${path.relative(ROOT, OUTPUT)}`);
}

main();

