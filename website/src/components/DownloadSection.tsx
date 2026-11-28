import {useState} from 'react';
import {ArrowUpRight, Check, Copy, Download, Shield} from 'lucide-react';
import {BRAND_MARK, MICROSOFT_STORE_URL} from '../data/skerryData';
import type {LatestReleaseInfo} from '../hooks/useLatestRelease';

interface DownloadSectionProps {
  release: LatestReleaseInfo;
}

export function DownloadSection({release}: DownloadSectionProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const verifyCommand = `Get-FileHash .\\${release.nsis.name} -Algorithm SHA256`;

  const copyVerifyCommand = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verifyCommand).catch(() => {});
    }
    setCopiedCmd(true);
    window.setTimeout(() => setCopiedCmd(false), 1600);
  };

  return (
    <section
      id="download"
      className="border-t border-[#E2E6EC] bg-white dark:border-white/8 dark:bg-[#0C0F16] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 max-w-2xl">
          <img
            src={BRAND_MARK}
            alt="Skerry icon"
            referrerPolicy="no-referrer"
            className="h-14 w-14 rounded-[15px] border border-black/10 dark:border-white/14 shadow-[0_14px_30px_-10px_rgba(14,10,43,0.5)] shrink-0"
          />
          <div>
            <p className="text-xs font-medium text-[#525B69] dark:text-[#8E98A8]">
              Installation · Latest Release {release.tagName}
            </p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-[40px] font-semibold tracking-[-0.025em] leading-[1.1] text-[#111318] dark:text-[#F8FAFC] text-balance">
              Install in thirty seconds. Free and open source.
            </h2>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
          Choose the Microsoft Store for zero SmartScreen prompts, or grab the direct signed
          installer from GitHub Releases to receive new updates first.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Option 1: GitHub Release Installer (Direct, Synced Live from GitHub Releases API) */}
          <div className="flex flex-col justify-between rounded-[22px] border border-[#111318] bg-[#111318] p-7 sm:p-8 text-[#F8F6F0] dark:border-white/16 dark:bg-[#141925] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_26px_60px_-24px_rgba(0,0,0,0.75)]">
            <div>
              <div className="flex items-center justify-between gap-3 text-xs text-white/60">
                <span>GitHub Releases · Gets updates first</span>
                <span className="font-mono tabular-nums">{release.tagName}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white">
                Direct Windows Installer
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-white/75">
                Signed with cryptographic minisign keys verified automatically by Skerry’s silent
                idle in-app updater. Supports both standard NSIS and enterprise MSI deployments.
              </p>
            </div>

            <div className="mt-8 space-y-3.5">
              <a
                href={release.nsis.url}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#090B10] hover:bg-white/92 transition-colors whitespace-nowrap"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span className="tabular-nums">
                  Download Setup .exe ({release.nsis.sizeLabel})
                </span>
              </a>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-white/72">
                <a
                  href={release.msi.url}
                  className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white transition-colors whitespace-nowrap tabular-nums"
                >
                  Enterprise .msi ({release.msi.sizeLabel})
                </a>
                <a
                  href={release.checksumsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white transition-colors whitespace-nowrap"
                >
                  SHA256SUMS.txt
                </a>
                <a
                  href={release.releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap"
                >
                  <span>Release notes</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Copyable PowerShell Checksum Verify Strip */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5">
                <code className="font-mono text-[11px] text-white/75 truncate">
                  {verifyCommand}
                </code>
                <button
                  type="button"
                  onClick={copyVerifyCommand}
                  aria-label="Copy PowerShell SHA256 verification command"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedCmd ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-300" />
                      <span className="text-emerald-200">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: Microsoft Store */}
          <div className="flex flex-col justify-between rounded-[22px] border border-[#DCE1E8] bg-[#F7F8FA] p-7 sm:p-8 text-[#111318] dark:border-white/10 dark:bg-[#11141D] dark:text-[#F4F5F8] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div>
              <div className="flex items-center justify-between gap-3 text-xs text-[#525B69] dark:text-[#8E98A8]">
                <span>Microsoft Store · Managed auto-updates</span>
                <span className="font-mono">ID 9MV21HG0T71J</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#111318] dark:text-white">
                Install from Microsoft Store
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
                Installs cleanly through Windows’ built-in store with no SmartScreen prompt and
                automatic background updates handled by Microsoft Store. Note that GitHub releases
                ship slightly ahead of Store packages.
              </p>
            </div>

            <div className="mt-8 space-y-3.5">
              <a
                href={MICROSOFT_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#111318] bg-white px-5 py-3.5 text-sm font-semibold text-[#111318] hover:bg-[#111318] hover:text-white dark:border-white/18 dark:bg-[#1A202E] dark:text-white dark:hover:bg-[#F8FAFC] dark:hover:text-[#090B10] transition-colors whitespace-nowrap"
              >
                <span>Open in Microsoft Store</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>

              <p className="pt-1 text-xs text-[#525B69] dark:text-[#8E98A8] leading-relaxed">
                Tip for direct GitHub installers: open-source binaries without commercial CA stamps
                may show Windows SmartScreen—select{' '}
                <strong className="text-[#111318] dark:text-[#E2E8F0]">More info</strong>, then{' '}
                <strong className="text-[#111318] dark:text-[#E2E8F0]">Run anyway</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Quiet System Requirements Row */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#E5E8EE] bg-[#F8F9FB] px-5 py-4 text-xs text-[#4B5563] dark:border-white/9 dark:bg-[#11141D] dark:text-[#A1AAB8]">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#1E40AF] dark:text-[#7AA7F7] shrink-0" />
            <span>
              <strong className="font-semibold text-[#111318] dark:text-[#F4F5F8]">
                System Requirements:
              </strong>{' '}
              Windows 10 (version 1809+) or Windows 11 (64-bit) · Evergreen WebView2 Runtime
            </span>
          </div>
          <span className="text-[#64748B] dark:text-[#8E98A8] whitespace-nowrap">
            Enable Windows Notification access for toast capture
          </span>
        </div>
      </div>
    </section>
  );
}
