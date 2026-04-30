import { fetchPositions } from "@/actions/positions";
import PositionsTable from "@/components/reference/PositionsTable";

export const dynamic = "force-dynamic";

export default async function PositionsPage() {
  const positions = await fetchPositions();
  return (
    <div className="w-[100%] 2xl:w-[60%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Positions
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage position codes used for players and bio data.
      </p>
      <div className="mt-6">
        <PositionsTable initialPositions={positions} />
      </div>
    </div>
  );
}

