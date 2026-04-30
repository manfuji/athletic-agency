"use client";

import { leadershipBoardTabs } from "@/lib/loops";
import Goals from "./goals";
import Assists from "./assists";
import YellowCards from "./yellow-cards";
import RedCards from "./red-card";
import useLeadershipBoard from "@/hooks/use-leadership-board";
import Loading from "./skeleton";
import { useParams, usePathname } from "next/navigation";
import AnimationsWrapper from "../animations/animations-wrapper";
import { useState, useTransition } from "react";

export default function LeadershipBoard() {
  const [activeTab, setActiveTab] = useState(leadershipBoardTabs[0]);
  const [isPending, startTransition] = useTransition();

  const params = useParams<{ slug: string, competitionSlug: string }>();
  const teamSlug = params?.slug;
  const competitionSlug = params?.competitionSlug

  const pathname = usePathname();

  const path = pathname.split("/")?.[1];

  const { data: response, isLoading } = useLeadershipBoard(
    path,
    teamSlug,
    competitionSlug,
    activeTab
  );

  const statsData = response?.data ?? [];

  return (
    <div>
      <AnimationsWrapper variant="slideUp" scrollTrigger>
        <div className="flex items-center gap-x-5 border-b-2 border-gray-400">
          {leadershipBoardTabs.map((tab, i) => (
            <div
              onClick={() => startTransition(() => setActiveTab(tab))}
              key={i}
              className={`font-evogria cursor-pointer text-xs sm:text-sm md:text-lg 2xl:text-sm  text-center py-2 -mb-[1.8px] ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-[#767676]"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
      </AnimationsWrapper>

      {(isLoading || isPending) && <Loading />}
      {!isLoading && !isPending && (
        <div>
          {activeTab === leadershipBoardTabs[0] && (
            <Goals goals={statsData as GoalStats[]} />
          )}
          {activeTab === leadershipBoardTabs[1] && (
            <Assists assists={statsData as AssistStats[]} />
          )}
          {activeTab === leadershipBoardTabs[2] && (
            <YellowCards yellowCards={statsData as YellowCardStats[]} />
          )}
          {activeTab === leadershipBoardTabs[3] && (
            <RedCards redCards={statsData as RedCardStats[]} />
          )}
        </div>
      )}
    </div>
  );
}
