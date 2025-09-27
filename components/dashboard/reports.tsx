"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function ReportsPage() {
  return (
    <Card className="border-[#E6E6E6]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[#3E4638]">Laporan Pesanan</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            Export Excel
          </Button>
          <Button className="rounded-full bg-[#4E5A40] text-white hover:bg-[#3E4638]">
            Export PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input placeholder="Cari..." className="w-full sm:w-64" />
            <Input type="date" className="w-full sm:w-44" />
            <Input type="date" className="w-full sm:w-44" />
          </div>
          <Button variant="outline" className="rounded-full">
            Terapkan
          </Button>
        </div>

        <Separator />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#8C8C8C]">
                  Belum ada data. (Nanti diisi dari API)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
