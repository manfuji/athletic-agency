import VideoVerificationTable from "@/components/quality/VideoVerificationTable";

export const dynamic = "force-dynamic";

export default function VideoVerificationPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Video Verification Log
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Review verification events and discrepancies.
      </p>
      <div className="mt-6">
        <VideoVerificationTable />
      </div>
    </div>
  );
}

