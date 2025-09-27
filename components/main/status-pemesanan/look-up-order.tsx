"use client";

import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  Search,
  Loader2,
  Mail,
  Hash,
  PackageCheck,
  CalendarDays,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios-instance";

type OrderStatus = "MENUNGGU_KONFIRMASI" | "DIKONFIRMASI" | "DIBATALKAN";

type OrderDetail = {
  orderCode: string;
  packageName: string;
  eventDate?: string;
  customerName?: string;
  email?: string;
  total?: number;
  paid?: number;
  status: OrderStatus;
  steps: Array<{
    key: Extract<OrderStatus, "MENUNGGU_KONFIRMASI" | "DIKONFIRMASI">;
    label: string;
  }>;
};

type BackendOrder = {
  id: string;
  orderCode: string;
  packageId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string | null;
  venue?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  totalPrice: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  package?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    MENUNGGU_KONFIRMASI: {
      label: "Menunggu Konfirmasi",
      className:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200",
    },
    DIKONFIRMASI: {
      label: "Dikonfirmasi",
      className:
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200",
    },
    DIBATALKAN: {
      label: "Dibatalkan",
      className:
        "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200",
    },
  };
  const item = map[status];
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </Badge>
  );
}

const codeSchema = z.object({
  orderCode: z.string().min(6, "Minimal 6 karakter").max(32).trim(),
});
const emailSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
});

function currency(idr?: number) {
  if (idr == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(idr);
}

function stepProgress(steps: OrderDetail["steps"], status: OrderStatus) {
  if (status === "DIBATALKAN") return 0;
  const idx = steps.findIndex((s) => s.key === status);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / steps.length) * 100);
}

function mapBackendStatus(s: BackendOrder["status"]): OrderStatus {
  switch (s) {
    case "PENDING":
      return "MENUNGGU_KONFIRMASI";
    case "APPROVED":
      return "DIKONFIRMASI";
    case "REJECTED":
      return "DIBATALKAN";
    default:
      return "MENUNGGU_KONFIRMASI";
  }
}

function toDetail(o: BackendOrder): OrderDetail {
  const steps: OrderDetail["steps"] = [
    { key: "MENUNGGU_KONFIRMASI", label: "Menunggu Konfirmasi" },
    { key: "DIKONFIRMASI", label: "Dikonfirmasi" },
  ];
  return {
    orderCode: o.orderCode,
    packageName: o.package?.name ?? "Paket",
    eventDate: o.eventDate ?? undefined,
    customerName: o.customerName,
    email: o.customerEmail,
    total: o.totalPrice,
    paid: undefined,
    status: mapBackendStatus(o.status),
    steps,
  };
}

async function lookupOrderByCode(code: string): Promise<OrderDetail | null> {
  const { data } = await axiosInstance.get<{
    status: "success";
    meta?: unknown;
    data: BackendOrder[];
  }>("/orders/check", { params: { code, page: 1, limit: 1 } });
  if (!data?.data?.length) return null;
  return toDetail(data.data[0]);
}

async function lookupOrdersByEmail(email: string): Promise<OrderDetail[]> {
  const { data } = await axiosInstance.get<{
    status: "success";
    meta?: unknown;
    data: BackendOrder[];
  }>("/orders/check", { params: { email, page: 1, limit: 50 } });
  return (data?.data ?? []).map(toDetail);
}

export default function OrderStatusChecker() {
  const [mode, setMode] = useState<"code" | "email">("code");
  const [loading, setLoading] = useState(false);

  // untuk pencarian by code -> satu detail
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  // untuk pencarian by email -> list hasil
  const [list, setList] = useState<OrderDetail[]>([]);

  const [error, setError] = useState<string | null>(null);

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { orderCode: "" },
  });
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  async function onSubmitCode(values: z.infer<typeof codeSchema>) {
    setLoading(true);
    setError(null);
    setDetail(null);
    setList([]); // clear list
    try {
      const res = await lookupOrderByCode(values.orderCode);
      if (!res) throw new Error("Data pesanan tidak ditemukan.");
      setDetail(res);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Terjadi kesalahan, coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitEmail(values: z.infer<typeof emailSchema>) {
    setLoading(true);
    setError(null);
    setDetail(null); // clear single detail
    setList([]);
    try {
      const rows = await lookupOrdersByEmail(values.email);
      if (!rows.length)
        throw new Error("Tidak ada pesanan untuk email tersebut.");
      setList(rows);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Terjadi kesalahan, coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 mb-10">
      <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-display text-2xl font-semibold text-[#4E5A40] sm:text-3xl">
          Cek Status Pemesanan
        </h3>
        <p className="mt-1 font-sans text-sm text-[#8C8C8C]">
          Gunakan{" "}
          <span className="font-medium text-foreground">Kode Pemesanan</span>{" "}
          atau <span className="font-medium text-foreground">Email</span> yang
          digunakan saat pemesanan.
        </p>

        <div className="mt-6">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as "code" | "email");
              // reset state saat ganti tab
              setError(null);
              setDetail(null);
              setList([]);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="code"
                className="data-[state=active]:bg-[#4E5A40] data-[state=active]:text-white"
              >
                <Hash className="mr-2 h-4 w-4" />
                Kode Pemesanan
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="data-[state=active]:bg-[#4E5A40] data-[state=active]:text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="mt-6">
              <Form {...codeForm}>
                <form
                  onSubmit={codeForm.handleSubmit(onSubmitCode)}
                  className="grid gap-4 sm:grid-cols-[1fr_auto]"
                >
                  <FormField
                    control={codeForm.control}
                    name="orderCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pemesanan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: F4E98EF2C683"
                            className="focus-visible:ring-[#4E5A40]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Cek Status
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                  className="grid gap-4 sm:grid-cols-[1fr_auto]"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="zidan.indra@example.com"
                            className="focus-visible:ring-[#4E5A40]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Cek Status
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-6">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Gagal</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
          <h4 className="font-display text-xl font-semibold text-[#4E5A40]">
            Memuat status…
          </h4>
          <p className="mt-1 text-sm text-[#8C8C8C]">Mohon tunggu sebentar.</p>
          <div className="mt-4">
            <Progress value={35} className="h-2" />
          </div>
        </div>
      )}

      {/* MODE: KODE -> tampilkan detail tunggal */}
      {detail && !loading && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display flex items-center gap-2 text-[#4E5A40] text-xl font-semibold">
                <PackageCheck className="h-5 w-5" />
                {detail.packageName}
              </div>
              <div className="mt-1 text-sm text-[#8C8C8C]">
                Kode:{" "}
                <span className="font-medium text-foreground">
                  {detail.orderCode}
                </span>
              </div>
            </div>
            <StatusBadge status={detail.status} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Tanggal Acara
              </div>
              <div className="mt-1 text-base font-semibold">
                {detail.eventDate
                  ? new Date(detail.eventDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ReceiptText className="h-4 w-4" />
                Ringkasan Pembayaran
              </div>
              <div className="mt-1 text-base font-semibold">
                {currency(detail.paid)} / {currency(detail.total)}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Atas Nama
              </div>
              <div className="mt-1 text-base font-semibold">
                {detail.customerName ?? "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {detail.email ?? "-"}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Progress
            </div>
            <Progress
              value={stepProgress(detail.steps, detail.status)}
              className="h-2"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {detail.steps.map((s) => {
                const active = s.key === detail.status;
                return (
                  <Badge
                    key={s.key}
                    variant={active ? "default" : "outline"}
                    className={
                      active
                        ? "rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
                        : "rounded-full border-[#4E5A40]/30 text-[#4E5A40]"
                    }
                  >
                    {s.label}
                  </Badge>
                );
              })}
              {detail.status === "DIBATALKAN" && (
                <Badge
                  variant="outline"
                  className="rounded-full border-[#4E5A40]/30 text-[#4E5A40]"
                >
                  (Dibatalkan)
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE: EMAIL -> tampilkan LIST hasil */}
      {list.length > 0 && !loading && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4">
            <h4 className="font-display text-xl font-semibold text-[#4E5A40]">
              Hasil Pencarian ({list.length})
            </h4>
            <p className="text-sm text-[#8C8C8C]">
              Menampilkan pesanan yang terdaftar pada email tersebut.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((o) => (
                  <TableRow key={o.orderCode}>
                    <TableCell className="font-medium">{o.orderCode}</TableCell>
                    <TableCell>{o.packageName}</TableCell>
                    <TableCell>
                      {o.eventDate
                        ? new Date(o.eventDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {currency(o.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-[#8C8C8C]"
                    >
                      Tidak ada data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
