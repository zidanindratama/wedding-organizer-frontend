"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type FeaturedItem = {
  title: string;
  location: string;
  description: string;
  href?: string;
  image: string;
};

const SAMPLE_DATA: FeaturedItem[] = [
  {
    title: "Paket Elegant",
    location: "Jakarta",
    description:
      "Paket Elegant menghadirkan konsep pernikahan modern dengan dekorasi mewah, layanan profesional, dan suasana eksklusif yang akan membuat hari istimewa Anda semakin berkesan...",
    href: "#",
    image:
      "https://plus.unsplash.com/premium_photo-1664790560155-eeef67a1e77c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Paket Garden",
    location: "Bogor",
    description:
      "Nikmati suasana romantis di tengah taman hijau dengan dekorasi alami dan layanan lengkap untuk pernikahan outdoor impian Anda.",
    href: "#",
    image:
      "https://plus.unsplash.com/premium_photo-1664790560123-c5f839457591?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Paket Luxury",
    location: "Bali",
    description:
      "Sebuah pengalaman pernikahan kelas atas dengan dekorasi eksklusif, venue premium, serta layanan personal yang dirancang khusus untuk Anda.",
    href: "#",
    image:
      "https://plus.unsplash.com/premium_photo-1673626578328-d72e1e75202b?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function FeaturedShowcaseSection({
  items = SAMPLE_DATA,
  title = "Paket Unggulan",
}: {
  items?: FeaturedItem[];
  title?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const total = items.length;
  const current = items[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="font-display text-3xl font-semibold text-[#4E5A40] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 font-sans text-sm text-[#8C8C8C] sm:text-base">
        pilihan terbaik untuk hari bahagia Anda
      </p>

      <div className="overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white shadow-sm mt-10">
        <div className="grid grid-cols-1 md:grid-cols-[44%_1fr]">
          <div className="relative h-64 w-full md:h-[420px]">
            <Image
              src={current.image}
              alt={current.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="flex min-h-64 flex-col justify-between">
            <div className="px-6 pb-6 pt-6 sm:px-8 sm:pt-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-alt text-[#A9B3A1]">
                <span className="font-medium text-[#4E5A40]">{index + 1}</span>
                <span>/ {total}</span>
              </div>

              <h4 className="font-display text-[28px] leading-tight text-[#4E5A40] sm:text-[30px]">
                {current.title}
              </h4>
              <p className="mt-1 text-sm font-sans text-[#8C8C8C]">
                {current.location}
              </p>

              <p className="mt-4 max-w-3xl font-sans text-[15px] leading-7 text-[#3D3D3D]">
                {current.description}{" "}
                {current.href && (
                  <Link
                    href={current.href}
                    className="ml-1 inline-flex items-center text-[#4E5A40] underline-offset-2 hover:underline"
                  >
                    Lihat detail
                  </Link>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#E6E6E6] px-4 py-3 sm:px-6">
              <button
                onClick={prev}
                className="
                  inline-flex h-10 w-10 items-center justify-center rounded-full
                  border border-[#E6E6E6] text-[#3D3D3D] hover:bg-[#F8F8F8]
                  active:bg-[#E6E6E6]/60 transition
                "
                aria-label="Sebelumnya"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                onClick={next}
                className="
                  inline-flex h-10 w-10 items-center justify-center rounded-full
                  border border-[#E6E6E6] text-[#3D3D3D] hover:bg-[#F8F8F8]
                  active:bg-[#E6E6E6]/60 transition
                "
                aria-label="Berikutnya"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
