"use client";

import { useEffect, useState } from "react";

/**
 * Hero — the intro with the bored·works brand only.
 * White background, dark logo with a single blue dot, Dela Gothic One font.
 * When `exiting`, the logo shrinks inward (the blue portal is drawn by
 * Landing on top of the screen center).
 */
export default function Hero({ exiting = false }: { exiting?: boolean }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden bg-white">
      <div className="relative z-10 px-6 text-center">
        <div
          className="transition-all duration-700 ease-in"
          style={{
            opacity: started ? 1 : 0,
            transform: started ? "translateY(0)" : "translateY(20px)",
            filter: started ? "blur(0px)" : "blur(12px)",
            ...(exiting
              ? { transform: "scale(0.3)", opacity: 0, filter: "blur(8px)" }
              : {}),
          }}
        >
          {/* logo / marca (Dela Gothic One) */}
          <div className="font-display mb-6 flex items-center justify-center gap-2 text-4xl tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
            <span>bored</span>
            <span className="text-[#2563eb]">·</span>
            <span>works</span>
          </div>
        </div>
      </div>
    </section>
  );
}
