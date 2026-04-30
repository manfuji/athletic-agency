import { fetchNationalities } from "@/actions/nationalities";
import NationalitiesTable from "@/components/reference/NationalitiesTable";

export const dynamic = "force-dynamic";

export default async function NationalitiesPage() {
  const rows = await fetchNationalities();
  return (
    <div className="w-[100%] 2xl:w-[60%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Nationalities
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage nationality reference codes.
      </p>
      <div className="mt-6">
        <NationalitiesTable initialNationalities={rows} />
      </div>
    </div>
  );
}

