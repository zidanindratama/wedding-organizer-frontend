import ContactForm from "@/components/main/kontak/contact-form";
import HeroSection from "@/components/main/kontak/hero-section";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import React from "react";

const ContactPage = () => {
  return (
    <div className="relative">
      <SiteNavbar />
      <HeroSection imageUrl={"./main/hero.png"} />
      <ContactForm />
      <SiteFooter />
    </div>
  );
};

export default ContactPage;
