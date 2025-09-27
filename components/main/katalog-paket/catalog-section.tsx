"use client";

import * as React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { axiosInstance } from "@/lib/axios-instance";

type ApiPackage = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  status: "success";
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: ApiPackage[];
};

type SortKey = "az" | "za" | "cheap" | "expensive";
type PriceFilter = "all" | "low" | "mid" | "high";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CatalogSection() {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("az");
  const [filter, setFilter] = React.useState<PriceFilter>("all");
  const [page, setPage] = React.useState(1);
  const perPage = 4;

  const [data, setData] = React.useState<ApiPackage[] | null>(null);
  const [meta, setMeta] = React.useState<ApiResponse["meta"] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedSearch = useDebounced(search, 350);

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { data: resp } = await axiosInstance.get<ApiResponse>(
          "/packages",
          {
            params: {
              page,
              limit: perPage,
              search: debouncedSearch || undefined,
              sort,
            },
            signal: controller.signal as any,
          }
        );
        setData(resp.data);
        setMeta(resp.meta);
      } catch (e: any) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setError(
            e?.response?.data?.message || e?.message || "Terjadi kesalahan"
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page, perPage, debouncedSearch, sort]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, filter]);

  const clientFiltered = React.useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      if (filter === "low") return p.price < 50_000_000;
      if (filter === "mid")
        return p.price >= 50_000_000 && p.price <= 100_000_000;
      if (filter === "high") return p.price > 100_000_000;
      return true;
    });
  }, [data, filter]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Input
          placeholder="Cari paket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3"
        />

        <div className="flex flex-wrap gap-3">
          <Select value={sort} onValueChange={(v: SortKey) => setSort(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A → Z</SelectItem>
              <SelectItem value="za">Z → A</SelectItem>
              <SelectItem value="cheap">Termurah</SelectItem>
              <SelectItem value="expensive">Termahal</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter}
            onValueChange={(v: PriceFilter) => setFilter(v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter harga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua harga</SelectItem>
              <SelectItem value="low">Di bawah 50jt</SelectItem>
              <SelectItem value="mid">50jt – 100jt</SelectItem>
              <SelectItem value="high">Di atas 100jt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: perPage }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-muted/40"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && data && clientFiltered.length === 0 && (
        <div className="rounded-lg border p-6 text-center text-[#8C8C8C]">
          Tidak ada paket yang cocok dengan filter saat ini.
        </div>
      )}

      {!loading && !error && clientFiltered.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clientFiltered.map((pkg) => (
              <div
                key={pkg.id}
                className="overflow-hidden rounded-lg shadow ring-1 ring-[#E6E6E6] transition hover:shadow-md"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={
                      pkg.imageUrl ||
                      "https://images.unsplash.com/photo-1521334726092-b509a19597c6?q=80&w=1740&auto=format&fit=crop"
                    }
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-sans text-base font-medium text-[#3E4638]">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#8C8C8C]">
                    {formatIDR(pkg.price)}{" "}
                    <span className="text-xs">
                      (≈ {Math.round(pkg.price / 1_000_000)} jt)
                    </span>
                  </p>
                  <Button className="mt-3 w-full rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]">
                    Pesan Sekarang
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.pageCount > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(p - 1, 1));
                      }}
                      className={
                        meta.page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: meta.pageCount }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={meta.page === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(p + 1, meta.pageCount));
                      }}
                      className={
                        meta.page === meta.pageCount
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </section>
  );
}
