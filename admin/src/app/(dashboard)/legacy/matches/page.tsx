import LegacyTableManager from "@/components/legacy/LegacyTableManager";

export const dynamic = "force-dynamic";

export default function LegacyMatchesPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Legacy Matches
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        View and edit legacy `matches` records (audited to `qa_log`).
      </p>
      <div className="mt-6">
        <LegacyTableManager table="matches" />
      </div>
    </div>
  );
}

