"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardOverview from "./dashboard-overview";
import CatalogManager from "./catalog-manager";
import OrdersManager from "./orders-manager";
import ContactManager from "./contact-manager";

export default function AdminTabs() {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur border border-[#E6E6E6]/60 rounded-xl">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="catalog">Katalog</TabsTrigger>
        <TabsTrigger value="orders">Pesanan</TabsTrigger>
        <TabsTrigger value="contacts">Kontak</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="dashboard" className="m-0">
          <DashboardOverview />
        </TabsContent>
        <TabsContent value="catalog" className="m-0">
          <CatalogManager />
        </TabsContent>
        <TabsContent value="orders" className="m-0">
          <OrdersManager />
        </TabsContent>
        <TabsContent value="contacts" className="m-0">
          <ContactManager />
        </TabsContent>
      </div>
    </Tabs>
  );
}
