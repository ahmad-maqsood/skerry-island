import {useEffect} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt: string;
  title: string;
  caption?: string;
}

interface ScreenshotLightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  counterText?: string;
}

export function ScreenshotLightbox({
  image,
  onClose,
  onPrev,
  onNext,
  counterText,
}: ScreenshotLightboxProps) {
  useEffect(() => {
    if (!image) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [image, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={image.title}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 sm:p-8 backdrop-blur-md"
        >
          <motion.div
            initial={{opacity: 0, scale: 0.985}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.985}}
            transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[1200px] overflow-hidden rounded-[22px] border border-white/14 bg-[#0E1118] shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5 text-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <p className="font-display text-sm font-semibold truncate">{image.title}</p>
                  {counterText && (
                    <span className="font-mono text-xs text-white/45 tabular-nums shrink-0">
                      {counterText}
                    </span>
                  )}
                </div>
                {image.caption && (
                  <p className="mt-0.5 text-xs text-white/65 truncate">{image.caption}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onPrev && onNext && (
                  <>
                    <button
                      type="button"
                      onClick={onPrev}
                      aria-label="Previous screenshot"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/85 hover:bg-white/18 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      aria-label="Next screenshot"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-white/85 hover:bg-white/18 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close full-size screenshot"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#090B10] p-2 sm:p-3">
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-full rounded-[12px] object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
