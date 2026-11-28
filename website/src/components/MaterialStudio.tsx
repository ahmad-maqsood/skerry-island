import {useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {Maximize2} from 'lucide-react';
import {MATERIAL_LIST, SCREENSHOTS, type MaterialSpecItem} from '../data/skerryData';
import type {LightboxImage} from './ScreenshotLightbox';

interface MaterialStudioProps {
  materialCount: number;
  onInspectImage: (img: LightboxImage) => void;
}

const SWATCH_CLASS: Record<MaterialSpecItem['id'], string> = {
  midnight: 'swatch-midnight',
  graphite: 'swatch-graphite',
  liquid: 'swatch-liquid',
  frosted: 'swatch-frosted',
  aurora: 'swatch-aurora',
  prism: 'swatch-prism',
};

export function MaterialStudio({materialCount, onInspectImage}: MaterialStudioProps) {
  const [view, setView] = useState<'materials' | 'settings'>('materials');

  const activeCapture =
    view === 'materials'
      ? {
          src: SCREENSHOTS.themes,
          alt: 'Official Skerry side-by-side comparison of visual material finishes',
          title: 'Visual Styles — Midnight, Liquid Glass, and Frosted Glass',
          caption:
            'Side-by-side comparison captured directly from Skerry showing solid surfaces versus translucent glass finishes.',
        }
      : {
          src: SCREENSHOTS.settings,
          alt: 'Official Skerry Settings window showing Appearance previews, Color scheme, Material options, Opacity slider, and custom color pickers',
          title: 'Appearance Settings & Live Preview',
          caption: `Searchable settings window with Dark/Light/System schemes, all ${materialCount} materials, opacity slider, Notch or Capsule shape, and color customization.`,
        };

  return (
    <section
      id="materials"
      className="border-y border-[#E2E6EC] bg-[#EEF1F5]/75 dark:border-white/8 dark:bg-[#0D1018] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#525B69] dark:text-[#8E98A8] tabular-nums">
              Appearance & Settings · {materialCount} Surface Materials
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-[42px] font-semibold tracking-[-0.025em] leading-[1.1] text-[#111318] dark:text-[#F8FAFC] text-balance">
              {materialCount} materials led by Midnight, adaptive themes, and searchable settings.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
              Choose from Midnight (the default ink-indigo surface with a violet-to-rose horizon
              glow), Graphite, Liquid Glass, Frosted Glass, Aurora, and Prism across Dark, Light, or
              Follow System schemes—as a flush top-edge Notch or floating Capsule across any
              monitor.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Appearance screenshot views"
            className="inline-flex items-center gap-1 rounded-xl border border-[#DCE1E8] bg-white p-1 dark:border-white/10 dark:bg-[#141824] shrink-0"
          >
            <button
              role="tab"
              aria-selected={view === 'materials'}
              type="button"
              onClick={() => setView('materials')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'materials'
                  ? 'bg-[#111318] text-white dark:bg-[#F8FAFC] dark:text-[#090B10]'
                  : 'text-[#4B5563] hover:text-[#111318] dark:text-[#9AA4B4] dark:hover:text-white'
              }`}
            >
              Material Comparison
            </button>
            <button
              role="tab"
              aria-selected={view === 'settings'}
              type="button"
              onClick={() => setView('settings')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'settings'
                  ? 'bg-[#111318] text-white dark:bg-[#F8FAFC] dark:text-[#090B10]'
                  : 'text-[#4B5563] hover:text-[#111318] dark:text-[#9AA4B4] dark:hover:text-white'
              }`}
            >
              Settings Window
            </button>
          </div>
        </div>

        {/* Full-Resolution 4K Official Capture in Nested Precision Bezel */}
        <div className="mt-10 rounded-[24px] border border-[#D4DAE3] bg-white/85 p-2 sm:p-2.5 dark:border-white/12 dark:bg-[#131722]/90 skerry-rim">
          <button
            type="button"
            onClick={() => onInspectImage(activeCapture)}
            className="group relative block w-full overflow-hidden rounded-[16px] border border-black/8 dark:border-white/10 bg-[#141524] text-left cursor-pointer"
            aria-label={`Inspect ${activeCapture.title} at full 4K resolution`}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={view}
                  src={activeCapture.src}
                  alt={activeCapture.alt}
                  referrerPolicy="no-referrer"
                  initial={{opacity: 0.25}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0.25}}
                  transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-black/58 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md group-hover:bg-black/80 transition-colors">
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Inspect full 4K capture</span>
              </span>
            </div>
          </button>
        </div>

        {/* Balanced 3x2 Grid of All 6 Tactile Material Swatch Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MATERIAL_LIST.map((item) => (
            <div
              key={item.name}
              className={`rounded-2xl border p-5 ${
                item.id === 'midnight'
                  ? 'border-[#111318]/25 bg-white dark:border-[#7C5CFF]/40 dark:bg-[#131624] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-[#DCE1E8] bg-white dark:border-white/9 dark:bg-[#121620] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
              }`}
            >
              <div
                aria-hidden="true"
                className={`h-8 w-full rounded-[8px] border border-black/10 dark:border-white/12 ${SWATCH_CLASS[item.id]}`}
              />
              <div className="mt-4 flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-[#111318] dark:text-[#F4F5F8]">
                  {item.name}
                </h3>
                <span
                  className={`text-xs ${
                    item.id === 'midnight'
                      ? 'font-medium text-[#1E40AF] dark:text-[#A5B4FC]'
                      : 'text-[#64748B] dark:text-[#8E98A8]'
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
