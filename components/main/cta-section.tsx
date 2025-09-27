"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="relative w-full py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-3xl font-semibold leading-tight text-[#3E4638] sm:text-4xl">
          Siap merencanakan pernikahan impian Anda?
        </h2>
        <p className="mt-4 font-sans text-base text-[#4E5A40]/80 sm:text-lg">
          Biarkan kami mengurus setiap detail, agar Anda bisa menikmati setiap
          momen berharga tanpa khawatir.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            className="rounded-full bg-[#4E5A40] px-6 py-2 text-white hover:bg-[#3E4638]"
            asChild
          >
            <Link href={"/pemesanan-paket"}>Mulai Pesan</Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full border border-[#4E5A40] px-6 py-2 text-[#4E5A40] hover:bg-[#4E5A40] hover:text-white"
            asChild
          >
            <Link href={"/kontak"}>Hubungi Kami</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
