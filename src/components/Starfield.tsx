"use client";

import { useEffect, useRef } from "react";

/**
 * Starfield — a subtle static starry background for the universe pages.
 * Soft twinkling stars on transparent canvas, meant to sit behind content.
 */
export default function Starfield({ density = 180 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: { x: number; y: number; r: number; a: number; speed: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      stars = [];
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          a: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.02 + 0.004,
        });
      }
    };

    const draw = (t: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      // bluish-white stars. Each has a near-static opacity with an extremely
      // slow drift (~1 cycle per several minutes) so motion is imperceptible
      // but the field feels alive on a second glance.
      for (const s of stars) {
        const drift = 0.92 + 0.08 * Math.sin(t * 0.00015 + s.x * 0.13 + s.y * 0.13);
        ctx.fillStyle = `rgba(255,255,255,${s.a * drift})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      init();
    };

    resize();
    init();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
