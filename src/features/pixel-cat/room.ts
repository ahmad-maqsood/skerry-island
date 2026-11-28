// How much empty bar there is to the left of the cat's lane. The lane follows the text slot, which
// takes all the spare width, so with little or no text there is room the cat can chase into.

/** Room kept between the cat and the nearest text, in screen px. */
const TEXT_GAP = 4;

/**
 * The leftmost screen x the cat may reach: past the end of whatever the text slot before `lane`
 * is showing, or null when the lane does not follow the text slot. The text's own boxes stretch
 * across the slot, so the words are measured, not their elements.
 */
export function freeLeftEdge(lane: HTMLElement): number | null {
  const slot = lane.previousElementSibling;
  if (!slot?.classList.contains("island__text-slot")) return null;
  const { left, right } = slot.getBoundingClientRect();
  let edge = left;
  const reach = (box: DOMRect) => {
    if (box.width) edge = Math.max(edge, Math.min(right, box.right + TEXT_GAP));
  };
  const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    reach(range.getBoundingClientRect());
  }
  slot.querySelectorAll("img, svg, .island-update-dot").forEach((picture) => reach(picture.getBoundingClientRect()));
  return edge;
}
