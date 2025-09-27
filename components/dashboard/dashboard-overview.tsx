"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OverviewCard from "./overview-card";
import { axiosInstance } from "@/lib/axios-instance";
import { Loader2, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SummaryData = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};
type SummaryResponse = { status: "success"; data: SummaryData };

type RevenueData = {
  revenueThisMonth: number;
  avgOrderValueThisMonth: number;
  ordersThisMonth: number;
};
type RevenueResponse = { status: "success"; data: RevenueData };

type TopPackage = {
  packageId: string;
  name?: string;
  count: number;
  revenue: number;
};
type TopPackagesResponse = { status: "success"; data: TopPackage[] };

type ApiError = {
  message?: string;
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardOverview() {
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<SummaryData | null>(null);
  const [revenue, setRevenue] = React.useState<RevenueData | null>(null);
  const [topPkgs, setTopPkgs] = React.useState<TopPackage[] | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, revRes, topRes] = await Promise.all([
        axiosInstance.get<SummaryResponse>("/reports/orders/summary"),
        axiosInstance.get<RevenueResponse>("/reports/revenue/summary"),
        axiosInstance.get<TopPackagesResponse>("/reports/packages/top", {
          params: { limit: 3 },
        }),
      ]);
      setSummary(sumRes.data.data);
      setRevenue(revRes.data.data);
      setTopPkgs(topRes.data.data);
    } catch (e: unknown) {
      const err = e as AxiosError<ApiError>;
      const msg =
        err.response?.data?.message ??
        err.message ??
        "Gagal memuat data dashboard.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const total = summary?.total ?? "—";
  const pending = summary?.pending ?? "—";
  const approved = summary?.approved ?? "—";
  const revenueThisMonth =
    revenue?.revenueThisMonth != null
      ? formatIDR(revenue.revenueThisMonth)
      : "—";

  return (
    <div className="grid gap-6">
      {loading && !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-[#E6E6E6]">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20" />
                <div className="mt-2">
                  <Skeleton className="h-3 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard title="Total Pesanan" value={total} subtitle="—" />
          <OverviewCard
            title="Menunggu Review"
            value={pending}
            subtitle="Butuh tindakan"
          />
          <OverviewCard
            title="Disetujui"
            value={approved}
            subtitle="7 hari terakhir"
          />
          <OverviewCard
            title="Pendapatan (IDR)"
            value={revenueThisMonth}
            subtitle="Bulan ini"
          />
        </div>
      )}

      <Card className="border-[#E6E6E6]">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[#3E4638] mb-2">Laporan Cepat</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={load}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Muat Ulang
                </span>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="text-sm">
          {!topPkgs && loading ? (
            <div className="grid gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : topPkgs && topPkgs.length > 0 ? (
            <div className="grid gap-2">
              {topPkgs.map((p) => (
                <div
                  key={p.packageId}
                  className="flex items-center justify-between"
                >
                  <span className="text-[#3E4638]">
                    {p.name ?? "Tanpa Nama"}
                  </span>
                  <span className="text-[#8C8C8C]">
                    {p.count}x • {formatIDR(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#8C8C8C]">Belum ada data paket teratas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
