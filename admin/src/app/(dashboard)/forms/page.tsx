import FormsManager from "@/components/forms/FormsManager";

export const dynamic = "force-dynamic";

export default function FormsPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Data Forms
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Create private admin forms or public forms that require authentication to submit.
      </p>
      <div className="mt-6">
        <FormsManager />
      </div>
    </div>
  );
}
