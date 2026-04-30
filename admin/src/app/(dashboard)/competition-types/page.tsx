export const dynamic = "force-dynamic";

import CompetitionTypesHeader from "@/components/competition-types/competition-types-header";
import CompetitionTypesTable from "@/components/competition-types/competition-types-table";
import { fetchCompetitionTypes } from "@/actions/competiton-types";

export default async function CompetitionTypes() {
  const competitionTypes = await fetchCompetitionTypes();
  return (
    <div className="w-[100%] px-4 py-6 ml-0 mr-auto">
      <CompetitionTypesHeader />
      <CompetitionTypesTable initialCompetitionTypes={competitionTypes} />
    </div>
  );
}
