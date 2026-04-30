import QaLogTable from "@/components/quality/QaLogTable";

export const dynamic = "force-dynamic";

export default function QaLogPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        QA Log
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Review audited edits and corrections.
      </p>
      <div className="mt-6">
        <QaLogTable />
      </div>
    </div>
  );
}

