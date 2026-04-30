import ReportResultContent from '../ReportResultContent';
import { fetchFixtureDetails } from '@/actions/fixtures';
import {fetchTeamDetails} from '@/actions/teams'
import { Fixture } from '@/types/fixtures';
interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}

interface Team {
  id: string;
  name: string;
}

export default async function ReportResultPage({
  params,
}: {
  params: Promise<{ id: string; fixtureId: string }>;
}) {
  const { fixtureId } = await params;

  // Fetch data server-side
  const fixtureData = await fetchFixtureDetails(fixtureId) as Fixture;
  const homeTeamDetails = await fetchTeamDetails(fixtureData.home_team.id);
  const awayTeamDetails = await fetchTeamDetails(fixtureData.away_team.id);

  const players: Player[] = [
    ...homeTeamDetails.players.map((player: Player) => ({
      id: player.id,
      name: player.name,
      teamId: homeTeamDetails.id,
      teamName: homeTeamDetails.name,
    })),
    ...awayTeamDetails.players.map((player: Player) => ({
      id: player.id,
      name: player.name,
      teamId: awayTeamDetails.id,
      teamName: awayTeamDetails.name,
    })),
  ];

  const teams: Team[] = [
    { id: homeTeamDetails.id, name: homeTeamDetails.name },
    { id: awayTeamDetails.id, name: awayTeamDetails.name },
  ];

  return (
    <ReportResultContent
      fixture={fixtureData}
      players={players}
      teams={teams}
      fixtureId={fixtureId}
    />
  );
}
