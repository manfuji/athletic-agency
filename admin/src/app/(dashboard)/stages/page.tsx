import { fetchStages } from "@/actions/stages";
import { StagesPanel } from "@/components/reference/StagesPanel";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
  const stages = await fetchStages();

  return (
    <div className="w-full max-w-3xl px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-2xl text-[#1D2939]">Stages</h1>
      <p className="text-[#475467] font-inter mt-2 mb-6 text-sm">
        Match phases used when saving groups and creating fixtures (for example
        Group stage, Knockout).
      </p>
      <StagesPanel initialStages={stages} />
    </div>
  );
}
