import OpsTableManager from "@/components/ops/OpsTableManager";

export const dynamic = "force-dynamic";

export default function DraftPicksOpsPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Draft Picks
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage draft picks (audited edits).
      </p>
      <div className="mt-6">
        <OpsTableManager table="draft_picks" />
      </div>
    </div>
  );
}

