import LegacyTableManager from "@/components/legacy/LegacyTableManager";

export const dynamic = "force-dynamic";

export default function LegacyGoalkeeperStatsPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Legacy Goalkeeper Stats
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        View and edit `goalkeeper_stats` rows (audited).
      </p>
      <div className="mt-6">
        <LegacyTableManager table="goalkeeper_stats" />
      </div>
    </div>
  );
}

