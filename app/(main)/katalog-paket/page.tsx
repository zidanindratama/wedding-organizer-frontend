import CatalogSection from "@/components/main/katalog-paket/catalog-section";
import HeroSection from "@/components/main/katalog-paket/hero-section";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import React from "react";

const CataloguePage = () => {
  return (
    <div className="relative">
      <SiteNavbar />
      <HeroSection imageUrl={"./main/hero.png"} />
      <CatalogSection />
      <SiteFooter />
    </div>
  );
};

export default CataloguePage;
