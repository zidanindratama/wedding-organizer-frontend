import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import HeroSection from "@/components/main/status-pemesanan/hero-section";
import OrderStatusChecker from "@/components/main/status-pemesanan/look-up-order";
import React from "react";

const OrderPage = () => {
  return (
    <div className="relative">
      <SiteNavbar />
      <HeroSection imageUrl={"./main/hero.png"} />
      <OrderStatusChecker />
      <SiteFooter />
    </div>
  );
};

export default OrderPage;
