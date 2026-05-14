import { getCompetitionStructures } from "@/actions/competitions";
import { StructuresPanel } from "@/components/reference/StructuresPanel";

export const dynamic = "force-dynamic";

export default async function StructuresPage() {
  const list = await getCompetitionStructures();

  return (
    <div className="w-full max-w-3xl px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-2xl text-[#1D2939]">Competition structures</h1>
      <p className="text-[#475467] font-inter mt-2 mb-6 text-sm">
        Formats available when setting up a competition (linked from the setup
        wizard).
      </p>
      <StructuresPanel initialStructures={Array.isArray(list) ? list : []} />
    </div>
  );
}
