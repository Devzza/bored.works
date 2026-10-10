"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hero from "./Hero";
import WarpPage from "./WarpPage";
import World from "./World";
import Socials from "./Socials";
import WarpField from "./WarpField";

// Content views.
type View = "hero" | "warp" | "world1" | "world2" | "socials";

const ORDER: View[] = ["hero", "warp", "world1", "world2", "socials"];

/**
 * Landing — the scroll-driven experience.
 *
 * Flow:
 *   logo ──fade+smooth──▶ universo ──warp──▶ world1 ──warp──▶ world2
 *
 * Between the logo and the Universo page the transition is a plain fade-out
 * of the logo while the blue dot zooms into place (a planet). Everywhere else
 * we use the lightspeed warp.
 */
export default function Landing() {
  const [view, setView] = useState<View>("hero");
  const [trans, setTrans] = useState<View | null>(null); // destination while transitioning
  const [warpFading, setWarpFading] = useState(false);
  const [softTransition, setSoftTransition] = useState(false); // explicit, non-derived
  const [planetOut, setPlanetOut] = useState(false); // universo dives into its dot before warp
  const [warpReady, setWarpReady] = useState(true); // warp overlay only mounts once ready
  const [leaving, setLeaving] = useState<View | null>(null); // world whose content is fading out
  const timers = useRef<number[]>([]);
  const touchStart = useRef<number | null>(null); // vertical swipe detection

  const locked = trans !== null;

  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Whether the active transition uses the lightspeed warp overlay.
  // Uses the explicit softTransition flag so it stays true for the whole soft
  // fade (even though `view` has already flipped and `trans` still points at
  // the destination).
  const usesWarp = trans !== null && !softTransition && warpReady;

  const beginTransition = useCallback(
    (to: View) => {
      setTrans(to);
      setWarpFading(false);
      // Soft transitions (logo <-> universo) swap the view directly: the logo
      // fades out while the planet zooms in. No warp, finish after a short grow.
      const soft =
        (view === "hero" && to === "warp") || (view === "warp" && to === "hero");
      setSoftTransition(soft);
      if (soft) {
        setView(to);
        timers.current.push(
          window.setTimeout(() => {
            setSoftTransition(false);
            setTrans(null);
          }, 950)
        );
      } else if (view === "warp") {
        // Leaving the universo (planet) toward a world: first dive INTO the
        // blue dot (planet zooms up), then the warp starts.
        setPlanetOut(true);
        setWarpReady(false);
        timers.current.push(
          window.setTimeout(() => {
            setWarpReady(true); // warp overlay mounts now
            setView(to); // hide the universo behind the opaque overlay
          }, 750)
        );
      } else if (view === "socials") {
        // Leaving the closing socials page back to a world: direct warp.
        setWarpReady(true);
        setView(to);
      } else {
        // Leaving a World (3->4, 4->3, 3->2): fade the content out first,
        // then the warp starts right as it finishes.
        setLeaving(view);
        timers.current.push(
          window.setTimeout(() => {
            setLeaving(null);
            setWarpReady(true); // warp overlay mounts now
            setView(to); // hide the source behind the opaque overlay
          }, 420)
        );
      }
    },
    [view]
  );

  // ── Completion ─────────────────────────────────────────────────────
  // Warp-based transitions: the warp has run, reveal destination & fade overlay.
  const handleWarpDone = useCallback(() => {
    if (!trans) return;
    setView(trans);
    setWarpFading(true);
    setSoftTransition(false);
    setPlanetOut(false);
    timers.current.push(
      window.setTimeout(() => {
        setWarpFading(false);
        setTrans(null);
      }, 650)
    );
  }, [trans]);

  // ── Navigation ─────────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (locked) return;
      const i = ORDER.indexOf(view);
      if (e.deltaY > 20 && i < ORDER.length - 1) beginTransition(ORDER[i + 1]);
      else if (e.deltaY < -20 && i > 0) beginTransition(ORDER[i - 1]);
    },
    [locked, view, beginTransition]
  );

  // ── Touch / swipe navigation (mobile) ────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0]?.clientY ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dy = (e.changedTouches[0]?.clientY ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (locked) return;
    if (Math.abs(dy) < 40) return; // ignore taps / small moves
    const i = ORDER.indexOf(view);
    if (dy < 0 && i < ORDER.length - 1) beginTransition(ORDER[i + 1]); // swipe up = next
    else if (dy > 0 && i > 0) beginTransition(ORDER[i - 1]); // swipe down = previous
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked) return;
      const i = ORDER.indexOf(view);
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        if (i < ORDER.length - 1) beginTransition(ORDER[i + 1]);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (i > 0) beginTransition(ORDER[i - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, view, beginTransition]);

  const active = {
    hero: view === "hero",
    warp: view === "warp",
    world1: view === "world1",
    world2: view === "world2",
    socials: view === "socials",
  };

  // Layer style: fade opacity (+ let the current page zoom inward on exit
  // for locked frames; the logo/planet handle their own entrance internally).
  const layerStyle = (v: View): React.CSSProperties => {
    const isActive = (active as Record<View, boolean>)[v];
    return {
      opacity: isActive ? 1 : 0,
      pointerEvents: isActive ? "auto" : "none",
      transition: "opacity 0.7s ease",
    };
  };

  return (
    <main
      className="relative h-[100vh] w-full touch-none overflow-hidden bg-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── views ───────────────────────────────────── */}
      <div className="absolute inset-0" style={layerStyle("hero")}>
        <Hero exiting={view === "hero" && trans === "warp"} />
      </div>
      <div className="absolute inset-0" style={layerStyle("warp")}>
        <WarpPage entering={view === "warp"} outgoing={planetOut} />
      </div>
      <div className="absolute inset-0" style={layerStyle("world1")}>
        <World
          index={1}
          accent="#ff4d00"
          name="The Apehands"
          exiting={leaving === "world1"}
          blurb={[
            "The Apehands is an animated kids' series about the Handerson family — Banjo, Kira, Mum and Dad — four hand-shaped characters who share playful, everyday adventures full of curiosity and fun.",
            "For this IP focused on the little ones at home, we've created related activities that will allow them to learn while playing Banjo and Kira.",
          ]}
          socials={[
            { label: "official site", href: "https://theapehands.com", icon: "web" },
            { label: "X", href: "https://x.com/TheApehands", icon: "x" },
            { label: "Instagram", href: "https://instagram.com/TheApehands", icon: "instagram" },
            { label: "YouTube", href: "https://www.youtube.com/@TheApehands", icon: "youtube" },
          ]}
        />
      </div>
      <div className="absolute inset-0" style={layerStyle("world2")}>
        <World
          index={2}
          accent="#38bdf8"
          name="Decentral Frens"
          exiting={leaving === "world2"}
          blurb={[
            "Decentral Frens is the story of a pizza guy who tries to live a normal life — despite his condition — working as a Scan-n-Bag guy at a supermarket alongside his frens. However, they are dragged into an adventure that will take them far beyond the supermarket aisles.",
            "This is a youth-focused comedy IP with some mysteries and collectibles across different content and games.",
          ]}
          socials={[
            { label: "official site", href: "https://decentralfrens.com", icon: "web" },
            { label: "X", href: "https://x.com/DecentralFrens", icon: "x" },
            { label: "Instagram", href: "https://instagram.com/decentralfrens", icon: "instagram" },
            { label: "YouTube", href: "https://youtube.com/@decentralfrens", icon: "youtube" },
          ]}
        />
      </div>
      <div className="absolute inset-0" style={layerStyle("socials")}>
        <Socials />
      </div>

      {/* ── Lightspeed warp overlay (NOT for soft logo→universo) ─── */}
      {usesWarp && (
        <div
          className="fixed inset-0 z-50 bg-[#050507]"
          style={{ opacity: warpFading ? 0 : 1, transition: "opacity 0.65s ease" }}
        >
          <WarpField intensity={trans === "world2" ? 1.2 : 1} onDone={handleWarpDone} />
        </div>
      )}

      {/* ── Always-visible brand (top-left) — on every page except 1 & 2,
           and over the warp (z-60 above the z-50 overlay) ─── */}
      {!active.hero && !active.warp && (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-6 py-6">
          {/* brand (top-left) */}
          <div className="font-display flex items-center gap-1 text-lg text-white">
            <span>bored</span>
            <span style={{ color: "#ffffff" }}>·</span>
            <span>works</span>
          </div>
          {/* ghost CTA (top-right) */}
          <button
            type="button"
            className="pointer-events-auto rounded-full border border-white/70 bg-transparent px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-white/10"
          >
            Get your id.bored now
          </button>
        </header>
      )}

      {/* ── Always-visible scroll indicator (bottom-right corner) ─── */}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2"
        style={{ color: active.hero || active.warp ? "#171717" : "#d4d4d4" }}
        aria-hidden
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.35em]">Scroll</span>
        <svg
          width="20"
          height="31"
          viewBox="0 0 20 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="1" width="18" height="29" rx="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="8" r="2" fill="currentColor" />
        </svg>
      </div>
    </main>
  );
}
