"use client";

import axios from "axios";
import Cookies from "js-cookie";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const DEV_URL = "http://localhost:3001/api/v1";
export const PROD_URL = "https://backend-gunakarir.vercel.app/api/v1";

const axiosInstance = axios.create({
  baseURL: DEV_URL,
  withCredentials: true,
});

type PackageItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

type PackagesResponse = {
  status: "success";
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: PackageItem[];
};

function currency(idr?: number) {
  if (idr == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(idr);
}

export default function PackagesSection() {
  const [items, setItems] = React.useState<PackageItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    axiosInstance
      .get<PackagesResponse>("/packages", {
        params: { page: 1, limit: 8, sort: "az" },
      })
      .then((res) => {
        if (!mounted) return;
        setItems(res.data?.data ?? []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Gagal memuat paket.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold text-[#4E5A40] sm:text-4xl">
          Paket Pernikahan
        </h2>
        <p className="mt-2 font-sans text-sm text-[#8C8C8C] sm:text-base">
          Pilihan paket terbaik untuk mewujudkan hari bahagia Anda
        </p>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="h-40 animate-pulse rounded-lg bg-gray-200/60"
            />
          ))}

        {!loading &&
          items.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/katalog-paket/${pkg.id}`}
              className="group relative block overflow-hidden rounded-lg shadow transition hover:shadow-md"
            >
              <Image
                src={
                  pkg.imageUrl ||
                  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop"
                }
                alt={pkg.name}
                width={400}
                height={250}
                className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
              <div className="absolute bottom-3 left-3 z-10">
                <p className="font-sans text-sm text-white sm:text-base">
                  {pkg.name}
                </p>
                <p className="text-xs text-white/80">{currency(pkg.price)}</p>
              </div>
            </Link>
          ))}

        <Link
          href="/katalog-paket"
          className="flex h-40 items-center justify-center rounded-lg bg-[#4E5A40] text-white transition hover:bg-[#3E4638]"
        >
          <span className="flex items-center gap-2 font-sans text-sm sm:text-base">
            Lihat lebih banyak <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
