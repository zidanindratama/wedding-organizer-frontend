"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { axiosInstance } from "@/lib/axios-instance";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type LoginValues = z.infer<typeof LoginSchema>;

type ApiResponse = {
  status: "success";
  data: {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "USER" | string;
    };
  };
};

export default function LoginForm({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password,
      };

      const { data } = await axiosInstance.post<ApiResponse>(
        "/auth/login",
        payload
      );

      const token = data?.data?.accessToken;
      const user = data?.data?.user;

      if (!token || !user) {
        throw new Error("Respon server tidak lengkap.");
      }

      if (user.role !== "ADMIN") {
        toast.error("Akses ditolak. Login ini hanya untuk Admin.");
        return;
      }

      Cookies.set("access_token", token, {
        expires: 7,
        sameSite: "lax",
      });
      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        sameSite: "lax",
      });

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;

      toast.success("Berhasil masuk sebagai Admin.");
      router.replace(redirectTo);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal login. Periksa email/password Anda.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mb-10 max-w-md rounded-2xl border border-[#E6E6E6] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-2 inline-flex items-center gap-2 text-[#4E5A40]">
        <ShieldCheck className="h-5 w-5" />
        <span className="font-alt text-xs">Login khusus Admin</span>
      </div>

      <h3 className="font-display text-2xl font-semibold text-[#4E5A40] sm:text-3xl">
        Masuk Admin
      </h3>
      <p className="mt-1 font-sans text-sm text-[#8C8C8C]">
        Masukkan kredensial Admin Anda untuk mengelola sistem.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 grid grid-cols-1 gap-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@jewepe.test"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#3D3D3D]/70 hover:bg-[#F8F8F8]"
                      aria-label={
                        showPass ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      {showPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="reset"
              variant="outline"
              onClick={() => form.reset({ email: "", password: "" })}
              className="rounded-full"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
