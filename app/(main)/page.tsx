import CtaSection from "@/components/main/cta-section";
import FeaturedShowcaseSection from "@/components/main/featured-showcase-section";
import HeroSection from "@/components/main/hero-section";
import PackagesSection from "@/components/main/packages-section";
import ServicesSection from "@/components/main/services-section";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import TestimonialsSection from "@/components/main/testimonials-section";
import React from "react";

const HomePage = () => {
  return (
    <div className="relative">
      <SiteNavbar />
      <HeroSection imageUrl={"./main/hero.png"} />
      <FeaturedShowcaseSection />
      <ServicesSection />
      <TestimonialsSection />
      <PackagesSection />
      <CtaSection />
      <SiteFooter />
    </div>
  );
};

export default HomePage;
