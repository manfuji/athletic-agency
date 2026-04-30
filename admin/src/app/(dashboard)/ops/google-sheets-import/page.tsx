import OpsTableManager from "@/components/ops/OpsTableManager";

export const dynamic = "force-dynamic";

export default function GoogleSheetsImportPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Google Sheets Import
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Monitor Google Sheets import records.
      </p>
      <div className="mt-6">
        <OpsTableManager table="google_sheets_import" />
      </div>
    </div>
  );
}

