import {
  getCompetitionTopAssists,
  getCompetitionTopRedCards,
  getCompetitionTopScorers,
  getCompetitionTopYellowCards,
} from "@/actions/competition";
import {
  getTeamTopAssists,
  getTeamTopRedCards,
  getTeamTopScorers,
  getTeamTopYellowCards,
} from "@/actions/team";
import { leadershipBoardTabs } from "@/lib/loops";
import useSwr from "swr";

export default function useLeadershipBoard(
  path: string,
  teamSlug: string,
  competitionSlug: string,
  activeTab: string
) {
  const isTeamProfile = path === "team-profile";

  const { data, error, isLoading } = useSwr(
    `${activeTab}-${path}` ? `${activeTab}-${path}` : null,
    async () => {
      const fetchFunction = LEADERBOARD_FUNCTIONS[activeTab];
      return typeof fetchFunction === "function"
        ? await fetchFunction()
        : fetchFunction;
    },
    { revalidateOnMount: true }
  );

  const LEADERBOARD_FUNCTIONS: Record<
    string,
    () => Promise<{ data: StatsType[] }>
  > = {
    [leadershipBoardTabs[0]]: isTeamProfile
      ? () => getTeamTopScorers(teamSlug)
      : () => getCompetitionTopScorers(competitionSlug),
    [leadershipBoardTabs[1]]: isTeamProfile
      ? () => getTeamTopAssists(teamSlug)
      : () => getCompetitionTopAssists(competitionSlug),
    [leadershipBoardTabs[2]]: isTeamProfile
      ? () => getTeamTopYellowCards(teamSlug)
      : () => getCompetitionTopYellowCards(competitionSlug),
    [leadershipBoardTabs[3]]: isTeamProfile
      ? () => getTeamTopRedCards(teamSlug)
      : () => getCompetitionTopRedCards(competitionSlug),
  };

  return {
    data,
    isLoading,
    error,
  };
}
