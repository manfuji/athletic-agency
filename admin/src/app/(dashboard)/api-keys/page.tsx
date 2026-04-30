import ApiKeysManager from "@/components/api-keys/ApiKeysManager";

export const dynamic = "force-dynamic";

export default function ApiKeysPage() {
  return (
    <div className="w-[98%] px-4 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        API Keys
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Generate and manage API keys. Raw keys are shown only once at creation time.
      </p>
      <div className="mt-6">
        <ApiKeysManager />
      </div>
    </div>
  );
}

