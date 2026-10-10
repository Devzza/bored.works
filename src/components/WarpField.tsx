"use client";

import { useEffect, useRef, useState } from "react";

type Star = {
  angle: number; // radial angle from center (radians)
  r: number; // current radius (px) from center
  depth: number; // 1 (far) → 0 (near/at viewer)
};

/**
 * WarpField — the "speed of light" / hyperspace transition.
 *
 * Stars live on radial spokes from the screen center. As their depth
 * decreases they fly outward along their spoke, drawing a long trailing
 * streak — the classic lightspeed / hyperdrive look. The field fades out
 * (via parent) to reveal the next world.
 */
export default function WarpField({
  intensity = 1,
  onDone,
}: {
  intensity?: number;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    const starCount = Math.round(340 * intensity);
    const speed = 0.028; // depth decay per frame, tuned for smooth streaks

    // Per-frame radius scaling: as depth → 0 the radial position blows up.
    const project = (star: Star, depth: number) => {
      const scale = 1 / Math.max(depth, 0.02);
      return star.r * scale;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initStars = () => {
      stars = [];
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const maxR = Math.hypot(w, h) + 80;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          angle: Math.random() * Math.PI * 2,
          r: Math.random() * maxR * 0.35,
          depth: Math.random() * 0.9 + 0.05,
        });
      }
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const prevDepth = s.depth;
        s.depth -= speed;

        if (s.depth <= 0.02) {
          // recycle: reset to far away at a fresh angle
          s.depth = 1;
          s.angle = Math.random() * Math.PI * 2;
        }

        const curR = project(s, s.depth);
        const px = cx + Math.cos(s.angle) * curR;
        const py = cy + Math.sin(s.angle) * curR;

        // tail: where it was last frame (further out in same spoke)
        const rela = (s.depth - prevDepth) / prevDepth; // fraction moved toward light speed
        const travel = curR * rela;

        // streak color/alpha: bright near viewer, dim deep
        const near = 1 - s.depth;
        const alpha = Math.min(1, 0.15 + near * 0.85);

        const nx = Math.cos(s.angle);
        const ny = Math.sin(s.angle);

        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.85})`;
        ctx.lineWidth = 1 + near * 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - nx * travel, py - ny * travel);
        ctx.stroke();

        // bright head
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha + 0.25)})`;
        ctx.beginPath();
        ctx.arc(px, py, 0.8 + near * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      initStars();
    };

    resize();
    initStars();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", onResize);

    // auto fade out after a short "travel" moment; parent also fades overlay
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1100);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, [intensity, onDone]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 1.1s ease" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#0a0a14,transparent_65%)]" />
    </div>
  );
}
