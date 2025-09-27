"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { axiosInstance } from "@/lib/axios-instance";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

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

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
const OrderSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  telepon: z.string().regex(phoneRegex, "Nomor HP Indonesia tidak valid"),
  tanggal: z.date(),
  paketId: z.string().min(1, "Pilih paket"),
  venue: z.string().min(2, "Venue wajib diisi"),
  catatan: z
    .string()
    .max(1000, "Maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  setujuKebijakan: z.boolean().refine((v) => v === true, {
    message: "Anda harus menyetujui kebijakan privasi",
  }),
});
type OrderValues = z.infer<typeof OrderSchema>;

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function PackageCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debounced = useDebounced(query, 300);
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<ApiPackage[]>([]);
  const [meta, setMeta] = React.useState<ApiResponse["meta"] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fetchingMore, setFetchingMore] = React.useState(false);

  const selected = React.useMemo(
    () => items.find((p) => p.id === value) || null,
    [items, value]
  );

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get<ApiResponse>("/packages", {
          params: {
            page: 1,
            limit: 10,
            search: debounced || undefined,
            sort: "az",
          },
        });
        if (cancelled) return;
        setItems(data.data);
        setMeta(data.meta);
        setPage(1);
      } catch (e) {
        /* ignore: handled by outer form toast on submit */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const loadMore = React.useCallback(async () => {
    if (!meta?.hasNext) return;
    try {
      setFetchingMore(true);
      const nextPage = page + 1;
      const { data } = await axiosInstance.get<ApiResponse>("/packages", {
        params: {
          page: nextPage,
          limit: 10,
          search: debounced || undefined,
          sort: "az",
        },
      });
      setItems((prev) => [...prev, ...data.data]);
      setMeta(data.meta);
      setPage(nextPage);
    } finally {
      setFetchingMore(false);
    }
  }, [meta?.hasNext, page, debounced]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected
            ? `${selected.name} • ${formatIDR(selected.price)}`
            : "Pilih paket"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Cari paket…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat...
              </div>
            ) : (
              <>
                <CommandEmpty>Tidak ada paket.</CommandEmpty>
                <CommandGroup heading="Paket">
                  {items.map((pkg) => (
                    <CommandItem
                      key={pkg.id}
                      value={pkg.name}
                      onSelect={() => {
                        onChange(pkg.id);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{pkg.name}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {formatIDR(pkg.price)}
                      </span>
                      {value === pkg.id ? (
                        <Check className="ml-2 h-4 w-4" />
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <div className="p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    disabled={!meta?.hasNext || fetchingMore}
                    onClick={loadMore}
                  >
                    {fetchingMore ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat lagi...
                      </span>
                    ) : meta?.hasNext ? (
                      "Muat lebih banyak"
                    ) : (
                      "Sudah semua"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function OrderForm() {
  const [loading, setLoading] = React.useState(false);
  const form = useForm<OrderValues>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      nama: "",
      email: "",
      telepon: "",
      tanggal: undefined as unknown as Date,
      paketId: "",
      venue: "",
      catatan: "",
      setujuKebijakan: false,
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: OrderValues) => {
    setLoading(true);
    try {
      const payload = {
        packageId: values.paketId,
        customerName: values.nama,
        customerEmail: values.email,
        customerPhone: values.telepon,
        eventDate: values.tanggal.toISOString(),
        venue: values.venue,
        notes: values.catatan || undefined,
      };
      const { data } = await axiosInstance.post("/orders", payload);
      toast.success(`Pemesanan berhasil. Kode Anda: ${data?.data?.orderCode}`);
      form.reset({
        nama: "",
        email: "",
        telepon: "",
        tanggal: undefined as unknown as Date,
        paketId: "",
        venue: "",
        catatan: "",
        setujuKebijakan: false,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Terjadi kesalahan, coba lagi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
      <h3 className="font-display text-2xl font-semibold text-[#4E5A40] sm:text-3xl">
        Form Pemesanan
      </h3>
      <p className="mt-1 font-sans text-sm text-[#8C8C8C]">
        Lengkapi data berikut untuk memesan paket pernikahan Anda.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 grid grid-cols-1 gap-6"
        >
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Zidan Indratama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="zidan.indra@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telepon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. HP</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Acara</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-between text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                          type="button"
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: idLocale })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paketId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Paket</FormLabel>
                  <FormControl>
                    <PackageCombobox
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue</FormLabel>
                <FormControl>
                  <Input placeholder="Bekasi Convention Hall" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="catatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Preferensi konsep, waktu akad/resepsi, dll. (opsional)"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setujuKebijakan"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-lg border border-[#E6E6E6] p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Saya menyetujui kebijakan privasi JeWePe.
                  </FormLabel>
                  <FormDescription>
                    Data Anda hanya digunakan untuk proses pemesanan dan
                    konfirmasi.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="reset"
              variant="outline"
              onClick={() =>
                form.reset({
                  nama: "",
                  email: "",
                  telepon: "",
                  tanggal: undefined as unknown as Date,
                  paketId: "",
                  venue: "",
                  catatan: "",
                  setujuKebijakan: false,
                })
              }
              className="rounded-full"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Pemesanan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
