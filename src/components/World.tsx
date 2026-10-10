"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Starfield from "./Starfield";
import {
  WebIcon,
  XIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
} from "./BrandIcons";

type Social = {
  label: string;
  href: string;
  icon: "web" | "x" | "instagram" | "youtube" | "tiktok";
};

const ICON_MAP = {
  web: WebIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
} as const;

const DEFAULT_SOCIALS: Social[] = [
  { label: "official site", href: "#", icon: "web" },
  { label: "X", href: "#", icon: "x" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "TikTok", href: "#", icon: "tiktok" },
];

/**
 * World — one IP section. A starry universe panel with a big title,
 * lorem ipsum blurb and social links.
 */
export default function World({
  index,
  accent,
  name,
  blurb,
  socials = DEFAULT_SOCIALS,
  exiting = false,
}: {
  index: number; // for the numbering like 01, 02
  accent: string; // hex color used as accent
  name: string;
  blurb?: string[]; // optional custom description paragraphs
  socials?: Social[];
  exiting?: boolean; // fade the content out before the warp starts
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100vh] w-full items-center overflow-hidden px-6 py-24"
      style={{
        background: `radial-gradient(1200px 600px at 20% 0%, ${accent}22, transparent 60%), radial-gradient(900px 500px at 85% 100%, ${accent}14, transparent 60%), #07070a`,
      }}
    >
      {/* starry universe background */}
      <Starfield />
      {/* big background number */}
      <span
        className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none font-display text-[30vh] font-black leading-none text-white/[0.04]"
        aria-hidden
      >
        {String(index).padStart(2, "0")}
      </span>

      <div
        className="relative z-10 mx-auto w-full max-w-5xl ease-out"
        style={{
          opacity: exiting ? 0 : inView ? 1 : 0,
          transform: exiting ? "translateY(-40px)" : inView ? "translateY(0)" : "translateY(60px)",
          transition: exiting
            ? "opacity 450ms ease, transform 450ms ease"
            : "opacity 1200ms ease, transform 1200ms ease-out",
        }}
      >
        <h2 className="font-display text-5xl tracking-tight text-white sm:text-7xl md:text-8xl">
          {name}
        </h2>

        {/* description — custom blurb paragraphs if provided, otherwise placeholder */}
        {blurb ? (
          blurb.map((para, i) => (
            <p
              key={i}
              className={"max-w-2xl text-base leading-relaxed text-neutral-300" + (i === 0 ? " mt-8" : " mt-5")}
            >
              {para}
            </p>
          ))
        ) : (
          <>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-neutral-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
              venenatis purus sed nulla vehicula, sit amet dapibus nisi pretium.
              Nulla facilisi. Integer at libero eget lacus dignissim gravida. Cras
              in magna non ipsum ultricies tincidunt sed at justo.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-500">
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae; Morbi congue mi a turpis tincidunt, eget
              viverra turpis fringilla. Donec sagittis sem non ante volutpat, eu
              faucibus justo posuere.
            </p>
          </>
        )}

        {/* socials — only icons, except "official site" keeps its label */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {socials.map((s) => {
            const Icon = ICON_MAP[s.icon];
            const isWeb = s.icon === "web";
            return (
              <Link
                key={s.label}
                href={s.href}
                target={s.href !== "#" ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={s.label}
                className={
                  isWeb
                    ? "group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-neutral-200 backdrop-blur transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
                    : "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-neutral-200 backdrop-blur transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
                }
              >
                <Icon className={isWeb ? "h-4 w-4" : "h-5 w-5"} />
                {isWeb && s.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
