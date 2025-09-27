import CatalogUpdateForm from "@/components/dashboard/katalog/catalog-update-form";
import SiteFooter from "@/components/main/site-footer";
import SiteNavbar from "@/components/main/site-navbar";

export default async function DashboardUpdateCatalogue({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <div className="mb-10">
        <SiteNavbar />
      </div>
      <CatalogUpdateForm id={id} />
      <SiteFooter />
    </>
  );
}
