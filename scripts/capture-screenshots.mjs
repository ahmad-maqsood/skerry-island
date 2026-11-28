// Captures the README screenshots from the real, current Skerry UI in headless Chrome or Edge.
// Run it by hand, or from the manual "Screenshots" workflow in GitHub Actions; nothing else starts it.
//
//   pnpm screenshots                     every shot, into docs/assets/screenshots
//   pnpm screenshots music settings      only the shots whose scene or file name matches
//   pnpm screenshots --scale=2           pixel density (default 3, so a 700 px island is 2100 px wide)
//   pnpm screenshots --out=./out         another folder
//   pnpm screenshots --push              then commit the new pictures into docs/assets/screenshots and push
//                                        the checked-out branch (--branch=<name> names another; push-screenshots.mjs)
//
// Every picture is 16:9 (the Microsoft Store gallery shows that shape; the README uses the same files).
//
// The production React components render over the fictional fixtures in
// tests/screenshots/demoData.ts (the OS-facing Tauri commands are mocked). Each page is drawn at
// a high device pixel ratio and cropped on whole pixels, so text and icon edges are crisp.
// Run it on Windows to get Segoe UI like the installed app; CHROME_PATH picks the browser.
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gitRunner, pushScreenshots, resolveBranch } from "./push-screenshots.mjs";
import { withRegressionBrowser } from "./run-regression.mjs";

export const SHOTS = [
  { file: "screenshot-pixel-cat.png", scene: "cat" },
  { file: "screenshot-collapsed-clock.png", scene: "clock" },
  { file: "screenshot-collapsed-notification.png", scene: "notification" },
  { file: "screenshot-messages.png", scene: "messages" },
  { file: "screenshot-music.png", scene: "music" },
  { file: "screenshot-todos.png", scene: "todos" },
  { file: "screenshot-translation.png", scene: "translation" },
  { file: "screenshot-file-shelf.png", scene: "shelf" },
  { file: "screenshot-system.png", scene: "system" },
  { file: "screenshot-settings.png", scene: "settings" },
  { file: "screenshot-themes.png", scene: "themes" },
];

export const DEFAULT_SCALE = 3;
const VIEWPORT = { width: 1920, height: 1080 };
/** Every picture is 16:9, the shape of the Microsoft Store gallery; the README shows the same files. */
const ASPECT = 16 / 9;
/** How much room the island gets in its picture: its width times this, at least. */
const ROOM = 1.6;
const THEMES = [
  { material: "midnight", label: "Midnight" },
  { material: "liquidGlass", label: "Liquid Glass" },
  { material: "frostedGlass", label: "Frosted Glass" },
];
const SCENE_TIMEOUT_MS = 60_000;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function parseArgs(argv) {
  const options = {};
  const words = [];
  for (const arg of argv) {
    const match = /^--([a-z-]+)=(.*)$/.exec(arg);
    if (match) options[match[1]] = match[2];
    else if (!arg.startsWith("--")) words.push(arg);
  }
  return { options, words };
}

export function sceneUrl(base, shot, extra = {}) {
  const url = new URL("../screenshots/scene.html", base);
  url.search = new URLSearchParams({ scene: shot.scene, ...extra }).toString();
  return url.toString();
}

export function selectShots(shots, words) {
  if (!words.length) return shots;
  const selected = shots.filter((shot) => words.some((word) => shot.file.includes(word) || shot.scene === word));
  if (!selected.length) throw new Error(`No shot matches ${words.join(", ")}. Shots: ${shots.map((shot) => shot.scene).join(", ")}.`);
  return selected;
}

/** The pixel density from --scale (whole numbers from 1 to 4); sharp edges need a whole number. */
export function parseScale(value) {
  if (value === undefined) return DEFAULT_SCALE;
  const scale = Number(value);
  if (!Number.isInteger(scale) || scale < 1 || scale > 4) throw new Error(`--scale must be a whole number from 1 to 4, got "${value}".`);
  return scale;
}

/** Width and height in pixels, read from a PNG's header. */
export function pngSize(png) {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

/**
 * The 16:9 area to capture around the island: centred on it, wide enough to give it some desktop on
 * both sides, tall enough to hold all of it, and never outside the page (the island sits on the top edge).
 */
export function frameClip(box, viewport = VIEWPORT) {
  const width = Math.min(viewport.width, Math.max(box.width * ROOM, (box.y + box.height + 40) * ASPECT));
  const height = width / ASPECT;
  const x = Math.min(Math.max(box.x + box.width / 2 - width / 2, 0), viewport.width - width);
  return snapClip({ x, y: 0, width, height });
}

/** A crop on whole CSS pixels, so every edge lands on a device pixel and nothing is resampled. */
export function snapClip(box) {
  const x = Math.floor(box.x);
  const y = Math.floor(box.y);
  return { x, y, width: Math.ceil(box.x + box.width) - x, height: Math.ceil(box.y + box.height) - y };
}

const evaluate = async (session, expression, awaitPromise = false) =>
  (await session.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise })).result?.value;

async function setViewport(session, width, height, scale) {
  await session.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
}

async function waitForScene(session, scene) {
  const deadline = Date.now() + SCENE_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = JSON.parse(await evaluate(session, `JSON.stringify({
      ready: document.documentElement.dataset.sceneReady ?? "",
      error: document.documentElement.dataset.sceneError ?? "",
      capture: document.documentElement.dataset.capture ?? "",
    })`) ?? "{}");
    if (state.error) throw new Error(`Scene "${scene}" failed:\n${state.error}`);
    if (state.ready === "true") return JSON.parse(state.capture);
    await sleep(250);
  }
  throw new Error(`Scene "${scene}" did not report ready within ${SCENE_TIMEOUT_MS / 1000}s.`);
}

async function shoot(session, shot, extra, scale, tight = false) {
  await setViewport(session, VIEWPORT.width, VIEWPORT.height, scale);
  await session.send("Page.navigate", { url: "about:blank" });
  await session.send("Page.navigate", { url: extra.url });
  const box = await waitForScene(session, shot.scene);
  const clip = tight ? snapClip(box) : frameClip(box);
  // Fonts and the last transitions settle before the pixels are taken.
  await evaluate(session, "document.fonts.ready.then(() => true)", true);
  await sleep(400);
  const { data } = await session.send("Page.captureScreenshot", { format: "png", clip: { ...clip, scale: 1 }, captureBeyondViewport: false });
  if (!data) throw new Error(`The browser returned no image for "${shot.scene}".`);
  return Buffer.from(data, "base64");
}

/** The desktop colour the scenes draw with ?wallpaper=1 (tests/screenshots/scene.html). */
const WALLPAPER = `radial-gradient(60% 70% at 18% 30%, #7c3aed 0%, transparent 70%),
  radial-gradient(55% 65% at 82% 22%, #0ea5e9 0%, transparent 70%),
  radial-gradient(60% 60% at 55% 95%, #f43f5e 0%, transparent 70%), #0f172a`;

/** The three styles side by side on the desktop colour, each with its name below, on a 16:9 canvas. */
async function composeThemes(session, parts, scale) {
  const width = VIEWPORT.width;
  const height = Math.round(width / ASPECT);
  const gap = 48;
  const card = Math.round((width - 4 * gap) / parts.length);
  const sizes = parts.map((part) => pngSize(part.png));
  const cardHeight = Math.round(Math.max(...sizes.map((size) => size.height)) * (card / Math.max(...sizes.map((size) => size.width))));
  const top = Math.round((height - cardHeight - 60) / 2);
  const cards = parts.map((part, index) => {
    const left = gap + index * (card + gap);
    const ratio = Math.min(card / sizes[index].width, cardHeight / sizes[index].height);
    return `<img src="data:image/png;base64,${part.png.toString("base64")}" style="position:absolute;left:${left}px;top:${top}px;width:${sizes[index].width * ratio}px;height:${sizes[index].height * ratio}px;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.45)">`
      + `<div style="position:absolute;left:${left}px;top:${top + cardHeight + 18}px;font:600 26px 'Segoe UI Variable','Segoe UI',Inter,system-ui,sans-serif;color:#f1f5f9">${part.label}</div>`;
  }).join("");
  await setViewport(session, width, height, scale);
  await session.send("Page.navigate", { url: "about:blank" });
  await evaluate(session, `document.documentElement.style.background = ${JSON.stringify(WALLPAPER)};
    document.body.style.cssText = "margin:0";
    document.body.innerHTML = ${JSON.stringify(cards)};
    Promise.all([...document.images].map((image) => image.decode())).then(() => document.fonts.ready).then(() => true)`, true);
  await sleep(200);
  const { data } = await session.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width, height, scale: 1 } });
  return Buffer.from(data, "base64");
}

async function main() {
  const argv = process.argv.slice(2);
  const { options, words } = parseArgs(argv);
  const scale = parseScale(options.scale);
  const out = path.resolve(root, options.out ?? "docs/assets/screenshots");
  const shots = selectShots(SHOTS, words);
  // With --push the branch is settled before the capture, so a detached HEAD fails now, not after minutes of work.
  const push = argv.includes("--push") ? { run: gitRunner(root) } : null;
  if (push) push.branch = resolveBranch(push.run, options.branch);
  mkdirSync(out, { recursive: true });
  // The regression helper serves this checkout with Vite and drives a headless browser over the
  // DevTools protocol. Its first page only proves the server answers.
  await withRegressionBrowser(root, "island-tour.html", async ({ session, base }) => {
    for (const shot of shots) {
      const started = Date.now();
      const target = path.join(out, shot.file);
      const look = { wallpaper: "1" };
      let png;
      if (shot.scene === "themes") {
        const parts = [];
        for (const { material, label } of THEMES) {
          const messages = { scene: "messages" };
          parts.push({ label, png: await shoot(session, messages, { url: sceneUrl(base, messages, { ...look, material }) }, scale, true) });
        }
        png = await composeThemes(session, parts, Math.min(scale, 2));
      } else {
        png = await shoot(session, shot, { url: sceneUrl(base, shot, look) }, scale);
      }
      writeFileSync(target, png);
      const { width, height } = pngSize(png);
      console.log(`✓ ${shot.file}  ${width}×${height}px  ${Math.round(statSync(target).size / 1024)} KB  ${((Date.now() - started) / 1000).toFixed(1)}s`);
    }
  });
  console.log(`Captured ${shots.length} screenshot(s) at ${scale}x into ${path.relative(root, out) || "."}.`);
  if (push) pushScreenshots({ root, files: shots.map((shot) => path.join(out, shot.file)), branch: push.branch, run: push.run });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(() => process.exit(0), (error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
}
