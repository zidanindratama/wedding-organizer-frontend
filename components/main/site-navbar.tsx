"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Facebook,
  Instagram,
  Twitter,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios-instance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog-paket", label: "Katalog Paket" },
  { href: "/pemesanan-paket", label: "Pemesanan" },
  { href: "/status-pemesanan", label: "Status Pesanan" },
  { href: "/kontak", label: "Kontak" },
];

type UserCookie = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

export default function SiteNavbar() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserCookie>(null);

  React.useEffect(() => {
    try {
      const raw = Cookies.get("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] ?? "";

  const initials = React.useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || "U";
  }, [user?.name]);

  const handleLogout = React.useCallback(() => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    if (axiosInstance?.defaults?.headers?.common?.Authorization) {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
    setUser(null);
    toast.success("Berhasil logout.");
    router.replace("/");
  }, [router]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div
          className="
            mt-2 flex items-center justify-between rounded-2xl
            border border-[#E6E6E6]/60 bg-white/70 px-3 py-2.5
            backdrop-blur-md shadow-sm
            md:mt-4 md:px-4 md:py-3
          "
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 shrink-0"
            aria-label="JeWePe Wedding Organizer"
          >
            <span
              className="
                grid h-8 w-8 place-items-center rounded-full border border-[#E6E6E6]
                bg-white text-[13px] font-bold text-[#3E4638] shadow-sm
                transition-transform duration-200 group-hover:scale-105 font-display
              "
            >
              WO
            </span>
            <span className="sr-only">JeWePe Wedding Organizer</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-alt text-[#4E5A40]">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="
                  relative transition-colors
                  hover:text-[#3E4638]
                  after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0
                  after:bg-[#4E5A40]/70 after:transition-all after:duration-200
                  hover:after:w-full
                "
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <IconLink ariaLabel="Instagram" href="#kontak">
              <Instagram className="h-4 w-4" />
            </IconLink>
            <IconLink ariaLabel="Facebook" href="#kontak">
              <Facebook className="h-4 w-4" />
            </IconLink>
            <IconLink ariaLabel="Twitter" href="#kontak">
              <Twitter className="h-4 w-4" />
            </IconLink>
            <Separator orientation="vertical" className="mx-1 h-6" />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="
                      inline-flex items-center gap-2 rounded-full border border-[#E6E6E6]
                      bg-white px-2.5 py-1.5 hover:bg-[#F8F8F8] transition
                    "
                    aria-label="Menu pengguna"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-[#4E5A40]/10 text-[#3E4638]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-alt text-sm text-[#3E4638]">
                      {firstName || "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-[#8C8C8C]">
                    {user.email}
                  </div>
                  <Separator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  className="
                    rounded-full px-5
                    bg-white text-[#4E5A40] border border-[#4E5A40]/60 shadow-sm
                    hover:bg-[#F8F8F8]
                  "
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>

                <Button
                  className="
                    rounded-full px-5
                    bg-[#4E5A40] text-white shadow-sm
                    hover:bg-[#3E4638]
                  "
                  asChild
                >
                  <Link href="/pemesanan-paket">Pesan sekarang</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="
                    rounded-xl h-10 w-10
                    border-[#E6E6E6] text-[#3D3D3D]
                    hover:bg-[#F8F8F8]
                  "
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[85%] sm:w-80 p-0 border-l border-[#E6E6E6]"
              >
                <SheetHeader className="px-5 pb-0 pt-5">
                  <SheetTitle className="font-display text-[22px] text-[#3E4638]">
                    Menu
                  </SheetTitle>
                </SheetHeader>

                {user && (
                  <div className="mx-4 mt-3 mb-2 flex items-center justify-between rounded-xl border border-[#E6E6E6] bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#4E5A40]/10 text-[#3E4638]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="font-alt text-sm text-[#3E4638]">
                          {firstName}
                        </div>
                        <div className="text-[11px] text-[#8C8C8C]">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-1.5 h-4 w-4" />
                      <span className="text-xs">Logout</span>
                    </Button>
                  </div>
                )}

                <nav className="mt-2 grid gap-1">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="
                        block px-5 py-3.5
                        text-[15px] font-alt text-[#4E5A40]
                        hover:bg-[#F8F8F8]
                        active:bg-[#E6E6E6]/60
                      "
                    >
                      {l.label}
                    </Link>
                  ))}

                  {!user ? (
                    <>
                      <div className="px-5 pt-3">
                        <Button
                          className="
                            w-full rounded-full
                            bg-white text-[#4E5A40] border border-[#4E5A40]/60
                            hover:bg-[#F8F8F8]
                          "
                          asChild
                        >
                          <Link href="/login">Login</Link>
                        </Button>
                      </div>
                      <div className="px-5 py-3">
                        <Button
                          className="
                            w-full rounded-full
                            bg-[#4E5A40] text-white
                            hover:bg-[#3E4638]
                          "
                          asChild
                        >
                          <Link href="/pemesanan-paket">Pesan sekarang</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="px-5 py-3">
                      <Button
                        className="
                          w-full rounded-full
                          bg-[#4E5A40] text-white
                          hover:bg-[#3E4638]
                        "
                        asChild
                      >
                        <Link href="/admin">Ke Dashboard</Link>
                      </Button>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex items-center gap-1.5 px-4 pb-5">
                    <IconLink ariaLabel="Instagram" href="#kontak" size="lg">
                      <Instagram className="h-5 w-5" />
                    </IconLink>
                    <IconLink ariaLabel="Facebook" href="#kontak" size="lg">
                      <Facebook className="h-5 w-5" />
                    </IconLink>
                    <IconLink ariaLabel="Twitter" href="#kontak" size="lg">
                      <Twitter className="h-5 w-5" />
                    </IconLink>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function IconLink({
  href,
  ariaLabel,
  children,
  size = "md",
}: {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  const pad = size === "lg" ? "p-2.5" : "p-2";
  return (
    <Link
      aria-label={ariaLabel}
      href={href}
      className={`
        inline-flex items-center justify-center rounded-full border
        ${pad}
        border-[#E6E6E6] text-[#3D3D3D]/80 transition
        hover:text-[#3D3D3D] hover:bg-[#F8F8F8]
        active:bg-[#E6E6E6]/60
      `}
    >
      {children}
    </Link>
  );
}
