"use client";

import Image from "next/image";
import React from "react";

type Service = {
  title: string;
  image: string;
  href?: string;
};

const SERVICES: Service[] = [
  {
    title: "Fotografi & Videografi",
    image:
      "https://plus.unsplash.com/premium_photo-1675979807697-24195c443a7f?q=80&w=1006&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    title: "Dekorasi & Tata Acara",
    image:
      "https://plus.unsplash.com/premium_photo-1677483429797-7c5ac1dea50e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    title: "Perencanaan Pernikahan",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1748&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
];

export default function ServicesSection({
  title = "Layanan Kami",
  subtitle = "Membantu Anda merencanakan dan mewujudkan pernikahan impian dengan sempurna",
  items = SERVICES,
}: {
  title?: string;
  subtitle?: string;
  items?: Service[];
}) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-[#F8F8F8] px-6 py-10 sm:px-10 sm:py-14">
        <CurvyDecor className="pointer-events-none absolute inset-0 -z-10" />

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#4E5A40] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 whitespace-pre-line font-sans text-sm text-[#8C8C8C] sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <article
                key={s.title}
                className="
                  group overflow-hidden rounded-xl bg-white shadow
                  ring-1 ring-[#E6E6E6] transition-shadow hover:shadow-md
                "
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="px-4 py-3">
                  <h3 className="text-center font-sans text-[15px] text-[#3D3D3D]">
                    {s.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CurvyDecor({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M-20 220C200 290 310 90 520 150C730 210 840 410 1210 280"
        stroke="#A9B3A1"
        strokeWidth="2"
        opacity="0.5"
      />
      <path
        d="M-30 110C180 60 350 260 560 200C770 140 900 -10 1220 120"
        stroke="#C4CCBC"
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  );
}
