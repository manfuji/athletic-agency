import { redirect } from "next/navigation";
import CompetitionSetupWrapper from "@/components/competitions/competition-setup/CompetitionSetupWrapper";
import { getImageUrl } from "@/lib/api";
import { getCompetitionById } from "@/actions/competitions";
import { getAllTeamsForCompetition, fetchTeamDetails } from "@/actions/teams";
import { getFixtures } from "@/actions/fixtures";
import { CompetitionForForm } from "@/components/competitions/competition-setup/SetupCompetition";
import { getServerAppSession } from "@/lib/auth/server-session";
import { ensureArray, teamDetailsPlayerCount } from "@/lib/normalize";

export default async function CompetitionSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerAppSession();
  const userRole = session?.user?.role;
  const { id } = await params;

  if (userRole === "collator") {
    redirect(`/setup-competition/${id}/results-and-standings`);
  }

  try {
    const [comp, allTeams, fixturesData] = await Promise.all([
      getCompetitionById(id),
      getAllTeamsForCompetition(id),
      getFixtures(id),
    ]);

    const mappedCompetition: CompetitionForForm = {
      id: comp.id,
      title: comp.title,
      startDate: comp.start_date,
      endDate: comp.end_date,
      description: comp.description,
      category: comp.category_id,
      image: getImageUrl(comp.banner) || "",
      structureId: comp.structure_id,
      location: comp.location,
      competitionType: comp.competition_type_id,
    };

    const teamDetailsPromises = allTeams.map((team) =>
      fetchTeamDetails(team.id)
    );
    const teamDetailsList = await Promise.all(teamDetailsPromises);
    const hasPlayers = teamDetailsList.some(
      (teamDetails) => teamDetailsPlayerCount(teamDetails) > 0
    );

    const hasFixtures = Object.values(fixturesData).some(
      (matches) => ensureArray(matches).length > 0
    );

    const stepCompletion = {
      basicDetails: true,
      structure: !!comp.structure_id,
      registration: allTeams.length > 0 && hasPlayers,
      fixtures: hasFixtures,
      start: comp.status === "started" || comp.status === "ended",
    };
    const completedSteps = Object.values(stepCompletion).filter(Boolean).length;
    const progress = completedSteps * 20;

    return (
      <div className="w-[85%] ml-0 px-4 py-6 mx-auto">
        <CompetitionSetupWrapper
          competitionId={id}
          initialCompetition={mappedCompetition}
          initialStepCompletion={stepCompletion}
          initialCompletedSteps={completedSteps}
          initialProgress={progress}
          initialSelectedStructure={comp.structure_id}
          initialCompetitionStatus={comp.status}
          initialIsPublished={comp.isPublished === 1}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return (
      <div className="w-[85%] ml-0 px-4 py-6 mx-auto">
        <CompetitionSetupWrapper competitionId={id} />
      </div>
    );
  }
}
