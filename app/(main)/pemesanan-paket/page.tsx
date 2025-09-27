import HeroSection from "@/components/main/pemesanan-paket/hero-section";
import OrderForm from "@/components/main/pemesanan-paket/order-form";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import React from "react";

const OrderPage = () => {
  return (
    <div className="relative">
      <SiteNavbar />
      <HeroSection imageUrl={"./main/hero.png"} />
      <OrderForm />
      <SiteFooter />
    </div>
  );
};

export default OrderPage;
