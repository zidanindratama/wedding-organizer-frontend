"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverviewCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card className="border-[#E6E6E6]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[#8C8C8C]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[#3E4638]">{value}</div>
        {subtitle ? (
          <p className="mt-1 text-xs text-[#8C8C8C]">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
