import {useEffect, useState} from 'react';
import {RELEASES_URL, type RepoMetrics} from '../data/skerryData';
import releaseSnapshot from '../data/releaseSnapshot.json';

export interface ReleaseAssetInfo {
  name: string;
  url: string;
  sizeBytes: number;
  sizeLabel: string;
}

export interface LatestReleaseInfo {
  tagName: string;
  releaseUrl: string;
  publishedAt: string | null;
  nsis: ReleaseAssetInfo;
  msi: ReleaseAssetInfo;
  checksumsUrl: string;
  repoMeta: RepoMetrics;
  source: 'live' | 'snapshot';
}

const CACHE_KEY = 'skerry_latest_release_v3';
const CACHE_TTL_MS = 10 * 60 * 1000;

function formatBytesToMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

const SNAPSHOT_FALLBACK: LatestReleaseInfo = {
  ...releaseSnapshot,
  source: 'snapshot',
};

interface GitHubReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

interface GitHubReleaseResponse {
  tag_name?: string;
  html_url?: string;
  published_at?: string;
  assets?: GitHubReleaseAsset[];
}

function parseRelease(data: GitHubReleaseResponse): LatestReleaseInfo | null {
  if (!data || typeof data.tag_name !== 'string') return null;

  const assets = Array.isArray(data.assets) ? data.assets : [];
  const nsisAsset = assets.find((a) => /setup\.exe$/i.test(a.name));
  const msiAsset = assets.find((a) => /\.msi$/i.test(a.name));
  const checksumAsset = assets.find((a) => /SHA256SUMS/i.test(a.name));
  const githubPluginAsset = assets.find((a) => /^github-[0-9]+\.[0-9]+\.[0-9]+.*\.zip$/i.test(a.name));
  const pluginMatch = githubPluginAsset?.name.match(/^github-([0-9]+\.[0-9]+\.[0-9]+)/i);

  const releaseUrl = data.html_url || RELEASES_URL;

  return {
    tagName: data.tag_name,
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
          ...SNAPSHOT_FALLBACK.nsis,
          url: releaseUrl,
        },
    msi: msiAsset
      ? {
          name: msiAsset.name,
          url: msiAsset.browser_download_url,
          sizeBytes: msiAsset.size,
          sizeLabel: formatBytesToMb(msiAsset.size),
        }
      : {
          ...SNAPSHOT_FALLBACK.msi,
          url: releaseUrl,
        },
    checksumsUrl: checksumAsset ? checksumAsset.browser_download_url : releaseUrl,
    repoMeta: {
      ...SNAPSHOT_FALLBACK.repoMeta,
      githubPluginVersion: pluginMatch
        ? pluginMatch[1]
        : SNAPSHOT_FALLBACK.repoMeta.githubPluginVersion,
    },
    source: 'live',
  };
}

export function useLatestRelease(): LatestReleaseInfo {
  const [release, setRelease] = useState<LatestReleaseInfo>(() => {
    if (typeof window === 'undefined') return SNAPSHOT_FALLBACK;
    try {
      const raw = window.sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {ts: number; data: LatestReleaseInfo};
        if (Date.now() - parsed.ts < CACHE_TTL_MS && parsed.data?.tagName && parsed.data?.repoMeta) {
          return parsed.data;
        }
      }
    } catch {
      // Ignore storage access failures in restricted frames
    }
    return SNAPSHOT_FALLBACK;
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLatest() {
      try {
        const res = await fetch(
          'https://api.github.com/repos/ahmad-maqsood/skerry-island/releases/latest',
          {
            headers: {Accept: 'application/vnd.github+json'},
            signal: controller.signal,
          }
        );
        if (!res.ok) return;
        const json = (await res.json()) as GitHubReleaseResponse;
        const parsed = parseRelease(json);
        if (!parsed) return;
        setRelease(parsed);
        try {
          window.sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ts: Date.now(), data: parsed})
          );
        } catch {
          // Ignore storage write failures
        }
      } catch {
        // Keep build-time snapshot silently if offline or rate-limited
      }
    }

    fetchLatest();
    return () => controller.abort();
  }, []);

  return release;
}
