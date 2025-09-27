"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";

export default function HeroSection({
  imageUrl = "/main/hero.png",
}: {
  imageUrl?: string;
}) {
  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={imageUrl}
          alt="JeWePe Wedding Organizer"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-44 text-center sm:pt-52">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#4E5A40] sm:text-4xl md:text-5xl lg:text-6xl">
          Rayakan Momen Spesial
          <br />
          bersama{" "}
          <span className="text-[#4E5A40]">JeWePe Wedding Organizer</span>
        </h1>

        <p className="mt-6 font-sans text-sm leading-relaxed text-[#8C8C8C] sm:text-base">
          Dari perencanaan hingga hari-H, kami siap mendampingi setiap langkah
          Anda. Temukan paket pernikahan terbaik yang sesuai dengan impian dan
          gaya Anda.
        </p>

        <div className="mt-14 flex flex-col items-center gap-3 font-alt text-xs text-[#8C8C8C]">
          <ArrowDown className="h-5 w-5 animate-bounce" />
          <span>Scroll ke bawah</span>
        </div>
      </div>

      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-[-1px] left-1/2 -z-10 h-[120px] w-[140%] -translate-x-1/2 fill-[#FFFFFF]"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
      >
        <path d="M0,80 C200,160 400,0 720,80 C1040,160 1240,0 1440,80 L1440,160 L0,160 Z" />
      </svg>
    </section>
  );
}
