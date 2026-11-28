import {useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {Maximize2, ShieldCheck} from 'lucide-react';
import {SCREENSHOTS} from '../data/skerryData';
import type {LightboxImage} from './ScreenshotLightbox';

interface CapabilitiesBentoProps {
  onInspectImage: (img: LightboxImage) => void;
}

export function CapabilitiesBento({onInspectImage}: CapabilitiesBentoProps) {
  const [notifMode, setNotifMode] = useState<'feed' | 'glance'>('feed');
  const [idleMode, setIdleMode] = useState<'cat' | 'clock'>('cat');
  const [workMode, setWorkMode] = useState<'todos' | 'shelf'>('todos');
  const [utilMode, setUtilMode] = useState<'system' | 'translation'>('system');

  const notifImg =
    notifMode === 'feed'
      ? {
          src: SCREENSHOTS.messages,
          alt: 'Skerry expanded universal notification feed grouped by Teams and WhatsApp',
          title: 'Unified Notification Feed',
          caption: 'Grouped by application with newest first and single-click dismiss.',
        }
      : {
          src: SCREENSHOTS.collapsedNotification,
          alt: 'Skerry collapsed island showing a real-time Microsoft Outlook toast preview',
          title: 'One-Line Collapsed Toast Preview',
          caption: 'Incoming Windows toasts appear right at the top edge without blocking work.',
        };

  const idleImg =
    idleMode === 'cat'
      ? {
          src: SCREENSHOTS.pixelCat,
          alt: 'Skerry collapsed island with Pixel Cat walking across the bar',
          title: 'Interactive Pixel Cat Companion',
          caption:
            'Walks, washes, loafs, yawns, dashes, pounces on yarn, and chases, swats, and purrs at your mouse cursor.',
        }
      : {
          src: SCREENSHOTS.collapsedClock,
          alt: 'Skerry collapsed idle island displaying tabular clock numerals',
          title: 'Glanceable Tabular Clock',
          caption: 'Quiet time display with optional Open-Meteo local weather when idle.',
        };

  const workImg =
    workMode === 'todos'
      ? {
          src: SCREENSHOTS.todos,
          alt: 'Skerry daily to-do list with running Pomodoro focus timer',
          title: 'To-Dos & Focus Timer',
          caption: 'Daily task checklist with Markdown file sync and inline Pomodoro countdown.',
        }
      : {
          src: SCREENSHOTS.fileShelf,
          alt: 'Skerry drag-and-drop file shelf holding PDF, SVG, and CSV files',
          title: 'Drag-and-Drop File Shelf',
          caption: 'Hold files on the island while switching windows, then drag them out.',
        };

  const utilImg =
    utilMode === 'system'
      ? {
          src: SCREENSHOTS.system,
          alt: 'Skerry live system monitor with CPU sparkline, memory, storage, and sliders',
          title: 'Live PC Health & Quick Sliders',
          caption: 'Real-time CPU sparklines, memory, NVMe read/write, network, volume, and brightness.',
        }
      : {
          src: SCREENSHOTS.translation,
          alt: 'Skerry quick translation window translating Spanish to English via MyMemory',
          title: 'Quick Translation (Ctrl + Shift + F)',
          caption: 'Translate text inside the island with keyless MyMemory or custom OpenAI-compatible APIs.',
        };

  const cardClass =
    'flex flex-col justify-between rounded-[22px] border border-[#E2E6EC] bg-white p-6 sm:p-7 dark:border-white/9 dark:bg-[#11141D] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors duration-200 hover:border-[#C7CFD9] dark:hover:border-white/16';

  const toggleGroupClass =
    'inline-flex items-center gap-1 rounded-[10px] border border-[#E5E8EE] bg-[#F3F5F8] p-1 dark:border-white/8 dark:bg-[#0B0E15]';

  const toggleBtnClass = (active: boolean) =>
    `rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      active
        ? 'bg-white text-[#111318] shadow-xs dark:bg-[#222838] dark:text-white'
        : 'text-[#525B69] hover:text-[#111318] dark:text-[#8E98A8] dark:hover:text-white'
    }`;

  const renderCaptureFrame = (img: LightboxImage, keyVal: string) => (
    <button
      type="button"
      onClick={() => onInspectImage(img)}
      className="group relative mt-6 block w-full overflow-hidden rounded-[16px] border border-[#DCE1E8] bg-[#F1F3F6] p-1.5 text-left dark:border-white/10 dark:bg-[#0A0C12] cursor-pointer"
      aria-label={`Inspect ${img.title} full size`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[10px] bg-[#181636]">
        <AnimatePresence mode="wait">
          <motion.img
            key={keyVal}
            src={img.src}
            alt={img.alt}
            referrerPolicy="no-referrer"
            initial={{opacity: 0.3}}
            animate={{opacity: 1}}
            exit={{opacity: 0.3}}
            transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
            className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.012]"
          />
        </AnimatePresence>
        <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-black/58 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md opacity-85 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="h-3 w-3" />
          <span>Zoom</span>
        </span>
      </div>
    </button>
  );

  return (
    <section id="capabilities" className="mx-auto max-w-[1200px] px-6 py-24 sm:py-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-[#525B69] dark:text-[#8E98A8]">
            Core Capabilities · Real Windows Captures
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-[42px] font-semibold tracking-[-0.025em] leading-[1.1] text-[#111318] dark:text-[#F8FAFC] text-balance">
            Everything you glance at, without leaving the window you are in.
          </h2>
        </div>
        <p className="max-w-md text-sm sm:text-[15px] leading-relaxed text-[#4B5563] dark:text-[#9AA4B4]">
          Skerry hooks directly into WinRT toast streams, Windows GSMTC media sessions, and local
          files—giving you calm glanceable control instead of competing taskbar pop-ups.
        </p>
      </div>

      {/* Asymmetric 12-Column Bento Grid Backed by Real App Screenshots */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 01. Notifications: Collapsed Glance + Expanded Feed (7 cols) */}
        <article className={`lg:col-span-7 ${cardClass}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold tracking-tight text-[#111318] dark:text-[#F4F5F8]">
                01. Universal Windows Toast Feed
              </h3>
              <div className={toggleGroupClass}>
                <button
                  type="button"
                  onClick={() => setNotifMode('feed')}
                  className={toggleBtnClass(notifMode === 'feed')}
                >
                  Expanded feed
                </button>
                <button
                  type="button"
                  onClick={() => setNotifMode('glance')}
                  className={toggleBtnClass(notifMode === 'glance')}
                >
                  One-line glance
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
              Captures live notifications from WhatsApp, Telegram, Outlook, Teams, Chrome, and Edge
              in-memory. Click any alert to jump straight to its source app by Windows AUMID, or
              toggle individual pop-ups for copied text, charger, Bluetooth, Caps Lock, volume, and
              brightness.
            </p>
          </div>
          {renderCaptureFrame(notifImg, `notif-${notifMode}`)}
        </article>

        {/* 02. Pixel Cat & Collapsed Clock (5 cols) */}
        <article className={`lg:col-span-5 ${cardClass}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold tracking-tight text-[#111318] dark:text-[#F4F5F8]">
                02. Pixel Cat & Clock
              </h3>
              <div className={toggleGroupClass}>
                <button
                  type="button"
                  onClick={() => setIdleMode('cat')}
                  className={toggleBtnClass(idleMode === 'cat')}
                >
                  Pixel Cat
                </button>
                <button
                  type="button"
                  onClick={() => setIdleMode('clock')}
                  className={toggleBtnClass(idleMode === 'clock')}
                >
                  Clock
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
              On a fresh install, Pixel Cat walks, washes, loafs, yawns, dashes, and pounces on a
              ball of yarn—move your cursor onto the island and it perks up, chases it, swats, and
              purrs while it rests (or switch to clean tabular clock digits with Open-Meteo
              weather).
            </p>
          </div>
          {renderCaptureFrame(idleImg, `idle-${idleMode}`)}
        </article>

        {/* 03. To-Dos, Focus Timer & File Shelf (6 cols) */}
        <article className={`lg:col-span-6 ${cardClass}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold tracking-tight text-[#111318] dark:text-[#F4F5F8]">
                03. Tasks, Focus & File Shelf
              </h3>
              <div className={toggleGroupClass}>
                <button
                  type="button"
                  onClick={() => setWorkMode('todos')}
                  className={toggleBtnClass(workMode === 'todos')}
                >
                  To-Dos & Timer
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode('shelf')}
                  className={toggleBtnClass(workMode === 'shelf')}
                >
                  File Shelf
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
              {workMode === 'todos'
                ? 'Manage today’s checklist with plain local Markdown file sync and start inline Pomodoro focus timers directly on any task row.'
                : 'Drag files onto the island to stage them temporarily while switching workspaces, then drag them straight into mail, chat, or browser upload fields.'}
            </p>
          </div>
          {renderCaptureFrame(workImg, `work-${workMode}`)}
        </article>

        {/* 04. Live PC Health & Quick Translation (6 cols) */}
        <article className={`lg:col-span-6 ${cardClass}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold tracking-tight text-[#111318] dark:text-[#F4F5F8]">
                04. System Monitor & Translation
              </h3>
              <div className={toggleGroupClass}>
                <button
                  type="button"
                  onClick={() => setUtilMode('system')}
                  className={toggleBtnClass(utilMode === 'system')}
                >
                  System Monitor
                </button>
                <button
                  type="button"
                  onClick={() => setUtilMode('translation')}
                  className={toggleBtnClass(utilMode === 'translation')}
                >
                  Quick Translation
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-[15px] leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
              {utilMode === 'system'
                ? 'Watch real-time processor load sparklines, memory usage, NVMe storage activity, and network transfer rates—with instant volume and laptop brightness sliders at the top.'
                : 'Type or paste text directly in the island or open the standalone window with Ctrl + Shift + F. Uses keyless MyMemory out of the box or your own OpenAI-compatible API.'}
            </p>
          </div>
          {renderCaptureFrame(utilImg, `util-${utilMode}`)}
        </article>

        {/* 05. Additional Native Windows Capabilities Strip (12 cols) */}
        <article className="lg:col-span-12 rounded-[22px] border border-[#E2E6EC] bg-white p-7 sm:p-8 dark:border-white/9 dark:bg-[#11141D] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#ECEFF4] dark:divide-white/8">
            <div>
              <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F4F5F8]">
                05. Searchable Clipboard History
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
                Press{' '}
                <kbd className="inline-block rounded-md border border-[#D4DAE3] bg-[#F6F7F9] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#111318] shadow-[0_1px_0_rgba(15,23,42,0.08)] dark:border-white/14 dark:bg-[#1A1F2C] dark:text-[#F4F5F8]">
                  Ctrl + Shift + W
                </kbd>{' '}
                (remappable in Settings) to search locally saved text, copied images, and file paths
                in a dedicated fast window—stored strictly in your local app folder.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-8">
              <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F4F5F8]">
                06. Optional Live Wallpaper & Mond Clock
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
                Play muted looping MP4 or MOV files behind your desktop icons without re-encoding
                (auto-pauses when windows cover the desktop or on battery), paired with movable
                desktop widgets like the cut-geometric Mond clock.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#111318] dark:text-[#F4F5F8]">
                  07. Hardware Privacy & Game Mode
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#A1AAB8]">
                  Shows a subtle mic or camera usage indicator on the collapsed island while active,
                  and automatically suppresses pop-ups and idle updates during full-screen exclusive
                  games.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#525B69] dark:text-[#8E98A8]">
                <ShieldCheck className="h-4 w-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0" />
                <span>Every behavior toggle is individually switchable</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
