"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios-instance";

type OrderStatus = "PENDING" | "APPROVED" | "REJECTED";

type ApiOrder = {
  id: string;
  orderCode: string;
  packageId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string | null;
  venue: string | null;
  status: OrderStatus;
  totalPrice: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  package?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
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
  data: ApiOrder[];
};

type SortKey =
  | "newest"
  | "oldest"
  | "event_asc"
  | "event_desc"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateISO(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: undefined,
  }).format(date);
}

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced as T;
}

/** Helper: download Blob + parse filename dari Content-Disposition */
function downloadBlob(
  blob: Blob,
  fallbackName = "orders.csv",
  contentDisposition?: string
) {
  let filename = fallbackName;
  if (contentDisposition) {
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(
      contentDisposition
    );
    if (m) {
      filename = decodeURIComponent(m[1] || m[2]);
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersManager() {
  const [items, setItems] = React.useState<ApiOrder[]>([]);
  const [meta, setMeta] = React.useState<ApiResponse["meta"] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [status, setStatus] = React.useState<OrderStatus | "ALL">("ALL");
  const [query, setQuery] = React.useState("");
  const q = useDebounced(query, 350);

  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit, sort };
      if (q) params.q = q;
      if (status !== "ALL") params.status = status;

      const { data } = await axiosInstance.get<ApiResponse>("/orders", {
        params,
      });

      setItems(data.data);
      setMeta(data.meta);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Gagal memuat pesanan.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, q, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  const next = () => meta?.hasNext && setPage((p) => p + 1);
  const prev = () => meta?.hasPrev && setPage((p) => Math.max(1, p - 1));

  const onChangeLimit = (v: string) => {
    setLimit(Number(v));
    setPage(1);
  };

  async function onUpdateStatus(id: string, newStatus: OrderStatus) {
    setUpdatingId(id);
    try {
      await axiosInstance.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success("Status pesanan diperbarui.");
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Gagal memperbarui status.";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  }

  /** Export CSV dari backend (GET /reports/orders/export/csv) */
  const exportCSV = async () => {
    setExporting(true);
    try {
      const res = await axiosInstance.get("/reports/orders/export/csv", {
        responseType: "blob",
      });
      const blob = res.data as Blob;
      const cd = res.headers["content-disposition"] as string | undefined;
      downloadBlob(blob, "orders.csv", cd);
      toast.success("CSV berhasil diunduh.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Gagal mengekspor CSV.";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  const StatusBadge = ({ value }: { value: OrderStatus }) => {
    if (value === "APPROVED") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Disetujui
        </Badge>
      );
    }
    if (value === "REJECTED") {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
          Ditolak
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Menunggu
      </Badge>
    );
  };

  return (
    <Card className="border-[#E6E6E6]">
      <CardHeader>
        <CardTitle className="text-[#3E4638]">Kelola Pesanan</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Cari kode/nama/email…"
              className="w-full sm:w-72"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as OrderStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="APPROVED">Disetujui</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as SortKey);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="event_asc">Tanggal Acara ↑</SelectItem>
                <SelectItem value="event_desc">Tanggal Acara ↓</SelectItem>
                <SelectItem value="price_asc">Total Termurah</SelectItem>
                <SelectItem value="price_desc">Total Termahal</SelectItem>
                <SelectItem value="name_asc">Nama A → Z</SelectItem>
                <SelectItem value="name_desc">Nama Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={String(limit)} onValueChange={onChangeLimit}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Per halaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={exportCSV}
              disabled={exporting}
            >
              {exporting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengekspor…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={load}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat…
                </span>
              ) : (
                "Muat Ulang"
              )}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-52" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#8C8C8C]">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderCode}</TableCell>
                    <TableCell>
                      <div className="leading-tight">
                        <div className="text-[#3E4638] font-medium">
                          {o.customerName}
                        </div>
                        <div className="text-xs text-[#8C8C8C]">
                          {o.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="leading-tight">
                        <div className="text-[#3E4638]">
                          {o.package?.name ?? "—"}
                        </div>
                        <div className="text-xs text-[#8C8C8C]">
                          {o.venue || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateISO(o.eventDate)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatIDR(o.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={o.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => onUpdateStatus(o.id, "APPROVED")}
                          disabled={
                            updatingId === o.id || o.status === "APPROVED"
                          }
                          title="Setujui"
                        >
                          {updatingId === o.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => onUpdateStatus(o.id, "REJECTED")}
                          disabled={
                            updatingId === o.id || o.status === "REJECTED"
                          }
                          title="Tolak"
                        >
                          {updatingId === o.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => onUpdateStatus(o.id, "PENDING")}
                          disabled={
                            updatingId === o.id || o.status === "PENDING"
                          }
                          title="Kembalikan ke Menunggu"
                        >
                          {updatingId === o.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-sm text-[#8C8C8C]">
            {meta
              ? `Menampilkan ${items.length} dari ${meta.total} data • Halaman ${meta.page}/${meta.pageCount}`
              : "—"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              size="sm"
              disabled={!meta?.hasPrev}
              onClick={prev}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              size="sm"
              disabled={!meta?.hasNext}
              onClick={next}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
