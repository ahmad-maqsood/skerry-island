import {useMemo, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {
  PLUGIN_GUIDE_URL,
  PRIVACY_TABLE,
  REPO_URL,
  buildArchitectureLayers,
  buildPluginManifestSnippet,
} from '../data/skerryData';
import type {LatestReleaseInfo} from '../hooks/useLatestRelease';

type InspectorTab = 'privacy' | 'stack' | 'plugins';

interface ArchitectureAndPrivacyProps {
  release: LatestReleaseInfo;
}

export function ArchitectureAndPrivacy({release}: ArchitectureAndPrivacyProps) {
  const [tab, setTab] = useState<InspectorTab>('privacy');

  const architectureLayers = useMemo(
    () => buildArchitectureLayers(release.repoMeta),
    [release.repoMeta]
  );

  const pluginSnippet = useMemo(
    () => buildPluginManifestSnippet(release.repoMeta.githubPluginVersion),
    [release.repoMeta.githubPluginVersion]
  );

  return (
    <section id="architecture" className="mx-auto max-w-[1200px] px-6 py-24 sm:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Engineering Proof & Quantitative Grounding (5 cols) */}
        <div className="lg:col-span-5">
          <p className="text-xs font-medium text-[#525B69] dark:text-[#8E98A8] tabular-nums">
            Native Engineering · Tauri {release.repoMeta.tauriMajor} & Rust{' '}
            {release.repoMeta.rustEdition}
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-[40px] font-semibold tracking-[-0.025em] leading-[1.1] text-[#111318] dark:text-[#F8FAFC] text-balance">
            Built to sit quietly in RAM, not run a second browser.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
            Skerry ships on Tauri {release.repoMeta.tauriMajor} with Windows’ built-in Evergreen
            WebView2 and a modular Rust backend talking straight to Win32 and WinRT APIs. Unsafe
            Windows calls are isolated to a single module (
            <code className="rounded bg-[#ECEFF4] px-1.5 py-0.5 font-mono text-[12px] text-[#111318] dark:bg-white/8 dark:text-[#E2E8F0]">
              win32/
            </code>
            ), CI verifies every commit across Clippy, Rust tests, and headless Chrome Windows
            regression shards, and zero analytics ever leave your machine.
          </p>

          {/* Verifiable Engineering Facts Grid (Auto-synced from GitHub Releases) */}
          <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#E2E6EC] bg-[#E2E6EC] gap-px dark:border-white/10 dark:bg-white/10">
            <div className="bg-white p-4 sm:p-5 dark:bg-[#11141D]">
              <dt className="text-xs text-[#525B69] dark:text-[#8E98A8]">
                NSIS installer ({release.tagName})
              </dt>
              <dd className="mt-1.5 font-mono text-2xl font-medium tracking-tight text-[#111318] dark:text-[#F8FAFC] tabular-nums">
                {release.nsis.sizeLabel}
              </dd>
            </div>
            <div className="bg-white p-4 sm:p-5 dark:bg-[#11141D]">
              <dt className="text-xs text-[#525B69] dark:text-[#8E98A8]">MSI enterprise package</dt>
              <dd className="mt-1.5 font-mono text-2xl font-medium tracking-tight text-[#111318] dark:text-[#F8FAFC] tabular-nums">
                {release.msi.sizeLabel}
              </dd>
            </div>
            <div className="bg-white p-4 sm:p-5 dark:bg-[#11141D]">
              <dt className="text-xs text-[#525B69] dark:text-[#8E98A8]">
                External analytics servers
              </dt>
              <dd className="mt-1.5 font-mono text-2xl font-medium tracking-tight text-[#111318] dark:text-[#F8FAFC] tabular-nums">
                0
              </dd>
            </div>
            <div className="bg-white p-4 sm:p-5 dark:bg-[#11141D]">
              <dt className="text-xs text-[#525B69] dark:text-[#8E98A8]">Release verification</dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-[#111318] dark:text-[#F8FAFC]">
                Minisign + SHA256
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-5 text-sm">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#111318] dark:text-[#F4F5F8] underline decoration-[#CBD5E1] dark:decoration-white/25 underline-offset-4 hover:decoration-[#111318] dark:hover:decoration-white transition-colors whitespace-nowrap"
            >
              <span>Inspect source on GitHub</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={PLUGIN_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#4B5563] hover:text-[#111318] dark:text-[#9AA4B4] dark:hover:text-white transition-colors whitespace-nowrap"
            >
              <span>Plugin Development Guide</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Technical Inspector (7 cols) */}
        <div className="lg:col-span-7 rounded-[22px] border border-[#E2E6EC] bg-white p-6 sm:p-7 dark:border-white/9 dark:bg-[#11141D] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEFF4] dark:border-white/8 pb-4">
            <div
              role="tablist"
              aria-label="Technical inspection views"
              className="inline-flex items-center gap-1 rounded-[10px] border border-[#E5E8EE] bg-[#F3F5F8] p-1 dark:border-white/8 dark:bg-[#0B0E15]"
            >
              {(
                [
                  {id: 'privacy', label: 'Privacy & Network Map'},
                  {id: 'stack', label: 'Tauri + Rust Stack'},
                  {id: 'plugins', label: 'Plugin API v1'},
                ] as const
              ).map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`rounded-[7px] px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-[#111318] shadow-xs dark:bg-[#222838] dark:text-white'
                        : 'text-[#525B69] hover:text-[#111318] dark:text-[#8E98A8] dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-[#64748B] dark:text-[#7E8898]">
              GNU GPL-3.0-only · MIT Plugin SDK
            </span>
          </div>

          {/* TAB 1: PRIVACY & PERMISSIONS */}
          {tab === 'privacy' && (
            <div className="mt-5 divide-y divide-[#ECEFF4] dark:divide-white/8">
              {PRIVACY_TABLE.map((row) => (
                <div
                  key={row.resource}
                  className="grid grid-cols-1 sm:grid-cols-[164px_1fr] gap-2 sm:gap-5 py-4 first:pt-1 last:pb-1"
                >
                  <p className="text-sm font-semibold text-[#111318] dark:text-[#F4F5F8]">
                    {row.resource}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-[#374151] dark:text-[#C5CDD9] leading-relaxed">
                      {row.usage}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-[#8E98A8]">{row.storage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ARCHITECTURE LAYERS */}
          {tab === 'stack' && (
            <div className="mt-5 divide-y divide-[#ECEFF4] dark:divide-white/8">
              {architectureLayers.map((row) => (
                <div
                  key={row.layer}
                  className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-1.5 sm:gap-5 py-3.5 first:pt-1 last:pb-1"
                >
                  <p className="text-sm font-semibold text-[#111318] dark:text-[#F4F5F8]">
                    {row.layer}
                  </p>
                  <div>
                    <p className="font-mono text-xs font-medium text-[#1E40AF] dark:text-[#7AA7F7]">
                      {row.tech}
                    </p>
                    <p className="mt-1 text-sm text-[#4B5563] dark:text-[#A1AAB8] leading-relaxed">
                      {row.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: STDIO PLUGIN API V1 */}
          {tab === 'plugins' && (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
                Skerry’s optional plugin host communicates over stdio (Plugin API v1), keeping
                extensions isolated in standalone processes. The repository ships an official
                GitHub plugin crate (
                <code className="font-mono text-xs text-[#111318] dark:text-[#E2E8F0]">
                  github-{release.repoMeta.githubPluginVersion}
                </code>
                ) and an MIT-licensed Cargo SDK workspace under{' '}
                <code className="font-mono text-xs text-[#111318] dark:text-[#E2E8F0]">
                  plugins/
                </code>
                .
              </p>

              <pre className="overflow-x-auto rounded-xl border border-[#1E2433] bg-[#0B0E15] p-4 font-mono text-xs leading-relaxed text-[#DCE4F2]">
                <code>{pluginSnippet}</code>
              </pre>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#525B69] dark:text-[#8E98A8]">
                <span>Transport: stdio JSON framing · Opt-in plugin host</span>
                <a
                  href={PLUGIN_GUIDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#111318] dark:text-[#F4F5F8] underline decoration-[#CBD5E1] dark:decoration-white/25 underline-offset-4 hover:decoration-[#111318] dark:hover:decoration-white"
                >
                  Read docs/plugins/README.md
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
