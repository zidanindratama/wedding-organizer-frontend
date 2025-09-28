// components/dashboard/katalog/catalog-create-form.tsx
"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosInstance } from "@/lib/axios-instance";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const CreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().int().positive("Harga harus > 0"),
  isActive: z.boolean().default(true),
  imageUrl: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
});

type CreateInput = z.input<typeof CreateSchema>;

type ApiError = { message?: string };

type Props = {
  onCreated?: () => void;
  className?: string;
};

export default function CatalogCreateForm({ onCreated, className }: Props) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<CreateInput>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      isActive: true,
      imageUrl: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: CreateInput) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        price: values.price,
        isActive: values.isActive,
        imageUrl: values.imageUrl?.trim() || undefined,
      };
      await axiosInstance.post("/packages", payload);
      toast.success("Paket berhasil ditambahkan.");
      form.reset({
        name: "",
        description: "",
        price: 0,
        isActive: true,
        imageUrl: "",
      });
      onCreated?.();
      router.push("/dashboard");
    } catch (e: unknown) {
      const err = e as AxiosError<ApiError>;
      const msg =
        err.response?.data?.message ?? err.message ?? "Gagal menambah paket.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`my-40 w-full max-w-3xl mx-auto px-4 ${className ?? ""}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#3E4638]">Tambah Paket Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Paket</FormLabel>
                    <FormControl>
                      <Input placeholder="Silver Glam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga (IDR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        placeholder="15000000"
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Tanpa titik/koma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/silver.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Opsional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paket simple dan elegan"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-[#E6E6E6] p-3">
                    <div>
                      <FormLabel>Status</FormLabel>
                      <FormDescription>
                        Aktifkan paket di katalog.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-2 flex items-center justify-end gap-2">
                <Button
                  type="reset"
                  variant="outline"
                  className="rounded-full"
                  disabled={loading}
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan…
                    </span>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
