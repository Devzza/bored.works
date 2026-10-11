"use client";

/**
 * RotateScene — the green planet that slides across the screen between
 * The Apehands and Decentral Frens.
 *
 * Transparent overlay: it holds only the green planet (a single visual, like
 * page 2's but green). With `progress`:
 *   0   -> planet off the right edge
 *   1   -> planet centered (its "page")
 *   2   -> planet off the left edge (leading into the warp)
 *
 * The dark backdrop / stars come from The Apehands world that sits underneath
 * and slides away to the left at the same time.
 */
export default function RotateScene({ progress = 0 }: { progress?: number }) {
  // horizontal position of the planet in % of the viewport width.
  let x = 0;
  if (progress <= 1) x = (1 - progress) * 100;
  else x = -(progress - 1) * 100;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* the green planet, sliding horizontally */}
      <div
        className="absolute left-1/2 top-1/2 h-[38vh] w-[38vh]"
        style={{
          transform: `translate(-50%, -50%) translateX(${x.toFixed(1)}vw)`,
          transition: "transform 0.7s cubic-bezier(0.2,0.8,0.3,1)",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #a3e635 0%, #4ade80 35%, #16a34a 68%, #14532d 100%)",
            boxShadow: "inset -30px -40px 60px rgba(0,20,0,0.55)",
          }}
        />
      </div>
    </div>
  );
}
