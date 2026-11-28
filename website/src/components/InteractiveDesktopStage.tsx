import {useEffect} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ChevronLeft, ChevronRight, Maximize2} from 'lucide-react';
import {HERO_SCREENSHOT_SLIDES} from '../data/skerryData';

interface InteractiveDesktopStageProps {
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onInspectCurrent: () => void;
}

export function InteractiveDesktopStage({
  activeIndex,
  onChangeIndex,
  onInspectCurrent,
}: InteractiveDesktopStageProps) {
  const current = HERO_SCREENSHOT_SLIDES[activeIndex];

  const goPrev = () => {
    onChangeIndex((activeIndex - 1 + HERO_SCREENSHOT_SLIDES.length) % HERO_SCREENSHOT_SLIDES.length);
  };

  const goNext = () => {
    onChangeIndex((activeIndex + 1) % HERO_SCREENSHOT_SLIDES.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        onChangeIndex(
          (activeIndex - 1 + HERO_SCREENSHOT_SLIDES.length) % HERO_SCREENSHOT_SLIDES.length
        );
      }
      if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % HERO_SCREENSHOT_SLIDES.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, onChangeIndex]);

  return (
    <div className="w-full">
      {/* Precision-Milled Architectural Frame (r_inner = r_outer - padding) */}
      <div className="rounded-[24px] border border-[#D8DCE3] bg-white/80 p-2 sm:p-2.5 dark:border-white/12 dark:bg-[#131722]/90 skerry-rim">
        <div className="overflow-hidden rounded-[16px] border border-black/8 dark:border-white/10 bg-[#141524]">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#171535]">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                src={current.src}
                alt={current.alt}
                referrerPolicy="no-referrer"
                initial={{opacity: 0.25, scale: 1.006}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0.25}}
                transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                onClick={onInspectCurrent}
                className="h-full w-full cursor-zoom-in object-cover object-top"
              />
            </AnimatePresence>

            {/* Restrained Bottom-Right Navigation & Inspect Controls */}
            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous screenshot"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-black/52 text-white/90 backdrop-blur-md hover:bg-black/75 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next screenshot"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-black/52 text-white/90 backdrop-blur-md hover:bg-black/75 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onInspectCurrent}
                aria-label={`Inspect ${current.title} full size`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/12 bg-black/52 px-3 text-xs font-medium text-white/95 backdrop-blur-md hover:bg-black/75 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Full size</span>
              </button>
            </div>
          </div>

          {/* Caption Bar Integrated Cleanly into Bezel */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-white/10 bg-[#0F1219] px-5 py-4 text-white">
            <div className="min-w-0">
              <p className="font-display text-sm sm:text-[15px] font-semibold text-white">
                {current.title}
              </p>
              <p className="mt-0.5 text-xs text-white/68 leading-relaxed max-w-3xl">
                {current.caption}
              </p>
            </div>
            <span className="font-mono text-xs text-white/48 tabular-nums whitespace-nowrap shrink-0">
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(HERO_SCREENSHOT_SLIDES.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Visual Filmstrip Selector */}
      <div className="mt-4">
        <div
          role="tablist"
          aria-label="Official Skerry screenshots"
          className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2"
        >
          {HERO_SCREENSHOT_SLIDES.map((slide, idx) => {
            const selected = idx === activeIndex;
            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={selected}
                type="button"
                onClick={() => onChangeIndex(idx)}
                className={`group flex flex-col overflow-hidden rounded-xl border p-1.5 text-left transition-all duration-150 cursor-pointer ${
                  selected
                    ? 'border-[#111318] bg-white shadow-xs dark:border-white/55 dark:bg-[#161B27]'
                    : 'border-[#E2E6EC] bg-white/60 hover:border-[#B8C1CE] hover:bg-white dark:border-white/8 dark:bg-[#11141D]/80 dark:hover:border-white/22 dark:hover:bg-[#151A25]'
                }`}
              >
                <div className="aspect-[16/9] w-full overflow-hidden rounded-[6px] bg-[#181636]">
                  <img
                    src={slide.src}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover object-top transition-opacity duration-150 ${
                      selected ? 'opacity-100' : 'opacity-72 group-hover:opacity-95'
                    }`}
                  />
                </div>
                <span
                  className={`mt-1.5 block truncate px-0.5 text-[11px] font-medium whitespace-nowrap ${
                    selected
                      ? 'text-[#111318] dark:text-white'
                      : 'text-[#525B69] group-hover:text-[#111318] dark:text-[#8E98A8] dark:group-hover:text-white'
                  }`}
                >
                  {slide.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs text-[#525B69] dark:text-[#7E8898]">
          Captured directly from Skerry on Windows · Use Left / Right arrow keys or click any frame
          to inspect full resolution
        </p>
      </div>
    </div>
  );
}
