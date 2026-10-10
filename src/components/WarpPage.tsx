"use client";

import { useEffect, useState } from "react";

/**
 * Universo — a clean white page with a big blue planet-like dot (~intro size,
 * ~30–40% of the screen height, responsive). The dot zooms in (grow) each time
 * the view becomes active, and dives into the warp when leaving.
 *
 * Interactive light: a soft highlight on the surface follows the cursor as the
 * user moves the mouse anywhere on the page (not just over the planet).
 */
export default function WarpPage({
  entering = true,
  outgoing = false,
}: {
  entering?: boolean;
  outgoing?: boolean;
}) {
  const [grown, setGrown] = useState(false);
  const [outState, setOutState] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 }); // -1..1, relative to viewport center

  // Re-trigger growth whenever the view becomes active.
  useEffect(() => {
    if (!entering) return;
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [entering]);

  // Dive out: the planet zooms up toward the viewer, the page goes dark,
  // handing off seamlessly into the lightspeed warp.
  useEffect(() => {
    setOutState(outgoing);
  }, [outgoing]);

  // Listen to the cursor anywhere on the page so the light follows it even
  // when the mouse is outside the planet.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Highlight position on the surface (in % of the planet) tracks the cursor.
  const lx = 50 + mouse.x * 45;
  const ly = 50 + mouse.y * 45;

  return (
    <section className="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden bg-white">
      {/* keyframes for the slow planet rotation (defined once) */}
      <style>{`
        @keyframes planet-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* the big blue planet (responsive ~30–40% of screen height) */}
      <div
        className="relative h-[30vh] w-[30vh] overflow-hidden rounded-full sm:h-[34vh] sm:w-[34vh] md:h-[40vh] md:w-[40vh]"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, #7dd3fc 0%, #3b82f6 35%, #1d4ed8 68%, #1e3a8a 100%)",
          boxShadow: "inset -30px -40px 60px rgba(0,0,40,0.55)",
          transform: outState
            ? "scale(9)"
            : `scale(${grown ? 1 : 0.12})`,
          opacity: outState ? 0.85 : grown ? 1 : 0.3,
          transition: outState
            ? "transform 0.7s cubic-bezier(0.7,0,0.3,1), opacity 0.7s ease"
            : "transform 1.1s cubic-bezier(0.2,0.7,0.3,1), opacity 0.5s ease",
        }}
        aria-hidden
      >
        {/* slowly rotating surface texture — off-center cold blobs so the spin shows */}
        <div
          className="pointer-events-none absolute -inset-[50%] rounded-full"
          style={{
            animation: "planet-spin 55s linear infinite",
            background:
              "radial-gradient(circle at 22% 30%, rgba(186,230,253,0.5), transparent 40%),"
              + "radial-gradient(circle at 78% 66%, rgba(165,180,252,0.45), transparent 42%),"
              + "radial-gradient(circle at 62% 18%, rgba(125,211,252,0.4), transparent 38%),"
              + "radial-gradient(circle at 30% 78%, rgba(148,197,253,0.35), transparent 40%)",
            mixBlendMode: "screen",
            filter: "blur(10px)",
            opacity: 0.75,
          }}
        />
        {/* soft light that tracks the cursor, clipped to the sphere */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at ${lx.toFixed(1)}% ${ly.toFixed(1)}%, rgba(224,242,254,0.75), rgba(125,211,252,0.3) 30%, transparent 58%)`,
            mixBlendMode: "screen",
            transition: "background 0.1s linear",
          }}
        />
      </div>

      {/* dark vignette while diving into the dot — blends into the warp */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "#050507",
          opacity: outState ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
        aria-hidden
      />
    </section>
  );
}
