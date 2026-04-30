import TabbedResults from "@/components/results/TabbedResults";

import { getFixtures } from "@/actions/fixtures";

export default async function CompetitionResultsAndStandingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fixturesData = await getFixtures(id);
  return (
    <div className="w-[85%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] mb-10 font-normal">
        Results / Standings
      </h1>
      {/* TODO: Add type for fixturesData */}
      {/* @ts-expect-error - fixturesData is not typed */}
      <TabbedResults competitionId={id} fixtures={fixturesData} />
    </div>
  );
}
