import CatalogCreateForm from "@/components/dashboard/katalog/catalog-create-form";
import SiteNavbar from "@/components/main/site-navbar";
import React from "react";

const DashboardCreateCatalogue = () => {
  return (
    <>
      <div className="mb-10">
        <SiteNavbar />
      </div>
      <CatalogCreateForm className="border-[#E6E6E6]" />
    </>
  );
};

export default DashboardCreateCatalogue;
