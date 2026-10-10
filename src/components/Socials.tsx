"use client";

import Link from "next/link";
import Starfield from "./Starfield";
import { XIcon, InstagramIcon } from "./BrandIcons";

const ACCENT = "#38bdf8";

const SOCIALS = [
  { label: "X", href: "https://x.com/boredDOTworks", Icon: XIcon },
  { label: "Instagram", href: "https://instagram.com/bored.works", Icon: InstagramIcon },
];

/**
 * Socials — closing page with the brand and official channels.
 * Dark, starry background to match the worlds, accent in sky blue to tie in
 * with the univers-o planet.
 */
export default function Socials() {
  return (
    <section className="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden bg-[#07070a] px-6">
      {/* starry background */}
      <Starfield />

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        {/* brand — blue dot on this page only */}
        <div className="font-display mb-8 flex items-center justify-center gap-2 text-4xl text-white sm:text-5xl">
          <span>bored</span>
          <span style={{ color: ACCENT }}>·</span>
          <span>works</span>
        </div>

        <p className="mx-auto max-w-xl text-2xl font-medium leading-snug text-white">
          A home for imagination
        </p>
        <p className="mt-3 text-base leading-relaxed text-neutral-400">
          because every world starts somewhere.
        </p>

        {/* socials */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {SOCIALS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              target={href !== "#" ? "_blank" : undefined}
              rel="noreferrer"
              aria-label={label}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-neutral-200 backdrop-blur transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
