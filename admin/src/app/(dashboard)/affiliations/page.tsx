import { fetchAffiliations } from "@/actions/affiliations";
import AffiliationsTable from "@/components/reference/AffiliationsTable";

export const dynamic = "force-dynamic";

export default async function AffiliationsPage() {
  const rows = await fetchAffiliations();
  return (
    <div className="w-[100%] 2xl:w-[60%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Affiliations
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage affiliations referenced by bio data.
      </p>
      <div className="mt-6">
        <AffiliationsTable initialAffiliations={rows} />
      </div>
    </div>
  );
}

