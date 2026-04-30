"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { fetchFixtureDetails } from "@/actions/fixtures";
import { submitResult, SubmitResultPayload } from "@/actions/results";
import { Fixture } from "@/types/fixtures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GoalTracker from "@/components/match-stats/GoalTracker";
import CardTracker from "@/components/match-stats/CardTracker";
import SubstitutionTracker from "@/components/match-stats/SubstitutionTracker";
import MatchStats from "@/components/match-stats/MatchStats";
import MatchLogsTable from "@/components/match-stats/MatchLogsTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";

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

interface ReportResultContentProps {
  fixture: Fixture;
  players: Player[];
  teams: Team[];
  fixtureId: string;
}

const tabData = [
  { id: "match-stats", label: "Match stats" },
  { id: "player-stats", label: "Player stats" },
];

export default function ReportResultContent({
  fixture: initialFixture,
  players,
  teams,
  fixtureId,
}: ReportResultContentProps) {
  const [activeTab, setActiveTab] = useState("match-stats");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Fetch fixture details query
  const { data: fixture = initialFixture } = useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: async () => {
      const res = await fetchFixtureDetails(fixtureId);
      if ("error" in res) return initialFixture;
      return res;
    },
    initialData: initialFixture,
  });

  const [homeScore, setHomeScore] = useState<number>(
    fixture.result?.home_team_score || 0
  );
  const [awayScore, setAwayScore] = useState<number>(
    fixture.result?.away_team_score || 0
  );

  // Update scores when fixture data changes
  useEffect(() => {
    if (fixture.result) {
      setHomeScore(fixture.result.home_team_score);
      setAwayScore(fixture.result.away_team_score);
    }
  }, [fixture]);

  // Submit result mutation
  const submitResultMutation = useMutation({
    mutationFn: async (payload: SubmitResultPayload) => {
      const response = await submitResult(payload);
      if ("error" in response) {
        const msg = response.error;
        throw new Error(
          typeof msg === "string" ? msg : "Error submitting result"
        );
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Result submitted successfully");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["fixture", fixtureId] });
      queryClient.invalidateQueries({ queryKey: ["matchLogs", fixtureId] });
      window.dispatchEvent(new Event("resultsUpdated"));
    },
    onError: (error: Error) => {
      console.error("Error submitting result:", error);
      toast.error(error.message || "Failed to submit result");
    },
  });

  const handleSubmitScore = async () => {
    const payload: SubmitResultPayload = {
      fixture_id: fixtureId,
      home_team_score: homeScore.toString(),
      away_team_score: awayScore.toString(),
    };

    if (homeScore > awayScore) {
      payload.winner_team_id = fixture.home_team.id;
    } else if (awayScore > homeScore) {
      payload.winner_team_id = fixture.away_team.id;
    }

    submitResultMutation.mutate(payload);
  };

  useEffect(() => {
    const activeIndex = tabData.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  const matchTitle = `${fixture.home_team.name} v ${fixture.away_team.name}`;
  const matchDate = new Date(fixture.match_date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  console.log(fixture);

  return (
    <div className="w-[85%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        {matchTitle}
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal mb-8">
        {matchDate} - Report result and stats
      </p>

      <div className="w-full">
        <div className="relative flex gap-6 border-b border-gray-200">
          {tabData.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1 text-[18px] font-inter ${
                activeTab === tab.id
                  ? "text-[#302464] font-medium"
                  : "text-[#475467]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <motion.div
            className="absolute bottom-0 h-[2px] bg-[#302464]"
            style={{ left: underlineStyle.left, width: underlineStyle.width }}
            initial={false}
            animate={{ left: underlineStyle.left, width: underlineStyle.width }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <div className="">
          {activeTab === "match-stats" && (
            <div className="p-6 rounded-lg relative">
              <Button
                className="absolute top-8 right-4 bg-[#302464] hover:bg-[#332579] text-white font-evogria"
                onClick={handleSubmitScore}
                disabled={submitResultMutation.isPending}
              >
                {submitResultMutation.isPending ? "Adding..." : "Add Score"}
              </Button>
              <div className="flex justify-center gap-8 items-center">
                <div className="flex flex-col justify-center items-center p-4">
                  <h3 className="font-evogria text-[20px] text-[#1D2939]">
                    {fixture.home_team.name}
                  </h3>
                  <p className="font-inter mb-2">Home</p>
                  <Input
                    type="text"
                    value={homeScore}
                    onChange={(e) =>
                      setHomeScore(parseInt(e.target.value) || 0)
                    }
                    className="w-24 mt-2 mb-2 py-7 text-center font-evogria !text-[40px] leading-[40px]"
                    min={0}
                    disabled={submitResultMutation.isPending}
                  />
                </div>
                <div className="flex flex-col justify-center items-center p-4">
                  <h3 className="font-evogria text-[20px] text-[#1D2939]">
                    {fixture.away_team.name}
                  </h3>
                  <p className="font-inter mb-2">Away</p>
                  <Input
                    type="text"
                    value={awayScore}
                    onChange={(e) =>
                      setAwayScore(parseInt(e.target.value) || 0)
                    }
                    className="w-24 mt-2 mb-2 py-7 text-center font-evogria !text-[40px] leading-[40px]"
                    min={0}
                    disabled={submitResultMutation.isPending}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "match-stats" && (
            <div className="mt-6">
              <div className="bg-white pl-4 pr-8 py-8 w-full rounded-md">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <GoalTracker players={players} fixtureId={fixtureId} />
                  </div>
                  <div className="flex-1">
                    <CardTracker players={players} fixtureId={fixtureId} />
                  </div>
                </div>
                <div className="mt-6 md:w-1/2">
                  <SubstitutionTracker
                    players={players}
                    teams={teams}
                    fixtureId={fixtureId}
                  />
                </div>
              </div>
              <div className="mt-20">
                <MatchLogsTable fixtureId={fixtureId} />
              </div>
            </div>
          )}

          {activeTab === "player-stats" && (
            <MatchStats fixtureId={fixtureId} players={players} />
          )}
        </div>
      </div>
    </div>
  );
}
