#!/usr/bin/env node
/**
 * Syncs Skerry's official screenshots, app mark, release metadata, and dynamic
 * repo metrics (material count, framework versions, Rust edition, plugin version)
 * into `website/src/assets/` and `website/src/data/releaseSnapshot.json`.
 *
 * When running inside `ahmad-maqsood/skerry-island/website/`:
 *   - Copies screenshots from `../docs/assets/screenshots/`
 *   - Copies app mark from `../src-tauri/icons/mark.svg`
 *   - Reads `../package.json`, `../src-tauri/Cargo.toml`, and
 *     `../src/features/appearance/types.ts` directly from the checked-out commit
 *   - Queries GitHub Releases API for the latest published release tag,
 *     `.exe` / `.msi` download links, exact installer sizes, and plugin package version
 *
 * When running standalone (outside the monorepo):
 *   - Falls back automatically to `https://raw.githubusercontent.com/<REPO>/<REF>/...`
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = path.resolve(__dirname, '..');
const PARENT_REPO_DIR = path.resolve(WEBSITE_DIR, '..');

const REPO = process.env.SKERRY_REPO || 'ahmad-maqsood/skerry-island';
const REF = process.env.SKERRY_REF || 'HEAD';
const TOKEN = process.env.GITHUB_TOKEN || '';
const STRICT = process.env.SYNC_STRICT === 'true';

const SCREENSHOT_FILES = [
  'screenshot-music.png',
  'screenshot-pixel-cat.png',
  'screenshot-collapsed-clock.png',
  'screenshot-collapsed-notification.png',
  'screenshot-messages.png',
  'screenshot-todos.png',
  'screenshot-translation.png',
  'screenshot-file-shelf.png',
  'screenshot-system.png',
  'screenshot-settings.png',
  'screenshot-themes.png',
];

const PARENT_SCREENSHOTS_DIR = path.join(PARENT_REPO_DIR, 'docs', 'assets', 'screenshots');
const PARENT_MARK_PATH = path.join(PARENT_REPO_DIR, 'src-tauri', 'icons', 'mark.svg');

const DEST_SCREENSHOTS_DIR = path.join(WEBSITE_DIR, 'src', 'assets', 'screenshots');
const DEST_MARK_PATH = path.join(WEBSITE_DIR, 'src', 'assets', 'mark.svg');
const SNAPSHOT_PATH = path.join(WEBSITE_DIR, 'src', 'data', 'releaseSnapshot.json');

function buildHeaders(accept) {
  const headers = {'User-Agent': 'skerry-website-build-sync'};
  if (accept) headers.Accept = accept;
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return headers;
}

function formatBytesToMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extractMajor(versionRange, fallback) {
  if (typeof versionRange !== 'string') return fallback;
  const match = versionRange.match(/(\d+)/);
  return match ? Number(match[1]) : fallback;
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readRepoTextFile(relativePath) {
  const localPath = path.join(PARENT_REPO_DIR, relativePath);
  if (await fileExists(localPath)) {
    return fs.readFile(localPath, 'utf8');
  }
  const rawUrl = `https://raw.githubusercontent.com/${REPO}/${REF}/${relativePath}`;
  const res = await fetch(rawUrl, {headers: buildHeaders()});
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} reading ${rawUrl}`);
  }
  return res.text();
}

async function downloadFile(url, destination) {
  const res = await fetch(url, {headers: buildHeaders()});
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} downloading ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error(`Empty response downloading ${url}`);
  }
  await fs.writeFile(destination, buffer);
  return buffer.length;
}

async function syncScreenshotsAndMark() {
  await fs.mkdir(DEST_SCREENSHOTS_DIR, {recursive: true});

  const hasLocalScreenshots = await fileExists(
    path.join(PARENT_SCREENSHOTS_DIR, SCREENSHOT_FILES[0])
  );
  const hasLocalMark = await fileExists(PARENT_MARK_PATH);

  const tasks = SCREENSHOT_FILES.map(async (filename) => {
    const dest = path.join(DEST_SCREENSHOTS_DIR, filename);
    const localSrc = path.join(PARENT_SCREENSHOTS_DIR, filename);

    if (hasLocalScreenshots && (await fileExists(localSrc))) {
      await fs.copyFile(localSrc, dest);
      const stat = await fs.stat(dest);
      console.log(`  [local]  ${filename} (${formatBytesToMb(stat.size)})`);
      return;
    }

    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${REF}/docs/assets/screenshots/${filename}`;
    const bytes = await downloadFile(rawUrl, dest);
    console.log(`  [remote] ${filename} (${formatBytesToMb(bytes)})`);
  });

  tasks.push(
    (async () => {
      if (hasLocalMark) {
        await fs.copyFile(PARENT_MARK_PATH, DEST_MARK_PATH);
        const stat = await fs.stat(DEST_MARK_PATH);
        console.log(`  [local]  mark.svg (${stat.size} B)`);
        return;
      }

      const markUrl = `https://raw.githubusercontent.com/${REPO}/${REF}/src-tauri/icons/mark.svg`;
      const bytes = await downloadFile(markUrl, DEST_MARK_PATH);
      console.log(`  [remote] mark.svg (${bytes} B)`);
    })()
  );

  await Promise.all(tasks);
  await convertScreenshotsToWebp();
}

// Re-encode the synced PNGs as WebP (about 40x smaller) and drop the PNGs.
async function convertScreenshotsToWebp() {
  let before = 0;
  let after = 0;
  for (const filename of SCREENSHOT_FILES) {
    const pngPath = path.join(DEST_SCREENSHOTS_DIR, filename);
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const input = await fs.readFile(pngPath);
    const output = await sharp(input).webp({quality: 80, effort: 5}).toBuffer();
    await fs.writeFile(webpPath, output);
    await fs.rm(pngPath);
    before += input.length;
    after += output.length;
  }
  console.log(`  [webp]   ${formatBytesToMb(before)} -> ${formatBytesToMb(after)}`);
}

async function readRepoMetadata() {
  const defaults = {
    appVersion: '1.6.0',
    materialCount: 6,
    materials: ['midnight', 'graphite', 'liquidGlass', 'frostedGlass', 'aurora', 'prism'],
    reactMajor: 19,
    viteMajor: 7,
    tauriMajor: 2,
    rustEdition: '2021',
    screenshotCount: SCREENSHOT_FILES.length,
  };

  try {
    const [pkgRaw, cargoRaw, typesRaw] = await Promise.all([
      readRepoTextFile('package.json'),
      readRepoTextFile('src-tauri/Cargo.toml'),
      readRepoTextFile('src/features/appearance/types.ts'),
    ]);

    const pkg = JSON.parse(pkgRaw);
    const deps = {...(pkg.dependencies || {}), ...(pkg.devDependencies || {})};

    const rustEditionMatch = cargoRaw.match(/^\s*edition\s*=\s*"(\d{4})"/m);
    const materialUnionMatch = typesRaw.match(/export\s+type\s+Material\s*=\s*([^;]+);/);
    const parsedMaterials = materialUnionMatch
      ? [...materialUnionMatch[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1])
      : defaults.materials;

    return {
      appVersion: typeof pkg.version === 'string' ? pkg.version : defaults.appVersion,
      materialCount: parsedMaterials.length || defaults.materialCount,
      materials: parsedMaterials.length ? parsedMaterials : defaults.materials,
      reactMajor: extractMajor(deps.react, defaults.reactMajor),
      viteMajor: extractMajor(deps.vite, defaults.viteMajor),
      tauriMajor: extractMajor(deps['@tauri-apps/api'], defaults.tauriMajor),
      rustEdition: rustEditionMatch ? rustEditionMatch[1] : defaults.rustEdition,
      screenshotCount: SCREENSHOT_FILES.length,
    };
  } catch (err) {
    console.warn(
      `  [meta]   Using defaults (${err instanceof Error ? err.message : String(err)})`
    );
    return defaults;
  }
}

async function syncReleaseAndMetrics() {
  const [repoMeta, releaseRes] = await Promise.all([
    readRepoMetadata(),
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: buildHeaders('application/vnd.github+json'),
    }),
  ]);

  if (!releaseRes.ok) {
    throw new Error(`HTTP ${releaseRes.status} querying GitHub latest release`);
  }

  const data = await releaseRes.json();
  const assets = Array.isArray(data.assets) ? data.assets : [];
  const nsisAsset = assets.find((a) => /setup\.exe$/i.test(a.name));
  const msiAsset = assets.find((a) => /\.msi$/i.test(a.name));
  const checksumAsset = assets.find((a) => /SHA256SUMS/i.test(a.name));
  const githubPluginAsset = assets.find((a) => /^github-[0-9]+\.[0-9]+\.[0-9]+.*\.zip$/i.test(a.name));
  const pluginVersionMatch = githubPluginAsset?.name.match(/^github-([0-9]+\.[0-9]+\.[0-9]+)/i);

  const releaseUrl = data.html_url || `https://github.com/${REPO}/releases/latest`;
  const tagName = data.tag_name || `v${repoMeta.appVersion}`;

  const snapshot = {
    tagName,
    releaseUrl,
    publishedAt: data.published_at || null,
    nsis: nsisAsset
      ? {
          name: nsisAsset.name,
          url: nsisAsset.browser_download_url,
          sizeBytes: nsisAsset.size,
          sizeLabel: formatBytesToMb(nsisAsset.size),
        }
      : {
          name: `Skerry_${tagName.replace(/^v/, '')}_x64-setup.exe`,
          url: releaseUrl,
          sizeBytes: 0,
          sizeLabel: 'Latest',
        },
    msi: msiAsset
      ? {
          name: msiAsset.name,
          url: msiAsset.browser_download_url,
          sizeBytes: msiAsset.size,
          sizeLabel: formatBytesToMb(msiAsset.size),
        }
      : {
          name: `Skerry_${tagName.replace(/^v/, '')}_x64_en-US.msi`,
          url: releaseUrl,
          sizeBytes: 0,
          sizeLabel: 'Latest',
        },
    checksumsUrl: checksumAsset ? checksumAsset.browser_download_url : releaseUrl,
    repoMeta: {
      ...repoMeta,
      githubPluginVersion: pluginVersionMatch ? pluginVersionMatch[1] : '0.1.0',
    },
  };

  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(
    `  [release] ${snapshot.tagName} (NSIS: ${snapshot.nsis.sizeLabel}, MSI: ${snapshot.msi.sizeLabel}, plugin: v${snapshot.repoMeta.githubPluginVersion})`
  );
  console.log(
    `  [meta]    ${snapshot.repoMeta.materialCount} materials · React ${snapshot.repoMeta.reactMajor} · Vite ${snapshot.repoMeta.viteMajor} · Tauri ${snapshot.repoMeta.tauriMajor} · Rust ${snapshot.repoMeta.rustEdition}`
  );
}

async function main() {
  console.log(`Syncing Skerry website assets (${REPO}@${REF})...`);
  try {
    await Promise.all([syncScreenshotsAndMark(), syncReleaseAndMetrics()]);
    console.log('Skerry asset sync completed successfully.');
  } catch (err) {
    console.warn(`Asset sync warning: ${err instanceof Error ? err.message : String(err)}`);
    if (STRICT) {
      console.error('SYNC_STRICT=true is set — failing build.');
      process.exit(1);
    }
    console.warn('Continuing with existing local assets and release snapshot.');
  }
}

main();
