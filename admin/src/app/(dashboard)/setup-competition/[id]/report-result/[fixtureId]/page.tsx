import ReportResultContent from '../ReportResultContent';
import { fetchFixtureDetails } from '@/actions/fixtures';
import { fetchTeamDetails } from '@/actions/teams';
import { Fixture } from '@/types/fixtures';
import { ensureArray } from '@/lib/normalize';
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

  const home =
    homeTeamDetails &&
    typeof homeTeamDetails === "object" &&
    !("error" in homeTeamDetails)
      ? (homeTeamDetails as {
          id: string;
          name: string;
          players?: unknown;
        })
      : {
          id: fixtureData.home_team.id,
          name:
            "name" in fixtureData.home_team &&
            typeof fixtureData.home_team.name === "string"
              ? fixtureData.home_team.name
              : "",
          players: [] as { id: string; name: string }[],
        };

  const away =
    awayTeamDetails &&
    typeof awayTeamDetails === "object" &&
    !("error" in awayTeamDetails)
      ? (awayTeamDetails as {
          id: string;
          name: string;
          players?: unknown;
        })
      : {
          id: fixtureData.away_team.id,
          name:
            "name" in fixtureData.away_team &&
            typeof fixtureData.away_team.name === "string"
              ? fixtureData.away_team.name
              : "",
          players: [] as { id: string; name: string }[],
        };

  const homePlayersList = ensureArray<{ id: string; name: string }>(home.players);
  const awayPlayersList = ensureArray<{ id: string; name: string }>(away.players);

  const players: Player[] = [
    ...homePlayersList.map((player) => ({
      id: player.id,
      name: player.name,
      teamId: home.id,
      teamName: home.name,
    })),
    ...awayPlayersList.map((player) => ({
      id: player.id,
      name: player.name,
      teamId: away.id,
      teamName: away.name,
    })),
  ];

  const teams: Team[] = [
    { id: home.id, name: home.name },
    { id: away.id, name: away.name },
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
