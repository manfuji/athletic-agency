import { fetchTeams, fetchTeamDetails } from '@/actions/teams';
import { getImageUrl } from '@/lib/api';
import { columns, TeamType } from '@/lib/team/columns';
import { DataTable } from '@/lib/team/data-table';
import { redirect } from 'next/navigation';
import { Team } from '@/types/teams';

export default async function CompetitionTeamsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const competitionId = resolvedParams.id;

  if (!competitionId) {
    redirect('/setup-competition');
  }

  let initialTeams: TeamType[] = [];
  let initialPageCount = 1;
  let perPage = 10;

  try {
    const initialResponse = await fetchTeams(competitionId, 1);
    initialTeams = await Promise.all(
      initialResponse.data.map(async (team: Team) => {
        const teamDetails = await fetchTeamDetails(team.id);
        return {
          id: team.id,
          name: team.name,
          code: team.shortCode,
          icon: getImageUrl(team.logo) || '/Avatar.png',
          players: teamDetails.players.length,
          joined: new Date(team.created_at),
          slug: team.slug,
        };
      })
    );
    initialPageCount = initialResponse.last_page;
    perPage = initialResponse.per_page;
  } catch (error) {
    console.error(
      `Failed to fetch teams for competition ${competitionId}:`,
      error
    );
    return (
      <div className="w-[85%] px-4 py-6 ml-0 mr-auto">
        <div>
          <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
            Teams
          </h1>
          <p className="font-inter text-[16px] text-[#475467] font-normal">
            Create teams participating in the competition
          </p>
        </div>
        <div className="mt-4 text-red-600 font-inter">
          No teams found for this competition. Please add teams to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="w-[85%] px-4 py-6 ml-0 mr-auto">
      <div>
        <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
          Teams
        </h1>
        <p className="font-inter text-[16px] text-[#475467] font-normal">
          Create teams participating in the competition
        </p>
      </div>
      <DataTable
        columns={columns}
        data={initialTeams}
        competitionId={competitionId}
        initialPageCount={initialPageCount}
        perPage={perPage}
      />
    </div>
  );
}
