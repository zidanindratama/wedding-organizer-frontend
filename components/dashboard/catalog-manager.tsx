"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import { axiosInstance } from "@/lib/axios-instance";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type ApiError = {
  message?: string;
};

type SortKey = "az" | "za" | "cheap" | "expensive";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = React.useState<T>(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CatalogManager() {
  const [items, setItems] = React.useState<ApiPackage[]>([]);
  const [meta, setMeta] = React.useState<ApiResponse["meta"] | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [sort, setSort] = React.useState<SortKey>("az");
  const [query, setQuery] = React.useState("");
  const q = useDebounced(query, 350);

  const [openDelete, setOpenDelete] = React.useState(false);
  const [target, setTarget] = React.useState<ApiPackage | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get<ApiResponse>(
        "/packages/admin/all",
        { params: { page, limit, sort, search: q || undefined } }
      );
      setItems(data.data);
      setMeta(data.meta);
    } catch (e: unknown) {
      const err = e as AxiosError<ApiError>;
      const msg =
        err.response?.data?.message ??
        err.message ??
        "Gagal memuat katalog paket.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onChangeSort = (v: SortKey) => {
    setSort(v);
    setPage(1);
  };

  const onChangeLimit = (v: string) => {
    setLimit(Number(v));
    setPage(1);
  };

  const next = () => meta?.hasNext && setPage((p) => p + 1);
  const prev = () => meta?.hasPrev && setPage((p) => Math.max(1, p - 1));

  const askDelete = (p: ApiPackage) => {
    setTarget(p);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/packages/${target.id}`);
      toast.success("Paket berhasil dihapus.");
      setOpenDelete(false);
      setTarget(null);
      await load();
    } catch (e: unknown) {
      const err = e as AxiosError<ApiError>;
      const msg =
        err.response?.data?.message ?? err.message ?? "Gagal menghapus paket.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-[#E6E6E6]">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[#3E4638]">Katalog Paket</CardTitle>
          <Button
            className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
            size="sm"
            asChild
          >
            <Link href={"/dashboard/katalog/tambah"}>Tambah Paket</Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama/desk…"
                className="w-full sm:w-72"
              />
              <Select
                value={sort}
                onValueChange={(v) => onChangeSort(v as SortKey)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">A → Z</SelectItem>
                  <SelectItem value="za">Z → A</SelectItem>
                  <SelectItem value="cheap">Termurah</SelectItem>
                  <SelectItem value="expensive">Termahal</SelectItem>
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
                size="sm"
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paket</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-16 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-44" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                        </div>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-[#8C8C8C]"
                    >
                      Tidak ada paket.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded-lg border border-[#E6E6E6] bg-[#F8F8F8]">
                            <img
                              src={p.imageUrl || "/placeholder.png"}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-[#3E4638]">
                              {p.name}
                            </div>
                            {p.description ? (
                              <div className="text-xs text-[#8C8C8C] line-clamp-1">
                                {p.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatIDR(p.price)}
                      </TableCell>
                      <TableCell>
                        {p.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            asChild
                          >
                            <Link href={`/dashboard/katalog/${p.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => askDelete(p)}
                            disabled={deleting}
                          >
                            {deleting && target?.id === p.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
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

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus paket ini?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-sm text-muted-foreground">
            {target ? (
              <>
                Paket <span className="font-semibold">{target.name}</span> akan
                dihapus permanen.
              </>
            ) : null}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghapus…
                </span>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
