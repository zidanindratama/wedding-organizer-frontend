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
import { Loader2, MailCheck, RotateCcw, RefreshCw } from "lucide-react";
import { axiosInstance } from "@/lib/axios-instance";

type ContactStatus = "NEW" | "READ";

type ApiContact = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt?: string;
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
  data: ApiContact[];
};

type SortKey =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc";

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced as T;
}

function formatDateShort(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}

export default function ContactManager() {
  const [items, setItems] = React.useState<ApiContact[]>([]);
  const [meta, setMeta] = React.useState<ApiResponse["meta"] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [status, setStatus] = React.useState<ContactStatus | "ALL">("ALL");
  const [query, setQuery] = React.useState("");
  const q = useDebounced(query, 350);

  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit, sort };
      if (q) params.q = q;
      if (status !== "ALL") params.status = status;

      const { data } = await axiosInstance.get<ApiResponse>("/contacts", {
        params,
      });

      setItems(data.data);
      setMeta(data.meta);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Gagal memuat kontak.";
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

  async function onUpdateStatus(id: string, newStatus: ContactStatus) {
    setUpdatingId(id);
    try {
      await axiosInstance.patch(`/contacts/${id}/status`, {
        status: newStatus,
      });
      toast.success("Status kontak diperbarui.");
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal memperbarui status kontak.";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  }

  const StatusBadge = ({ value }: { value: ContactStatus }) => {
    if (value === "READ") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Dibaca
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Baru
      </Badge>
    );
  };

  return (
    <Card className="border-[#E6E6E6]">
      <CardHeader>
        <CardTitle className="text-[#3E4638]">Kelola Kontak</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Cari nama/email/pesan…"
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
                setStatus(v as ContactStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="NEW">Baru</SelectItem>
                <SelectItem value="READ">Dibaca</SelectItem>
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
                <SelectItem value="name_asc">Nama A → Z</SelectItem>
                <SelectItem value="name_desc">Nama Z → A</SelectItem>
                <SelectItem value="email_asc">Email A → Z</SelectItem>
                <SelectItem value="email_desc">Email Z → A</SelectItem>
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
              onClick={load}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Muat Ulang
                </span>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Dikirim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-56" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[28rem]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#8C8C8C]">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-[#3E4638]">
                      {c.name}
                    </TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="max-w-[36rem]">
                      <div className="text-sm text-[#3E4638] line-clamp-2">
                        {c.message}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateShort(c.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge value={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Tandai Dibaca */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => onUpdateStatus(c.id, "READ")}
                          disabled={updatingId === c.id || c.status === "READ"}
                          title="Tandai Dibaca"
                        >
                          {updatingId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MailCheck className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Kembalikan ke Baru */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => onUpdateStatus(c.id, "NEW")}
                          disabled={updatingId === c.id || c.status === "NEW"}
                          title="Kembalikan ke Baru"
                        >
                          {updatingId === c.id ? (
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

        {/* Footer / Pagination */}
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
