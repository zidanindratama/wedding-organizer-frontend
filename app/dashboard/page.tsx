import AdminShell from "@/components/dashboard/admin-shell";
import AdminTabs from "@/components/dashboard/admin-tabs";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";
import React from "react";

const DashboardHomePage = () => {
  return (
    <>
      <div className="mb-10">
        <SiteNavbar />
      </div>
      <AdminShell>
        <AdminTabs />
      </AdminShell>
      <SiteFooter />
    </>
  );
};

export default DashboardHomePage;
