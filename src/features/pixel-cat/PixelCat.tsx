import { useRef, type CSSProperties } from "react";
import { CAT_WIDTH, PIXEL_SIZE, type CatProp } from "./brain";
import { PIXEL_CAT_LANE_WIDTH } from "./model";
import { POSES, PROPS, SPRITE_HEIGHT, SPRITE_WIDTH, spriteRuns, type PixelRun } from "./sprite";
import { useCatBrain } from "./useCatBrain";
import "./PixelCat.css";

const laneStyle = {
  "--pixel-cat-lane": `${PIXEL_CAT_LANE_WIDTH}px`,
  "--pixel-cat-width": `${CAT_WIDTH}px`,
  "--pixel-cat-height": `${SPRITE_HEIGHT * PIXEL_SIZE}px`,
} as CSSProperties;

const rects = (runs: readonly PixelRun[]) => runs.map((run) => (
  <rect key={`${run.x}/${run.y}`} className={`pixel-cat__px--${run.kind}`} x={run.x} y={run.y} width={run.width} height={1} />
));

/** A small picture beside the cat, drawn at the cat's own pixel size. */
function Prop({ name, rows }: { name: string; rows: readonly string[] }) {
  return (
    <svg className={`pixel-cat__prop pixel-cat__${name}`} width={rows[0].length * PIXEL_SIZE} height={rows.length * PIXEL_SIZE}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges">{rects(spriteRuns(rows))}</svg>
  );
}

/** The things drawn above the cat, outside its turn, so they are never mirrored. */
function Above({ prop }: { prop: CatProp }) {
  if (prop === "snores") return <div className="pixel-cat__above">{[0, 1].map((index) => <Prop key={index} name="snore" rows={PROPS.snore} />)}</div>;
  if (prop === "hearts") return <div className="pixel-cat__above">{[0, 1].map((index) => <Prop key={index} name="heart" rows={PROPS.heart} />)}</div>;
  if (prop === "notice") return <div className="pixel-cat__above"><Prop name="notice" rows={PROPS.notice} /></div>;
  return null;
}

/**
 * A small pixel cat on the collapsed island, in the place the clock would take. On its own it
 * walks, sits, washes, pounces on a ball of yarn, yawns, stretches, loafs, naps and dashes about
 * (brain.ts). With the cursor on the island it looks up, chases it along its lane, swats at it,
 * and purrs while the cursor rests on it. Decorative: it is hidden from assistive technology and
 * lets clicks through to the bar. `active` is false while the island is open or tucked, which
 * pauses it.
 */
export function PixelCat({ active }: { active: boolean }) {
  const laneRef = useRef<HTMLDivElement>(null);
  const { pose, x, moveMs, facing, prop } = useCatBrain(laneRef, active);
  const art = POSES[pose];
  return (
    <div ref={laneRef} className={`pixel-cat${active ? "" : " pixel-cat--paused"}`} style={laneStyle} data-pose={pose} aria-hidden="true">
      <div className="pixel-cat__walker" style={{ translate: `${x}px 0`, transitionDuration: `${moveMs}ms` }}>
        <div className={`pixel-cat__hop${pose === "leap" ? " pixel-cat__hop--leaping" : ""}`}>
          <div className="pixel-cat__turn" style={{ transform: `scaleX(${facing})` }}>
            <svg className="pixel-cat__sprite" viewBox={`0 0 ${SPRITE_WIDTH} ${SPRITE_HEIGHT}`} shapeRendering="crispEdges">
              {/* Keyed by pose, so a new pose starts on its first frame. */}
              <g key={pose} style={{ "--pixel-cat-frame-ms": `${art.frameMs ?? 0}ms` } as CSSProperties}>
                {art.frames.map((rows, index) => (
                  <g key={index} className={art.frames.length > 1 ? `pixel-cat__frame pixel-cat__frame--${index}` : undefined}>
                    {rects(spriteRuns(rows))}
                  </g>
                ))}
                {art.blink && <rect className="pixel-cat__px--fur pixel-cat__blink" x={art.blink.x} y={art.blink.y} width={1} height={1} />}
              </g>
            </svg>
            {/* Inside the turn: the yarn is always in front of the cat. */}
            {prop === "yarn" && <Prop name="yarn" rows={PROPS.yarn} />}
          </div>
        </div>
        <Above prop={prop} />
      </div>
    </div>
  );
}
