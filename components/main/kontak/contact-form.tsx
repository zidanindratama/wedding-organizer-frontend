// components/contact/contact-form.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios-instance";

const ContactSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Terlalu panjang"),
  email: z.string().email("Email tidak valid").max(160, "Terlalu panjang"),
  message: z
    .string()
    .min(10, "Pesan minimal 10 karakter")
    .max(1000, "Maksimal 1000 karakter"),
});

type ContactValues = z.infer<typeof ContactSchema>;

export default function ContactForm() {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: ContactValues) {
    setLoading(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      };

      const { data } = await axiosInstance.post("/contacts", payload);

      toast.success(
        data?.data?.id
          ? `Pesan terkirim! ID: ${data.data.id}`
          : "Pesan terkirim! Kami akan membalas via email."
      );
      form.reset({ name: "", email: "", message: "" });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Gagal mengirim pesan.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
      <h3 className="font-display text-2xl font-semibold text-[#4E5A40] sm:text-3xl">
        Kirim Pesan
      </h3>
      <p className="mt-1 font-sans text-sm text-[#8C8C8C]">
        Isi formulir di bawah ini. Tim kami akan menghubungi Anda secepatnya.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 grid grid-cols-1 gap-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Calon Pengantin"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="cp@example.com"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pesan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Halo, saya ingin tanya tentang paket Gold."
                    className="min-h-[120px]"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="reset"
              variant="outline"
              onClick={() => form.reset()}
              className="rounded-full"
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
            >
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
