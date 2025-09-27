"use client";

import * as React from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const token = Cookies.get("access_token");
    const user = Cookies.get("user");

    if (!token || !user) {
      const next =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="flex items-center gap-3 text-sm text-[#8C8C8C]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#4E5A40] border-t-transparent" />
          Memeriksa sesi…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-24">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#4E5A40] sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 font-sans text-sm text-[#8C8C8C]">
          Kelola katalog, pesanan, dan laporan JeWePe.
        </p>
      </div>
      {children}
    </div>
  );
}
