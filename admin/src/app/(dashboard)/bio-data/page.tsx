import BioDataTable from "@/components/bio-data/BioDataTable";

export const dynamic = "force-dynamic";

export default async function BioDataPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Bio Data
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage legacy player records and link them to the new Players system.
      </p>
      <div className="mt-6">
        <BioDataTable />
      </div>
    </div>
  );
}

