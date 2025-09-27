import HeroSection from "@/components/login/hero-section";
import LoginForm from "@/components/login/login-form";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import React from "react";

const LoginPage = () => {
  return (
    <div>
      <SiteNavbar />
      <HeroSection />
      <LoginForm />
      <SiteFooter />
    </div>
  );
};

export default LoginPage;
