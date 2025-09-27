"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

type Testimonial = {
  quote: string;
  author: string;
  image: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Tim JeWePe benar-benar membantu kami dari awal hingga akhir. Semua detail diperhatikan, hasilnya jauh melebihi ekspektasi kami!",
    author: "Rani & Dimas",
    image:
      "https://images.unsplash.com/photo-1521566652839-697aa473761a?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    quote:
      "Prosesnya rapi dan komunikatif. Hari-H berjalan lancar, kami tinggal menikmati momen. Terima kasih JeWePe!",
    author: "Maya & Andra",
    image:
      "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    quote:
      "Dekorasi, tata acara, hingga dokumentasi—semuanya cakep. Keluarga dan tamu banyak yang memuji. Highly recommended!",
    author: "Ayu & Farhan",
    image:
      "https://images.unsplash.com/photo-1527493324787-47372b893452?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
];

export default function TestimonialsSection({
  items = TESTIMONIALS,
  title = "Testimoni",
  subtitle = "dari pasangan yang bahagia",
}: {
  items?: Testimonial[];
  title?: string;
  subtitle?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const total = items.length;
  const current = items[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <section className="relative w-full bg-[#4E5A40] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center text-white">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 font-sans text-sm text-[#C4CCBC] sm:text-base">
          {subtitle}
        </p>

        <div className="relative mt-10">
          <Quote
            className="absolute -left-6 top-0 h-8 w-8 text-white/20 sm:-left-10 sm:h-10 sm:w-10"
            aria-hidden
          />
          <Quote
            className="absolute -right-6 bottom-0 h-8 w-8 rotate-180 text-white/20 sm:-right-10 sm:h-10 sm:w-10"
            aria-hidden
          />

          <p className="font-sans text-[15px] leading-7 sm:text-base">
            {current.quote}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative h-14 w-14 overflow-hidden rounded-full">
            <Image
              src={current.image}
              alt={`Foto ${current.author}`}
              fill
              className="object-cover"
            />
          </div>
          <p className="mt-2 font-alt text-sm text-white">{current.author}</p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={prev}
            aria-label="Sebelumnya"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white/80 hover:bg-white/10 active:bg-white/20 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Berikutnya"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white/80 hover:bg-white/10 active:bg-white/20 transition"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-white/70">
          {index + 1} / {total}
        </p>
      </div>
    </section>
  );
}
