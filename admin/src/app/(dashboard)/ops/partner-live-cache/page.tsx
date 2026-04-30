import OpsTableManager from "@/components/ops/OpsTableManager";

export const dynamic = "force-dynamic";

export default function PartnerLiveCachePage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Partner Live Cache
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Inspect cached partner live data (read/update via JSON editor).
      </p>
      <div className="mt-6">
        <OpsTableManager table="partner_live_cache" />
      </div>
    </div>
  );
}

