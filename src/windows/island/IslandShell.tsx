import { isGlass } from "../../features/appearance/settings";
import type { ReactNode } from "react";
import type { CollapsedItem, CollapsedSlot, IslandShape, Material, PageButtonStyle, PageDot, TuckStyle } from "../../features/appearance/types";
import type { MediaState } from "../../features/media/api";
import { MusicBackdrop } from "../../features/media/MusicBackdrop";
import type { MessagePreview } from "../../features/messages/messagePreview";
import type { SystemNotificationsController } from "../../features/messages/system-notifications/useSystemNotifications";
import { useTranslation } from "../../i18n";
import type { IslandFeatures } from "./features";
import { IslandCollapsedBar } from "./IslandCollapsedBar";
import { IslandHeader } from "./IslandHeader";
import type { IslandMode, IslandPage, NativeGlassState } from "./types";
import { useGlassPointer } from "./useGlassPointer";
import { useIslandPreparing } from "./useIslandPreparing";
import { useMotionLayer } from "./useMotionLayer";
import { usePageFadeIn } from "./usePageFadeIn";
import type { LyricsSettings } from "../../features/media/lyrics/useLyrics";
import type { TodoTimer } from "../../features/todos/timer";
import type { TodoRotationDisplay } from "./CollapsedTodoContent";
import type { NoticeSize } from "./noticeLayout";
import "./IslandShell.css";
import "./IslandPageText.css";
import "./IslandGlass.css";
import "./IslandGlassColour.css";
import "./IslandGraphite.css";
import "./IslandMidnight.css";
import "./IslandTuckStyle.css";
import { useTuckMorph } from "./useTuckMorph";

type IslandShellProps = {
  systemNotifications: SystemNotificationsController;
  onOpenMessages: () => void;
  /** The newest message preview to show on the collapsed island (useIslandNotices), or null. */
  preview: MessagePreview | null;
  /** The size the adaptive preview grew the island to (useMessageNotice), or null. */
  notice: NoticeSize | null;
  mode: IslandMode;
  page: IslandPage;
  /** The open page's height (unscaled); a change resizes the shape around the panel. */
  expandedHeight: number;
  material: Material;
  nativeGlassState: NativeGlassState;
  isTucked: boolean;
  /** Slid out by a pop-up and due straight back: the bar keeps to the pop-up until it has tucked. */
  peekedForMessage?: boolean;
  /** How the island looks while tucked: its own rim (edge), a short line, or nothing. */
  tuckStyle: TuckStyle;
  topEdgeShoulders: boolean;
  positionLocked: boolean;
  /** Moved away from its default place by a drag or the margin; a capsule floats without that. */
  isDetached: boolean;
  islandShape?: IslandShape;
  showTitle: boolean;
  showCollapsedText: boolean;
  collapsedTaskTitle: string | null;
  todoTimer?: TodoTimer | null;
  todoRotation?: TodoRotationDisplay | null;
  collapsedTodoCount: number | null;
  /** Which of the lyric line and a todo the collapsed island's text shows, if any. */
  collapsedItem: CollapsedItem | null;
  collapsedLayout: readonly CollapsedSlot[];
  /** The playing song's cover for the collapsed island, or null when it is not shown. */
  collapsedCover: string | null;
  /** Where the collapsed island's lyric line comes from. */
  lyricsSettings: LyricsSettings & { lyricsOffsetMs: number };
  /** Order of the header's page dots, and saving a new one after a drag. */
  pageOrder: PageDot[];
  pageButtonStyle: PageButtonStyle;
  onPageOrderChange: (order: PageDot[]) => void;
  mediaState: MediaState;
  /** Modules switched on; the header and collapsed bar hide the rest. */
  features: IslandFeatures;
  /** Files on the shelf for the collapsed bar, or null when it does not show them. */
  shelfCount: number | null;
  onOpenPage: (page: IslandPage) => void;
  /** Opens the island on its first page. */
  onExpand: () => void;
  onWindowDragStart: () => void;
  onCollapse: () => void;
  onResetPosition: () => void;
  minimizesToTray: boolean;
  /** Null with "always display island" on, which hides the minimize buttons. */
  onMinimize: (() => void) | null;
  /** Null while translation is switched off, which hides its button. */
  onOpenTranslator: (() => void) | null;
  /** One line from the selection shortcut, shown on the collapsed island, or null. */
  onOpenSettings: () => void;
  onReveal: () => void;
  onPageChange: (page: IslandPage) => void;
  /** Buttons of the open page, first among the window actions. */
  pageActions?: ReactNode;
  children: ReactNode;
};

export function IslandShell({
  systemNotifications,
  onOpenMessages,
  preview,
  notice,
  mode,
  page,
  expandedHeight,
  material,
  nativeGlassState,
  isTucked,
  peekedForMessage = false,
  tuckStyle,
  topEdgeShoulders,
  positionLocked,
  isDetached,
  islandShape = "notch",
  showTitle,
  showCollapsedText,
  collapsedTaskTitle,
  todoTimer = null,
  todoRotation = null,
  collapsedTodoCount,
  collapsedItem,
  collapsedLayout,
  collapsedCover,
  lyricsSettings,
  pageOrder,
  pageButtonStyle,
  onPageOrderChange,
  mediaState,
  features,
  shelfCount,
  onOpenPage,
  onExpand,
  onWindowDragStart,
  onCollapse,
  onResetPosition,
  minimizesToTray,
  onMinimize,
  onOpenTranslator,
  onOpenSettings,
  onReveal,
  onPageChange,
  pageActions,
  children,
}: IslandShellProps) {
  const t = useTranslation();
  const isExpanded = mode === "expanded";
  const glass = isGlass(material);
  // Liquid glass and prism catch the pointer's light; aurora and prism draw a rim (and a streak) too.
  const tracksPointer = material === "liquidGlass" || material === "prism";
  const hasRim = glass && material !== "frostedGlass";
  const { handleGlassPointerMove, resetGlassPointer } = useGlassPointer(tracksPointer);
  const isPreparing = useIslandPreparing(isExpanded);
  const tuckMorphClass = useTuckMorph(isTucked, tuckStyle);
  const contentRef = usePageFadeIn<HTMLDivElement>(page, mode);
  const panelRef = useMotionLayer<HTMLDivElement>(mode, page, expandedHeight);
  const notificationCount = systemNotifications.snapshot.items.length;
  const className = [
    "island",
    `island--${mode}`,
    `island--${page}`,
    `island--material-${material}`,
    isPreparing && !isExpanded ? "island--preparing" : "",
    isDetached || islandShape === "capsule" ? "island--detached" : "island--docked",
    islandShape === "capsule" ? "island--capsule" : "",
    isTucked ? "island--tucked" : "",
    tuckMorphClass,
    topEdgeShoulders && islandShape !== "capsule" ? "island--shoulders" : "",
    glass ? `island--glass-${nativeGlassState}` : "",
    showTitle ? "" : "island--title-hidden",
    notice && !isExpanded ? "island--notice" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const collapsedLabel = showCollapsedText
    ? todoTimer
      ? t.todo.actionOnTask(todoTimer.notified ? t.todo.timeUp : t.todo.countdown, collapsedTaskTitle ?? "")
      : collapsedTaskTitle
      ? collapsedTaskTitle
      : collapsedTodoCount !== null
        ? t.island.pendingTodos(collapsedTodoCount)
        : "Skerry"
    : "Skerry";

  return (
    <section
      className={className}
      aria-label={collapsedLabel}
      onClick={(event) => {
        if (!isExpanded && event.target === event.currentTarget) {
          onExpand();
        }
      }}
      onPointerMove={handleGlassPointerMove}
      onPointerLeave={resetGlassPointer}
      onMouseEnter={() => {
        if (isTucked) {
          onReveal();
        }
      }}
    >
      <span className="island__shoulders" aria-hidden="true" />
      {glass && <span className="island__glass-shadow" aria-hidden="true" />}
      <div className="island__surface">
        {/* Outside .island__glass, whose top fades out when attached (IslandTopEdge.css). */}
        {glass && <div className="island__glass-backdrop" aria-hidden="true"><canvas /></div>}
        {glass && (
          <div className="island__glass" aria-hidden="true">
            {hasRim && <span className="island__glass-refraction" />}
            {hasRim && <span className="island__glass-highlight" />}
          </div>
        )}
        {page === "music" && features.music && <MusicBackdrop mediaState={mediaState} />}
        <IslandCollapsedBar
          systemNotifications={systemNotifications}
          preview={preview}
          noticeReader={notice?.reader ? { scrolls: notice.scrolls } : null}
          isExpanded={isExpanded}
          isTucked={isTucked}
          peekedForMessage={peekedForMessage}
          positionLocked={positionLocked}
          showTitle={showTitle}
          showCollapsedText={showCollapsedText}
          collapsedLabel={collapsedLabel}
          collapsedTaskTitle={collapsedTaskTitle}
          todoTimer={todoTimer}
          todoRotation={todoRotation}
          collapsedTodoCount={collapsedTodoCount}
          collapsedItem={collapsedItem}
          collapsedLayout={collapsedLayout}
          collapsedCover={collapsedCover}
          lyricsSettings={lyricsSettings}
          mediaState={mediaState}
          showMusic={features.music}
          shelfCount={shelfCount}
          onOpenPage={onOpenPage}
          onExpand={onExpand}
          onWindowDragStart={onWindowDragStart}
          minimizesToTray={minimizesToTray}
          onMinimize={onMinimize}
        />

        <div
          ref={panelRef}
          id="island-panel"
          className="island__expanded"
          aria-hidden={!isExpanded}
          inert={!isExpanded}
        >
          <IslandHeader
            isExpanded={isExpanded && !isTucked}
            page={page}
            features={features}
            pageOrder={pageOrder}
            pageButtonStyle={pageButtonStyle}
            onPageOrderChange={onPageOrderChange}
            showTitle={showTitle}
            isDetached={isDetached}
            notificationCount={notificationCount}
            onPageChange={onPageChange}
            onCollapse={onCollapse}
            onOpenSettings={onOpenSettings}
            onOpenMessages={onOpenMessages}
            onOpenTranslator={onOpenTranslator}
            onResetPosition={onResetPosition}
            minimizesToTray={minimizesToTray}
            onMinimize={onMinimize}
            pageActions={pageActions}
          />
          <div ref={contentRef} className="island__content">{children}</div>
        </div>
      </div>
    </section>
  );
}
