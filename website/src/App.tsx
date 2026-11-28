import {useEffect, useState} from 'react';
import {ArrowUpRight, Download, Moon, Sun} from 'lucide-react';
import {ArchitectureAndPrivacy} from './components/ArchitectureAndPrivacy';
import {CapabilitiesBento} from './components/CapabilitiesBento';
import {DownloadSection} from './components/DownloadSection';
import {InteractiveDesktopStage} from './components/InteractiveDesktopStage';
import {MaterialStudio} from './components/MaterialStudio';
import {ScreenshotLightbox, type LightboxImage} from './components/ScreenshotLightbox';
import {
  BRAND_MARK,
  HERO_SCREENSHOT_SLIDES,
  MICROSOFT_STORE_URL,
  PLUGIN_GUIDE_URL,
  REPO_URL,
  SECURITY_URL,
} from './data/skerryData';
import {useLatestRelease} from './hooks/useLatestRelease';

type SiteTheme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'skerry_site_theme';

export default function App() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [lightboxState, setLightboxState] = useState<
    {mode: 'single'; image: LightboxImage} | {mode: 'hero'; index: number} | null
  >(null);

  const [theme, setTheme] = useState<SiteTheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore storage failures
    }
    return 'dark';
  });

  const release = useLatestRelease();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const activeLightboxImage: LightboxImage | null =
    lightboxState === null
      ? null
      : lightboxState.mode === 'single'
        ? lightboxState.image
        : {
            src: HERO_SCREENSHOT_SLIDES[lightboxState.index].src,
            alt: HERO_SCREENSHOT_SLIDES[lightboxState.index].alt,
            title: HERO_SCREENSHOT_SLIDES[lightboxState.index].title,
            caption: HERO_SCREENSHOT_SLIDES[lightboxState.index].caption,
          };

  const handleLightboxPrev =
    lightboxState?.mode === 'hero'
      ? () => {
          const nextIdx =
            (lightboxState.index - 1 + HERO_SCREENSHOT_SLIDES.length) %
            HERO_SCREENSHOT_SLIDES.length;
          setHeroIndex(nextIdx);
          setLightboxState({mode: 'hero', index: nextIdx});
        }
      : undefined;

  const handleLightboxNext =
    lightboxState?.mode === 'hero'
      ? () => {
          const nextIdx = (lightboxState.index + 1) % HERO_SCREENSHOT_SLIDES.length;
          setHeroIndex(nextIdx);
          setLightboxState({mode: 'hero', index: nextIdx});
        }
      : undefined;

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111318] dark:bg-[#090B10] dark:text-[#F4F5F8] transition-colors duration-200">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#E4E7EC]/90 bg-[#F6F7F9]/86 dark:border-white/8 dark:bg-[#090B10]/84 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-6">
          {/* Zone 1: Single clean brand wordmark */}
          <a
            href="#"
            className="font-display text-lg font-bold tracking-tight text-[#111318] dark:text-[#F4F5F8] whitespace-nowrap shrink-0"
          >
            Skerry
          </a>

          {/* Zone 2: 4 concise single-line text nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B5563] dark:text-[#9AA4B4]"
          >
            <a
              href="#capabilities"
              className="hover:text-[#111318] dark:hover:text-white hover:underline underline-offset-4 decoration-[#CBD5E1] dark:decoration-white/30 transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#materials"
              className="hover:text-[#111318] dark:hover:text-white hover:underline underline-offset-4 decoration-[#CBD5E1] dark:decoration-white/30 transition-colors whitespace-nowrap shrink-0"
            >
              Materials
            </a>
            <a
              href="#architecture"
              className="hover:text-[#111318] dark:hover:text-white hover:underline underline-offset-4 decoration-[#CBD5E1] dark:decoration-white/30 transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
            <a
              href="#download"
              className="hover:text-[#111318] dark:hover:text-white hover:underline underline-offset-4 decoration-[#CBD5E1] dark:decoration-white/30 transition-colors whitespace-nowrap shrink-0"
            >
              Download
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-lg bg-[#111318] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:bg-[#F8FAFC] dark:text-[#090B10] dark:hover:bg-white transition-colors whitespace-nowrap shrink-0"
            >
              <span>Download {release.tagName}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="skerry-hero-atmosphere">
        {/* Hero Section: Centered Editorial Statement + Framed Real Skerry Showcase */}
        <section className="mx-auto max-w-[1200px] px-6 pt-8 pb-20 sm:pt-10 sm:pb-28">
          {/* Top Utility Row: Metadata + Prominent Dark/Light Mode Switch at Start of Page */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E4E7EC] dark:border-white/8">
            <p className="text-xs font-medium text-[#525B69] dark:text-[#8E98A8] tabular-nums">
              Windows 10 & 11 · Tauri {release.repoMeta.tauriMajor} & Rust · GNU GPL-3.0 Open Source
            </p>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D4DAE3] bg-white px-3.5 py-2 text-xs font-medium text-[#111318] hover:border-[#94A3B8] dark:border-white/14 dark:bg-[#131722] dark:text-[#F4F5F8] dark:hover:border-white/28 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 shrink-0 text-[#1E40AF]" />
                  <span>Dark mode</span>
                </>
              )}
            </button>
          </div>

          {/* Centered Monumental Proposition */}
          <div className="mx-auto mt-12 sm:mt-16 max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-[13px] border border-black/10 dark:border-white/14 shadow-[0_12px_28px_-10px_rgba(14,10,43,0.45)]">
              <img
                src={BRAND_MARK}
                alt="Skerry application icon"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="font-display text-[clamp(2.5rem,5vw,4.15rem)] font-bold tracking-[-0.035em] leading-[1.04] text-[#111318] dark:text-[#F8FAFC] text-balance">
              One quiet strip at the top of your Windows screen.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-[18px] leading-relaxed text-[#4B5563] dark:text-[#A1AAB8] dark:tracking-[0.005em]">
              Skerry docks seamlessly to the top edge of your monitor—bringing Windows toast
              notifications, synced lyrics, searchable clipboard history, a drag-and-drop file
              shelf, and live PC health into one native Rust interface.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E40AF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] dark:bg-[#F8FAFC] dark:text-[#090B10] dark:hover:bg-white transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Download for Windows</span>
              </a>

              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4DAE3] bg-white px-5 py-3 text-sm font-semibold text-[#111318] hover:border-[#94A3B8] dark:border-white/14 dark:bg-[#121621] dark:text-[#F4F5F8] dark:hover:border-white/28 transition-colors whitespace-nowrap shrink-0"
              >
                <span>View on GitHub</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
            </div>

            <p className="mt-4 text-xs text-[#525B69] dark:text-[#7E8898] tabular-nums">
              Latest {release.tagName} · {release.nsis.sizeLabel} NSIS setup · Also free on
              Microsoft Store
            </p>
          </div>

          {/* Dominant Focal Anchor: Official High-Res Skerry Showcase with Visual Filmstrip */}
          <div className="mt-12 sm:mt-14">
            <InteractiveDesktopStage
              activeIndex={heroIndex}
              onChangeIndex={setHeroIndex}
              onInspectCurrent={() => setLightboxState({mode: 'hero', index: heroIndex})}
            />
          </div>
        </section>

        {/* Core Capabilities Bento with Official Screenshots */}
        <CapabilitiesBento
          onInspectImage={(image) => setLightboxState({mode: 'single', image})}
        />

        {/* Real 4K Materials Comparison & Settings Window */}
        <MaterialStudio
          materialCount={release.repoMeta.materialCount}
          onInspectImage={(image) => setLightboxState({mode: 'single', image})}
        />

        {/* Native Architecture, Privacy & Plugin API v1 */}
        <ArchitectureAndPrivacy release={release} />

        {/* Download & Installation */}
        <DownloadSection release={release} />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E4E7EC] bg-[#F6F7F9] dark:border-white/8 dark:bg-[#090B10] py-12">
        <div className="mx-auto max-w-[1200px] px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <img
              src={BRAND_MARK}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-[8px] border border-black/10 dark:border-white/12 shrink-0"
            />
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-[#111318] dark:text-[#F4F5F8]">
                Skerry
              </p>
              <p className="mt-0.5 text-xs text-[#525B69] dark:text-[#8E98A8]">
                Built by Ahmad Maqsood · Derivative of Fly Island · GNU GPL-3.0-only
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer links"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#4B5563] dark:text-[#9AA4B4]"
          >
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111318] dark:hover:text-white transition-colors whitespace-nowrap"
            >
              GitHub Repository
            </a>
            <a
              href={release.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111318] dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Releases ({release.tagName})
            </a>
            <a
              href={MICROSOFT_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111318] dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Microsoft Store
            </a>
            <a
              href={PLUGIN_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111318] dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Plugin SDK
            </a>
            <a
              href={SECURITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111318] dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Security Policy
            </a>
          </nav>
        </div>
      </footer>

      {/* Full-Resolution Screenshot Lightbox */}
      <ScreenshotLightbox
        image={activeLightboxImage}
        onClose={() => setLightboxState(null)}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
        counterText={
          lightboxState?.mode === 'hero'
            ? `${String(lightboxState.index + 1).padStart(2, '0')} / ${String(
                HERO_SCREENSHOT_SLIDES.length
              ).padStart(2, '0')}`
            : undefined
        }
      />
    </div>
  );
}
